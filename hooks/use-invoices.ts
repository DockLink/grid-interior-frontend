"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapInvoiceApiToView } from "@/lib/clients/map-clients";
import { queryKeys } from "@/lib/query/keys";
import type { Invoice, InvoiceApi, InvoiceStatus } from "@/types/clients";

function unwrapInvoiceList(raw: InvoiceApi[] | { data?: InvoiceApi[] } | null | undefined): InvoiceApi[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

function unwrapInvoice(raw: InvoiceApi | { data?: InvoiceApi } | null | undefined): InvoiceApi {
  if (raw && typeof raw === "object" && "data" in raw && raw.data) {
    return raw.data;
  }
  return raw as InvoiceApi;
}

export function useInvoices(clientId: string | null, options: { enabled?: boolean } = {}) {
  const qc = useQueryClient();
  const enabled = options.enabled !== false && Boolean(clientId) && !isAuthDisabled();
  const qKey = ["clients", clientId, "invoices"] as const;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<InvoiceApi[] | { data: InvoiceApi[] }>(
        `/clients/${clientId}/invoices`,
      );
      return unwrapInvoiceList(raw).map(mapInvoiceApiToView);
    },
    staleTime: 30_000,
    enabled,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      amount,
      status,
    }: {
      file: File;
      amount: number;
      status: InvoiceStatus;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("amount", String(amount));
      formData.append("status", status);

      const raw = await authApiClient<InvoiceApi | { data: InvoiceApi }>(
        `/clients/${clientId}/invoices`,
        {
          method: "POST",
          body: formData,
        },
      );
      return unwrapInvoice(raw);
    },
    onSuccess: (result) => {
      const mapped = mapInvoiceApiToView(result);
      qc.setQueryData<Invoice[]>(qKey, (prev) => [mapped, ...(prev ?? [])]);
      if (clientId) {
        void qc.invalidateQueries({ queryKey: queryKeys.clients.detail(clientId) });
        void qc.invalidateQueries({ queryKey: queryKeys.clients.all });
      }
    },
  });

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: qKey });
  }, [qc, qKey]);

  return {
    invoices: data ?? [],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load invoices") : null,
    refetch: () => refetch().then(() => undefined),
    uploadInvoice: (payload: { file: File; amount: number; status: InvoiceStatus }) =>
      uploadMutation.mutateAsync(payload),
    isUploading: uploadMutation.isPending,
    invalidate,
  };
}
