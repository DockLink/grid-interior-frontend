"use client";

import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/types/api";

/**
 * Treats an error as an auth/expiry failure that a token refresh might fix.
 * Covers both the HTTP 401 status and Supabase's raw "jwt expired" message
 * that occasionally surfaces with other status codes.
 */
export function isAuthExpiryError(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.status === 401) return true;
    const msg = error.message?.toLowerCase() ?? "";
    return (
      msg.includes("jwt expired") ||
      msg.includes("token expired") ||
      msg.includes("invalid jwt") ||
      msg.includes("token is expired")
    );
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("jwt expired") ||
      msg.includes("token expired") ||
      msg.includes("invalid jwt") ||
      msg.includes("session expired")
    );
  }
  return false;
}

/** Access cookies are proactively refreshed when they expire within this window. */
export const PROACTIVE_REFRESH_WINDOW_MS = 60_000;

// Single in-flight refresh shared across all concurrent callers so a burst of
// simultaneous 401s only triggers one network round-trip.
let inFlight: Promise<boolean> | null = null;

export function refreshAccessToken(): Promise<boolean> {
  if (inFlight) return inFlight;
  inFlight = useAuthStore
    .getState()
    .refreshSession()
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Milliseconds until the current access cookie expires (Infinity if unknown). */
export function msUntilExpiry(): number {
  const expiresAt = useAuthStore.getState().session?.expiresAt;
  if (!expiresAt) return Infinity;
  // Supabase `expires_at` is a unix timestamp in seconds.
  return expiresAt * 1000 - Date.now();
}

/**
 * Ensures the httpOnly session is fresh enough for the next request.
 * Returns false when there is no usable session.
 */
export async function ensureFreshSession(): Promise<boolean> {
  if (isAuthDisabled()) {
    return Boolean(useAuthStore.getState().session?.user);
  }

  const session = useAuthStore.getState().session;
  if (!session?.user) return false;

  if (msUntilExpiry() <= PROACTIVE_REFRESH_WINDOW_MS) {
    try {
      const refreshed = await refreshAccessToken();
      return refreshed || Boolean(useAuthStore.getState().session?.user);
    } catch {
      // Network blip during proactive refresh — keep going with the current
      // cookie; the reactive path will retry on a real 401.
      return Boolean(useAuthStore.getState().session?.user);
    }
  }

  return true;
}
