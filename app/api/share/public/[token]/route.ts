import { NextRequest, NextResponse } from "next/server";

import { backendFileFetch } from "@/lib/api/backend-file";

export interface ShareLinkPublicInfo {
  token: string;
  file_id: string;
  file_name?: string | null;
  expires_at?: string | null;
  allow_download?: boolean;
  mime_type?: string | null;
}

type RouteContext = { params: Promise<{ token: string }> };

/** Public metadata for share landing page — no auth required. */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { token } = await context.params;

  const result = await backendFileFetch<ShareLinkPublicInfo>(`/share/${token}`, {
    method: "GET",
  });

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status });
  }

  return NextResponse.json(result.data);
}
