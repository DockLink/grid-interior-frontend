import { NextResponse } from "next/server";

export function unauthorizedResponse() {
  return NextResponse.json({ statusCode: 401, message: "Unauthorized" }, { status: 401 });
}

export function requireAuthorization(authorization: string | null) {
  if (!authorization) return unauthorizedResponse();
  return null;
}
