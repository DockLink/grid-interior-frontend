import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { BoqLineItemApi } from "@/types/boq";

type RouteContext = {
  params: Promise<{ projectId: string; itemId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId, itemId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<BoqLineItemApi>(
    `/projects/${projectId}/boq/items/${itemId}`,
    {
      method: "PATCH",
      headers: { Authorization: authorization! },
      body: JSON.stringify(body),
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId, itemId } = await context.params;
  const result = await backendFetch<{ id: string; deleted: true }>(
    `/projects/${projectId}/boq/items/${itemId}`,
    {
      method: "DELETE",
      headers: { Authorization: authorization! },
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
