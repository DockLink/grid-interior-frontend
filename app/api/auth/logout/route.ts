import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend";
import { getSessionIdFromAccessToken } from "@/lib/auth/jwt";
import { clearSessionCookies } from "@/lib/auth/session-cookies";

/**
 * Best-effort logout: Nest has no POST /auth/logout.
 * Revoke the current Supabase session via DELETE /auth/sessions/:sessionId.
 * Always clears the httpOnly session cookies and returns success so the
 * browser can drop its local profile.
 */
export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  const res = NextResponse.json({ success: true });
  clearSessionCookies(res);

  if (!authorization) return res;

  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  const sessionId = token ? getSessionIdFromAccessToken(token) : null;

  if (sessionId) {
    try {
      await backendFetch<{ success: boolean }>(`/auth/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: authorization },
      });
    } catch {
      // Ignore Nest/network failures — cookies are already cleared.
    }
  }

  return res;
}
