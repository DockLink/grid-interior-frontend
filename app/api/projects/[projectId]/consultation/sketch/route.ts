import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { ConsultSketchApi } from "@/types/consultation";

type RouteContext = { params: Promise<{ projectId: string }> };

/** Create or replace the consultation measurement sketch. */
export async function PUT(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<ConsultSketchApi>(
    `/projects/${projectId}/consultation/sketch`,
    {
      method: "PUT",
      headers: { Authorization: authorization! },
      body: JSON.stringify(body),
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}

/** Remove the consultation measurement sketch. */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId } = await context.params;
  const result = await backendFetch<{ deleted: boolean }>(
    `/projects/${projectId}/consultation/sketch`,
    {
      method: "DELETE",
      headers: { Authorization: authorization! },
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
