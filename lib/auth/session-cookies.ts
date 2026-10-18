import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/session-header";
import type { NormalizedLogin } from "@/types/auth";

const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function cookieBase() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function accessMaxAge(login: NormalizedLogin): number {
  if (typeof login.expiresIn === "number" && login.expiresIn > 0) {
    return Math.floor(login.expiresIn);
  }
  if (typeof login.expiresAt === "number") {
    const seconds = login.expiresAt - Math.floor(Date.now() / 1000);
    if (seconds > 0) return seconds;
  }
  return 60 * 60;
}

export function setSessionCookies(res: NextResponse, login: NormalizedLogin) {
  const base = cookieBase();
  res.cookies.set(ACCESS_COOKIE, login.accessToken, {
    ...base,
    maxAge: accessMaxAge(login),
  });
  if (login.refreshToken) {
    res.cookies.set(REFRESH_COOKIE, login.refreshToken, {
      ...base,
      maxAge: REFRESH_MAX_AGE_SECONDS,
    });
  }
}

export function clearSessionCookies(res: NextResponse) {
  const base = cookieBase();
  res.cookies.set(ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...base, maxAge: 0 });
}
