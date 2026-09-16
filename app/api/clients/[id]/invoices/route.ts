import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { InvoiceApi } from "@/types/clients";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { id } = await context.params;
  const result = await backendFetch<{ data: InvoiceApi[] }>(`/clients/${id}/invoices`, {
    method: "GET",
    headers: { Authorization: authorization! },
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { id } = await context.params;
  const formData = await req.formData();
  
  const result = await backendFetch<InvoiceApi>(`/clients/${id}/invoices`, {
    method: "POST",
    headers: { Authorization: authorization! },
    body: formData,
  });

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
