import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { ConsultInventoryItemApi } from "@/types/consultation";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<ConsultInventoryItemApi>(
    `/projects/${projectId}/consultation/inventory`,
    {
      method: "POST",
      headers: { Authorization: authorization! },
      body: JSON.stringify(body),
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
