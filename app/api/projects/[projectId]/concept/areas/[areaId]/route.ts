import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { ConceptAreaApi } from "@/types/concept";

type RouteContext = { params: Promise<{ projectId: string; areaId: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId, areaId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<ConceptAreaApi>(
    `/projects/${projectId}/concepts/areas/${areaId}`,
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

  const { projectId, areaId } = await context.params;
  const result = await backendFetch<{ id: string; deleted: boolean }>(
    `/projects/${projectId}/concepts/areas/${areaId}`,
    {
      method: "DELETE",
      headers: { Authorization: authorization! },
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
