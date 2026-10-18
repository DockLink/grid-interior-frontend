import { getSessionIdFromAccessToken } from "@/lib/auth/jwt";
import type { BackendLoginResponse, LoginResponse, NormalizedLogin } from "@/types/auth";

/** Maps Supabase login payload (snake_case) to the server session shape. */
export function normalizeLoginResponse(raw: BackendLoginResponse): NormalizedLogin {
  if (!raw.access_token) {
    throw new Error("Login response missing access token");
  }

  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    expiresAt: raw.expires_at,
    expiresIn: raw.expires_in,
    source: "supabase",
    user: raw.user,
  };
}

/** Browser-facing login/refresh body. Tokens stay in httpOnly cookies. */
export function toPublicAuthResponse(login: NormalizedLogin): LoginResponse {
  return {
    expiresAt: login.expiresAt,
    expiresIn: login.expiresIn,
    source: login.source,
    user: login.user,
    sessionId: getSessionIdFromAccessToken(login.accessToken) ?? undefined,
  };
}
