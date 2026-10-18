/** httpOnly cookie that holds the Nest/Supabase access token. */
export const ACCESS_COOKIE = "grid_at";

/** httpOnly cookie that holds the refresh token. */
export const REFRESH_COOKIE = "grid_rt";

/**
 * Bearer value to inject when the browser sent a session cookie and no
 * Authorization header. Returns null when the header should be left alone.
 */
export function bearerFromAccessCookie(
  cookieValue: string | undefined | null,
  existingAuthorization: string | null,
): string | null {
  if (existingAuthorization?.trim()) return null;
  const token = cookieValue?.trim();
  if (!token) return null;
  return `Bearer ${token}`;
}
