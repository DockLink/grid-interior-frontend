import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { BoqLineItemApi } from "@/types/boq";

type RouteContext = {
  params: Promise<{ projectId: string; itemId: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId, itemId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<BoqLineItemApi>(
    `/projects/${projectId}/boq/items/${itemId}/quotes`,
    {
      method: "PUT",
      headers: { Authorization: authorization! },
      body: JSON.stringify(body),
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
