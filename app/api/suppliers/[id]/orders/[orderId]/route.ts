import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { SupplierOrderApi } from "@/types/suppliers";

type RouteContext = { params: Promise<{ id: string; orderId: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { id, orderId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<SupplierOrderApi>(
    `/suppliers/${id}/orders/${orderId}`,
    {
      method: "PATCH",
      headers: { Authorization: authorization! },
      body: JSON.stringify(body),
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data, { status: result.status });
}
