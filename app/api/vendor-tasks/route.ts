import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { VendorTaskApi, VendorTasksListResponse } from "@/types/vendor-tasks";

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const query = req.nextUrl.search;
  const result = await backendFetch<VendorTasksListResponse>(`/vendor-tasks${query}`, {
    method: "GET",
    headers: { Authorization: authorization! },
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const body = await req.json();
  const result = await backendFetch<VendorTaskApi>("/vendor-tasks", {
    method: "POST",
    headers: { Authorization: authorization! },
    body: JSON.stringify(body),
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data, { status: result.status });
}
