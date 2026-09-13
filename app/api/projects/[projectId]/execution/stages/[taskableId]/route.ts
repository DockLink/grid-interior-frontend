import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { ExecutionStageApi } from "@/types/execution";

type RouteContext = {
  params: Promise<{ projectId: string; taskableId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId, taskableId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<ExecutionStageApi>(
    `/projects/${projectId}/execution/stages/${taskableId}`,
    {
      method: "PATCH",
      headers: { Authorization: authorization! },
      body: JSON.stringify(body),
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
