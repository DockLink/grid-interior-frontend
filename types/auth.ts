import type { User, UserRole } from "./users";

export interface LoginRequest {
  email: string;
  password: string;
}

/** Raw payload from POST /v2/auth/login (Supabase). */
export interface BackendLoginResponse {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  source?: "supabase";
  user: User;
}

/** Server-only login shape. Tokens are written to httpOnly cookies, never to the browser store. */
export interface NormalizedLogin {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  expiresIn?: number;
  source: "supabase";
  user: User;
}

/** Login/refresh payload returned to the browser. Contains no tokens. */
export interface LoginResponse {
  expiresAt?: number;
  expiresIn?: number;
  source: "supabase";
  user: User;
  /** Supabase auth.sessions row id (from JWT session_id claim). */
  sessionId?: string;
}

export interface AuthSession {
  /** Present only for the local UI-only bypass. Real sessions keep tokens in httpOnly cookies. */
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  expiresIn?: number;
  source: "supabase";
  user: User;
  /** Supabase auth.sessions row id (from JWT session_id claim). */
  sessionId?: string;
}

export interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  /** Exchanges the refresh cookie for a fresh access cookie. False if the session is unrecoverable. */
  refreshSession: () => Promise<boolean>;
  hasRole: (...roles: UserRole[]) => boolean;
  primaryRole: UserRole | null;
}
