import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { SubVendorPaymentApi, SubVendorPaymentsListResponse } from "@/types/suppliers";

type RouteContext = { params: Promise<{ id: string }> };

function normalizePaymentList(body: unknown): SubVendorPaymentApi[] {
  if (Array.isArray(body)) return body as SubVendorPaymentApi[];
  if (body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: SubVendorPaymentApi[] }).data;
  }
  return [];
}

export async function GET(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { id } = await context.params;
  const query = req.nextUrl.search;
  const result = await backendFetch<SubVendorPaymentApi[] | SubVendorPaymentsListResponse>(
    `/sub-vendors/${id}/payments${query}`,
    {
      method: "GET",
      headers: { Authorization: authorization! },
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json({
    data: normalizePaymentList(result.data),
  } satisfies SubVendorPaymentsListResponse);
}
