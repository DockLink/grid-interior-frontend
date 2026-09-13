import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { DetailCategoryStateApi } from "@/types/detail";

type RouteContext = {
  params: Promise<{ projectId: string; categoryId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId, categoryId } = await context.params;
  const body = await req.json();
  const result = await backendFetch<DetailCategoryStateApi>(
    `/projects/${projectId}/detail/categories/${categoryId}`,
    {
      method: "PATCH",
      headers: { Authorization: authorization! },
      body: JSON.stringify(body),
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
