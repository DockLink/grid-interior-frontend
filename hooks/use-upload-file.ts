"use client";

import { useCallback } from "react";

import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { ensureFreshSession, refreshAccessToken } from "@/lib/auth/token-refresh";
import { useAuthStore } from "@/stores/auth-store";

function uploadFieldName(_file: File): string {
  // Backend StorageV2Controller FileInterceptor only accepts the field name "image"
  // (even for non-image floating uploads such as PDFs / audio).
  return "image";
}

export function useUploadFile() {
  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append(uploadFieldName(file), file);

    const headers: Record<string, string> = {};
    if (isAuthDisabled()) {
      const token = useAuthStore.getState().session?.accessToken;
      if (!token) throw new Error("Unauthorized");
      headers.Authorization = `Bearer ${token}`;
    } else {
      const ready = await ensureFreshSession();
      if (!ready) throw new Error("Unauthorized");
    }

    const send = () =>
      fetch("/api/storage/upload", {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
      });

    let res = await send();
    if (!isAuthDisabled() && res.status === 401) {
      const refreshed = await refreshAccessToken().catch(() => false);
      if (!refreshed) throw new Error("Session expired, please log in");
      res = await send();
    }

    const raw = await res.text();
    let body: { message?: string; token?: string };
    try {
      body = raw ? (JSON.parse(raw) as { message?: string; token?: string }) : {};
    } catch {
      throw new Error(
        raw.trim().slice(0, 200) || `Upload failed (HTTP ${res.status})`,
      );
    }

    if (!res.ok) {
      throw new Error(body.message ?? "Upload failed");
    }

    if (!body.token) {
      throw new Error("Upload succeeded but no file token was returned");
    }

    return { token: body.token };
  }, []);

  return { uploadFile };
}
