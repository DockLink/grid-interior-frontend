import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_COOKIE, bearerFromAccessCookie } from "@/lib/auth/session-header";

/**
 * Copies the httpOnly access cookie into Authorization so existing API
 * routes can keep forwarding a Bearer token to Nest. A header the client
 * already sent (dev bypass, scripts) is left unchanged.
 */
export function proxy(request: NextRequest) {
  const existing = request.headers.get("authorization");
  const bearer = bearerFromAccessCookie(
    request.cookies.get(ACCESS_COOKIE)?.value,
    existing,
  );
  if (!bearer) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set("authorization", bearer);
  return NextResponse.next({
    request: { headers },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
