import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";

type RouteContext = { params: Promise<{ actorId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { actorId } = await context.params;
  const query = req.nextUrl.search;
  const result = await backendFetch<unknown>(`/audit/actor/${actorId}${query}`, {
    method: "GET",
    headers: { Authorization: authorization! },
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
