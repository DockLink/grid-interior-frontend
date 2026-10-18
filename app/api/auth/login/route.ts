import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend";
import { clientForwardHeaders } from "@/lib/api/client-forward-headers";
import { normalizeLoginResponse, toPublicAuthResponse } from "@/lib/auth/normalize-login";
import { firstZodMessage, loginBodySchema } from "@/lib/auth/request-schemas";
import { setSessionCookies } from "@/lib/auth/session-cookies";
import type { BackendLoginResponse } from "@/types/auth";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = loginBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { statusCode: 400, message: firstZodMessage(parsed.error) },
      { status: 400 },
    );
  }

  const result = await backendFetch<BackendLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(parsed.data),
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
      { statusCode: 502, message: "Invalid login response from backend" },
      { status: 502 },
    );
  }
}
