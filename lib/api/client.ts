import { ApiError } from "@/types/api";
import type { ApiErrorBody } from "@/types/api";

export async function apiClient<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
  };
  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...init?.headers,
    },
  });

  const body = (await res.json().catch(() => ({}))) as T | ApiErrorBody;

  if (!res.ok) {
    throw new ApiError(res.status, body as ApiErrorBody);
  }

  return body as T;
}