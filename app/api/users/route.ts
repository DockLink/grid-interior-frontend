import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend";
import {
  getEmailValidationError,
  normalizeEmail,
} from "@/lib/validation/email";
import type { User } from "@/types/users";
import type { UsersListResponse } from "@/types/users-api";

function unauthorized() {
  return NextResponse.json(
    { statusCode: 401, message: "Unauthorized" },
    { status: 401 }
  );
}

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) return unauthorized();

  const query = req.nextUrl.search;

  const result = await backendFetch<UsersListResponse>(`/users${query}`, {
    method: "GET",
    headers: { Authorization: authorization },
  });

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status });
  }

  return NextResponse.json(result.data);
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) return unauthorized();

  const body = await req.json();
  const rawEmail = typeof body?.email === "string" ? body.email : "";
  const emailError = getEmailValidationError(rawEmail);
  if (emailError) {
    return NextResponse.json(
      { statusCode: 400, message: emailError },
      { status: 400 }
    );
  }

  const payload = {
    ...body,
    email: normalizeEmail(rawEmail),
  };

  const result = await backendFetch<User>("/users/create", {
    method: "POST",
    headers: { Authorization: authorization },
    body: JSON.stringify(payload),
  });

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}
