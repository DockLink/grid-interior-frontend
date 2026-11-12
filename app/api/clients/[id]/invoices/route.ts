import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { InvoiceApi } from "@/types/clients";

type RouteContext = { params: Promise<{ id: string }> };

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:3001/v2";

function normalizeInvoiceList(body: unknown): InvoiceApi[] {
  if (Array.isArray(body)) return body as InvoiceApi[];
  if (body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: InvoiceApi[] }).data;
  }
  return [];
}

export const maxDuration = 300;

export async function GET(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { id } = await context.params;
  const result = await backendFetch<InvoiceApi[] | { data: InvoiceApi[] }>(
    `/clients/${id}/invoices`,
    {
      method: "GET",
      headers: { Authorization: authorization! },
    },
  );

  if (!result.ok) return NextResponse.json(result.error, { status: result.status });
  return NextResponse.json({ data: normalizeInvoiceList(result.data) });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { id } = await context.params;
  const contentType = req.headers.get("content-type") ?? "";
  const contentLength = req.headers.get("content-length");

  // Stream raw multipart to the backend (same pattern as storage / project file uploads)
  // so Multer receives the file + amount/status fields intact. Forward Content-Length
  // and use the Web ReadableStream directly so undici does not truncate the body.
  try {
    const res = await fetch(`${BACKEND_API_URL}/clients/${id}/invoices`, {
      method: "POST",
      headers: {
        Authorization: authorization!,
        ...(contentType ? { "content-type": contentType } : {}),
        ...(contentLength ? { "content-length": contentLength } : {}),
      },
      body: req.body,
      // @ts-expect-error — Node.js fetch (undici) supports duplex streaming.
      duplex: "half",
      cache: "no-store",
    });

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
