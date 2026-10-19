import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type {
  SubVendorAssignedProjectApi,
  SubVendorAssignedProjectsResponse,
} from "@/types/suppliers";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeProjectList(body: unknown): SubVendorAssignedProjectApi[] {
  if (Array.isArray(body)) return body as SubVendorAssignedProjectApi[];
  if (body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: SubVendorAssignedProjectApi[] }).data;
  }
  return [];
}

export async function GET(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { id } = await context.params;
  const query = req.nextUrl.search;
  const result = await backendFetch<
    SubVendorAssignedProjectApi[] | SubVendorAssignedProjectsResponse
  >(`/sub-vendors/${id}/projects${query}`, {
    method: "GET",
    headers: { Authorization: authorization! },
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json({
    data: normalizeProjectList(result.data),
  } satisfies SubVendorAssignedProjectsResponse);
}
