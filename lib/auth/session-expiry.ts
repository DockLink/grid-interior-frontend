"use client";

import { toast } from "sonner";

import { NAV_ROUTES } from "@/types/navigation";

let lastNotified = 0;
const DEDUP_WINDOW_MS = 5_000;

/**
 * Surfaces a single, friendly "session expired" toast and routes to the
 * dedicated expired screen. Safe to call from non-React modules.
 */
export function notifySessionExpired(): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastNotified < DEDUP_WINDOW_MS) return;
  lastNotified = now;
  toast.error("Session expired, please log in.");
  if (!window.location.pathname.startsWith(NAV_ROUTES.sessionExpired)) {
    window.location.assign(NAV_ROUTES.sessionExpired);
  }
}
