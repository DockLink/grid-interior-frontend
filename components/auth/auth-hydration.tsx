"use client";

import { useEffect } from "react";

import { getDevBypassSession, isAuthDisabled } from "@/lib/auth/dev-bypass";
import { useAuthStore } from "@/stores/auth-store";

/** Ensures persisted auth state rehydrates on the client (Next.js App Router). */
export function AuthHydration() {
  useEffect(() => {
    if (isAuthDisabled()) {
      useAuthStore.setState({
        session: getDevBypassSession(),
        isHydrated: true,
        isLoading: false,
      });
      return;
    }

    const finishHydration = () => {
      useAuthStore.setState({ isHydrated: true });
    };

    if (useAuthStore.persist.hasHydrated()) {
      finishHydration();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(finishHydration);
    void useAuthStore.persist.rehydrate();

    return unsub;
  }, []);

  return null;
}
