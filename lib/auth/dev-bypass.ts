import type { AuthSession } from "@/types/auth";

/** Token sent by the local auth bypass — must match server-side checks. */
export const DEV_BYPASS_TOKEN = "dev-bypass-token";

/** Local UI design bypass — never enable in production. */
export function isAuthDisabled(): boolean {
  return process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";
}

export function isDevBypassAuthorization(authorization: string | null): boolean {
  if (!authorization) return false;
  return authorization === `Bearer ${DEV_BYPASS_TOKEN}`;
}

export function getDevBypassSession(): AuthSession {
  return {
    accessToken: DEV_BYPASS_TOKEN,
    refreshToken: "dev-bypass-refresh",
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    expiresIn: 60 * 60 * 24 * 365,
    source: "supabase",
    sessionId: "dev-bypass-session",
    user: {
      id: "dev-bypass-user",
      email: "design@local.dev",
      first_name: "Design",
      last_name: "User",
      roles: ["SUPER_ADMIN"],
      status: "ACTIVE",
    },
  };
}
