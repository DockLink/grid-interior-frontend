import { NextRequest, NextResponse } from "next/server";
import { backendFileFetch } from "@/lib/api/backend-file";
import type { DownloadUrlResponse } from "@/types/files";

type RouteContext = { params: Promise<{ fileId: string }> };

function unauthorized() {
  return NextResponse.json({ statusCode: 401, message: "Unauthorized" }, { status: 401 });
}

/** Strip path separators and quotes so the filename is safe in Content-Disposition. */
function sanitizeFileName(raw: string | null): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "download";
  const base = trimmed.replace(/[/\\]/g, "_").replace(/["\r\n]/g, "");
  return base || "download";
}

function contentDispositionAttachment(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

/**
 * Authenticated download proxy — streams the S3 object with
 * Content-Disposition: attachment so images (and other types) save to disk
 * instead of opening inline in a new tab.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  if (!authorization) return unauthorized();

  const { fileId } = await context.params;
  const fileName = sanitizeFileName(req.nextUrl.searchParams.get("fileName"));

  const result = await backendFileFetch<{ data: DownloadUrlResponse }>(
    `/files/${fileId}/download-url`,
    { method: "GET", headers: { Authorization: authorization } }
  );

  if (!result.ok) {
    return NextResponse.json(result.error, { status: result.status });
  }

  const downloadUrl = result.data.data.downloadUrl;
  if (!downloadUrl) {
    return NextResponse.json(
      { statusCode: 502, message: "Missing download URL" },
      { status: 502 }
    );
  }

  const upstream = await fetch(downloadUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { statusCode: upstream.status || 502, message: "Failed to retrieve file" },
      { status: upstream.status || 502 }
    );
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Disposition": contentDispositionAttachment(fileName),
    "Cache-Control": "private, no-store",
  });
  if (contentLength) headers.set("Content-Length", contentLength);

  return new NextResponse(upstream.body, { status: 200, headers });
}
