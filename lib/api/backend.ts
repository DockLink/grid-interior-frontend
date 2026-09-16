import type { ApiErrorBody } from "@/types/api";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:3001/v2";

type BackendResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: ApiErrorBody; status: number };

export async function backendFetch<T>(
  path: string,
  init?: RequestInit
): Promise<BackendResult<T>> {
  const isFormData = init?.body instanceof FormData;
  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
  };
  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BACKEND_API_URL}${path}`, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as T | ApiErrorBody;

  if (!res.ok) {
    return { ok: false, error: body as ApiErrorBody, status: res.status };
  }

  return { ok: true, data: body as T, status: res.status };
}
