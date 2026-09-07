import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { ProjectLinksApi } from "@/types/project-links";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId } = await context.params;
  const result = await backendFetch<ProjectLinksApi>(`/projects/${projectId}/links`, {
    method: "GET",
    headers: { Authorization: authorization! },
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<ProjectLinksApi>(`/projects/${projectId}/links`, {
    method: "PATCH",
    headers: { Authorization: authorization! },
    body: JSON.stringify(body),
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
