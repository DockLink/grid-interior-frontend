import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend";
import { clientForwardHeaders } from "@/lib/api/client-forward-headers";
import { normalizeLoginResponse, toPublicAuthResponse } from "@/lib/auth/normalize-login";
import { refreshBodySchema } from "@/lib/auth/request-schemas";
import { REFRESH_COOKIE } from "@/lib/auth/session-header";
import { setSessionCookies } from "@/lib/auth/session-cookies";
import type { BackendLoginResponse } from "@/types/auth";

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get(REFRESH_COOKIE)?.value?.trim();
  let refreshToken = cookieToken;

  if (!refreshToken) {
    const json = await req.json().catch(() => ({}));
    const parsed = refreshBodySchema.safeParse(json);
    refreshToken = parsed.success ? parsed.data.refresh_token : undefined;
  }

  if (!refreshToken) {
    return NextResponse.json(
      { statusCode: 400, message: "Missing refresh token" },
      { status: 400 },
    );
  }

  const result = await backendFetch<BackendLoginResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
    headers: clientForwardHeaders(req),
  });

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status });
  }

  try {
    const normalized = normalizeLoginResponse(result.data);
    const res = NextResponse.json(toPublicAuthResponse(normalized));
    setSessionCookies(res, normalized);
    return res;
  } catch {
    return NextResponse.json(
      { statusCode: 502, message: "Invalid refresh response from backend" },
      { status: 502 },
    );
  }
}
