import { NextRequest, NextResponse } from "next/server";

const BACKEND_FILE_URL =
  (process.env.BACKEND_API_URL ?? "http://localhost:3001/v2").replace(
    /\/v\d+\/?$/,
    ""
  );

type RouteContext = { params: Promise<{ projectId: string }> };

function unauthorized() {
  return NextResponse.json(
    { statusCode: 401, message: "Unauthorized" },
    { status: 401 }
  );
}

// Allow up to 5 minutes for very large uploads (Vercel Pro: 60 s max; self-hosted: no limit).
export const maxDuration = 300;

export async function POST(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  if (!authorization) return unauthorized();

  const { projectId } = await context.params;
  const contentType = req.headers.get("content-type") ?? "";
  const contentLength = req.headers.get("content-length");

  // Stream the raw multipart body straight to the backend instead of
  // buffering with req.formData(). Use the Web ReadableStream directly and
  // forward Content-Length so undici does not truncate the body for Multer.
  try {
    const res = await fetch(
      `${BACKEND_FILE_URL}/projects/${projectId}/files/upload`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          ...(contentType ? { "content-type": contentType } : {}),
          ...(contentLength ? { "content-length": contentLength } : {}),
        },
        body: req.body,
        // @ts-expect-error — Node.js fetch (undici) supports duplex streaming.
        duplex: "half",
        cache: "no-store",
      }
    );

    const responseBody = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(responseBody, { status: res.status });
    }

    return NextResponse.json(responseBody);
  } catch {
    return NextResponse.json(
      { statusCode: 502, message: "Upload backend unavailable" },
      { status: 502 },
    );
  }
}
