import type { AuthSession } from "@/types/auth";

/** Token sent by the local auth bypass — must match server-side checks. */
export const DEV_BYPASS_TOKEN = "dev-bypass-token";

const DEFAULT_BYPASS_EMAIL = "design@local.dev";

/**
 * UI-only mode is on by default during frontend development.
 * Set NEXT_PUBLIC_ENABLE_AUTH=true to restore real backend auth.
 */
export function isAuthDisabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true";
}

export function isDevBypassAuthorization(authorization: string | null): boolean {
  if (!authorization) return false;
  return authorization === `Bearer ${DEV_BYPASS_TOKEN}`;
}

function namesFromEmail(email: string): { first_name: string; last_name: string } {
  const local = email.split("@")[0] ?? "design";
  const parts = local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
  return {
    first_name: parts[0] ?? "Design",
    last_name: parts.slice(1).join(" ") || "User",
  };
}

export function getDevBypassSession(email?: string): AuthSession {
  const resolvedEmail = email?.trim() || DEFAULT_BYPASS_EMAIL;
  const { first_name, last_name } = namesFromEmail(resolvedEmail);

  return {
    accessToken: DEV_BYPASS_TOKEN,
    refreshToken: "dev-bypass-refresh",
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    expiresIn: 60 * 60 * 24 * 365,
    source: "supabase",
    sessionId: "dev-bypass-session",
    user: {
      id: "dev-bypass-user",
      email: resolvedEmail,
      first_name,
      last_name,
      roles: ["SUPER_ADMIN"],
      status: "ACTIVE",
    },
  };
}
