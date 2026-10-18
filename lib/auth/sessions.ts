import type { AuthSession, LoginResponse } from "@/types/auth";

/** Session kept in the client store. Real tokens are not copied here. */
export function toAuthSession(response: LoginResponse): AuthSession {
  return {
    expiresAt: response.expiresAt,
    expiresIn: response.expiresIn,
    source: response.source ?? "supabase",
    user: response.user,
    sessionId: response.sessionId,
  };
}

/** Drops tokens so persisted state and rehydration never keep them. */
export function toPersistedSession(session: AuthSession): AuthSession {
  return {
    expiresAt: session.expiresAt,
    expiresIn: session.expiresIn,
    source: session.source,
    user: session.user,
    sessionId: session.sessionId,
  };
}
