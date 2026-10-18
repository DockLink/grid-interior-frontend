"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "@/lib/api/client";
import { clearActivity, isInactiveTooLong, recordActivity } from "@/lib/auth/activity";
import { getDevBypassSession, isAuthDisabled } from "@/lib/auth/dev-bypass";
import { notifySessionExpired } from "@/lib/auth/session-expiry";
import { getPrimaryRole, hasAnyRole } from "@/lib/auth/rbac";
import { toAuthSession, toPersistedSession } from "@/lib/auth/sessions";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { ApiError } from "@/types/api";
import type { AuthState } from "@/types/auth";
import type { LoginResponse } from "@/types/auth";
import type { User, UserRole } from "@/types/users";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      isHydrated: false,

      login: async (email: string, password: string) => {
        if (isAuthDisabled()) {
          set({ isLoading: true });
          await new Promise((resolve) => setTimeout(resolve, 800));
          set({ session: getDevBypassSession(email), isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });

          set({
            session: toAuthSession(response),
            isLoading: false,
          });
          // Fresh login counts as activity; start the inactivity window now.
          recordActivity(true);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        if (isAuthDisabled()) {
          set({ session: getDevBypassSession() });
          return;
        }

        // Cookie is sent with the request; the route revokes the session and clears it.
        void apiClient<{ success: boolean }>("/auth/logout", {
          method: "POST",
        }).catch(() => undefined);

        clearActivity();
        set({ session: null });
      },

      refreshSession: async () => {
        if (isAuthDisabled()) {
          set({ session: getDevBypassSession() });
          return true;
        }

        const session = get().session;
        if (!session?.user) {
          if (session) {
            set({ session: null });
            notifySessionExpired();
          }
          return false;
        }

        // Honour the hard inactivity ceiling: if the user hasn't interacted in
        // longer than the allowed window, force a logout instead of refreshing.
        if (isInactiveTooLong()) {
          clearActivity();
          set({ session: null });
          notifySessionExpired();
          return false;
        }

        try {
          const response = await apiClient<LoginResponse>("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({}),
          });

          const nextSession = toAuthSession(response);
          set((state) => ({
            // Preserve the freshest user profile we already hold if the refresh
            // response somehow lacks it.
            session: { ...nextSession, user: nextSession.user ?? state.session?.user },
          }));
          return true;
        } catch (error) {
          // Refresh token itself is dead → session is unrecoverable.
          if (error instanceof ApiError && (error.status === 401 || error.status === 400)) {
            clearActivity();
            set({ session: null });
            notifySessionExpired();
            return false;
          }
          // Transient/network error: keep the session so a later retry can work.
          throw error;
        }
      },

      refreshUser: async () => {
        if (isAuthDisabled()) {
          set({ session: getDevBypassSession(), isLoading: false });
          return;
        }

        const session = get().session;
        if (!session?.user) return;

        set({ isLoading: true });

        const fetchMe = () => apiClient<User>("/auth/me");

        // If the access cookie is about to expire, refresh BEFORE calling
        // /auth/me so a page reload never bounces the user to login while a
        // valid refresh cookie exists.
        const expiresAtMs = session.expiresAt ? session.expiresAt * 1000 : null;
        if (expiresAtMs && expiresAtMs - Date.now() <= 60_000) {
          const refreshed = await get().refreshSession().catch(() => false);
          if (!refreshed) {
            set({ isLoading: false });
            return; // refreshSession already cleared the session if unrecoverable
          }
        }

        try {
          const user = await fetchMe();
          set((state) => ({
            session: state.session ? { ...state.session, user } : null,
            isLoading: false,
          }));
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            // Token rejected — try a one-shot refresh + retry before giving up.
            const refreshed = await get().refreshSession().catch(() => false);
            if (refreshed) {
              try {
                const user = await fetchMe();
                set((state) => ({
                  session: state.session ? { ...state.session, user } : null,
                  isLoading: false,
                }));
                return;
              } catch {
                /* fall through to logout */
              }
            }
            set({ session: null, isLoading: false });
            return;
          }
          set({ isLoading: false });
          throw error;
        }
      },

      hasRole: (...roles: UserRole[]) => {
        const userRoles = get().session?.user.roles ?? [];
        return hasAnyRole(userRoles, ...roles);
      },

      get primaryRole() {
        const roles = get().session?.user.roles ?? [];
        return getPrimaryRole(roles);
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        session: state.session ? toPersistedSession(state.session) : null,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state, error) => {
        const finishHydration = () => {
          useAuthStore.setState({ isHydrated: true });
        };

        if (isAuthDisabled()) {
          useAuthStore.setState({
            session: getDevBypassSession(),
            isHydrated: true,
            isLoading: false,
          });
          return;
        }

        if (error) {
          finishHydration();
          return;
        }

        const session = state?.session;
        if (!session?.user) {
          finishHydration();
          return;
        }

        useAuthStore.setState({ session: toPersistedSession(session) });
        finishHydration();
        void useAuthStore.getState().refreshUser().catch(() => {});
      },
    }
  )
);
