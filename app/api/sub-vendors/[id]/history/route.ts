import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { SubVendorHistoryApi, SubVendorHistoryListResponse } from "@/types/suppliers";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeHistoryList(body: unknown): SubVendorHistoryApi[] {
  if (Array.isArray(body)) return body as SubVendorHistoryApi[];
  if (body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: SubVendorHistoryApi[] }).data;
  }
  return [];
}

export async function GET(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { id } = await context.params;
  const query = req.nextUrl.search;
  const result = await backendFetch<SubVendorHistoryApi[] | SubVendorHistoryListResponse>(
    `/sub-vendors/${id}/history${query}`,
    {
      method: "GET",
      headers: { Authorization: authorization! },
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json({
    data: normalizeHistoryList(result.data),
  } satisfies SubVendorHistoryListResponse);
}
