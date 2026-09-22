import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";

type RouteContext = { params: Promise<{ projectId: string; audioId: string }> };

export async function DELETE(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId, audioId } = await context.params;
  // Backend route is plural: DELETE /projects/:id/consultation/audios/:audioId
  const result = await backendFetch<{ id: string; deleted: boolean }>(
    `/projects/${projectId}/consultation/audios/${audioId}`,
    {
      method: "DELETE",
      headers: { Authorization: authorization! },
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json(result.data);
}
