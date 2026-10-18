import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend";
import { changePasswordBodySchema, firstZodMessage } from "@/lib/auth/request-schemas";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { statusCode: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = changePasswordBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { statusCode: 400, message: firstZodMessage(parsed.error) },
      { status: 400 },
    );
  }

  const result = await backendFetch<{ success: boolean }>("/auth/change-password", {
    method: "POST",
    headers: { Authorization: authorization },
    body: JSON.stringify(parsed.data),
  });

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status });
  }

  return NextResponse.json(result.data);
}
