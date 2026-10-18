import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { MyRemindersResponse } from "@/types/clients";

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const result = await backendFetch<MyRemindersResponse>("/clients/my-reminders", {
    method: "GET",
    headers: { Authorization: authorization! },
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
