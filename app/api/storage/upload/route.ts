import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:3001/v2";

function unauthorized() {
  return NextResponse.json({ statusCode: 401, message: "Unauthorized" }, { status: 401 });
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text.trim() };
  }
}

// Allow time for larger gallery photo uploads on self-hosted deployments.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) return unauthorized();

  const contentType = req.headers.get("content-type") ?? "";
  const contentLength = req.headers.get("content-length");

  // Stream the raw multipart body to the backend instead of buffering with
  // req.formData() — avoids Next.js "Request Entity Too Large" on big photos.
  // Use the Web ReadableStream directly and forward Content-Length so undici
  // does not advertise Content-Length: 0 (which leaves Multer with no file).
  try {
    const res = await fetch(`${BACKEND_API_URL}/storage/upload`, {
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
    });

    const responseBody = await parseResponseBody(res);

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
