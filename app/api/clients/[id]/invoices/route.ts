import { NextRequest, NextResponse } from "next/server";
import { Readable } from "node:stream";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { InvoiceApi } from "@/types/clients";

type RouteContext = { params: Promise<{ id: string }> };

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:3001/v2";

function toNodeReadable(stream: ReadableStream<Uint8Array>): Readable {
  const reader = stream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (err) {
        this.destroy(err as Error);
      }
    },
  });
}

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

  // Stream raw multipart to the backend (same pattern as storage / project file uploads)
  // so Multer receives the file + amount/status fields intact.
  const body = req.body
    ? (toNodeReadable(req.body) as unknown as BodyInit)
    : undefined;

  const res = await fetch(`${BACKEND_API_URL}/clients/${id}/invoices`, {
    method: "POST",
    headers: {
      Authorization: authorization!,
      ...(contentType ? { "content-type": contentType } : {}),
    },
    body,
    // @ts-expect-error — Node.js fetch (undici) supports duplex streaming.
    duplex: "half",
    cache: "no-store",
  });

  const responseBody = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(responseBody, { status: res.status });
  }

  return NextResponse.json(responseBody);
}
