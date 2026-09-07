import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend";
import { getSessionIdFromAccessToken } from "@/lib/auth/jwt";

/**
 * Best-effort logout: Nest has no POST /auth/logout.
 * Revoke the current Supabase session via DELETE /auth/sessions/:sessionId.
 * Always returns success when Authorization is present so local clear is never blocked.
 */
export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { statusCode: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  const sessionId = token ? getSessionIdFromAccessToken(token) : null;

  if (sessionId) {
    try {
      await backendFetch<{ success: boolean }>(
        `/auth/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: { Authorization: authorization },
        }
      );
    } catch {
      // Ignore Nest/network failures — client still clears local session.
    }
  }

  return NextResponse.json({ success: true });
}
