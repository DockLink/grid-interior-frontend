import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend";
import type { PortalProjectionApi } from "@/types/portal";

type RouteContext = { params: Promise<{ token: string }> };

/** Public client-portal projection — no auth required (token is the credential). */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { token } = await context.params;

  const result = await backendFetch<PortalProjectionApi>(`/portal/${token}`, {
    method: "GET",
  });

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status });
  }

  return NextResponse.json(result.data);
}
