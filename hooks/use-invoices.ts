"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapInvoiceApiToView } from "@/lib/clients/map-clients";
import type { Invoice, InvoiceApi } from "@/types/clients";

export function useInvoices(clientId: string | null, options: { enabled?: boolean } = {}) {
  const qc = useQueryClient();
  const enabled = options.enabled !== false && Boolean(clientId) && !isAuthDisabled();
  const qKey = ["clients", clientId, "invoices"];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<{ data: InvoiceApi[] }>(`/clients/${clientId}/invoices`);
      return (raw.data ?? []).map(mapInvoiceApiToView);
    },
    staleTime: 30_000,
    enabled,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, amount, status }: { file: File; amount: number; status: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("amount", amount.toString());
      formData.append("status", status);

      return authApiClient<InvoiceApi>(`/clients/${clientId}/invoices`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (result) => {
      const mapped = mapInvoiceApiToView(result);
      qc.setQueryData<Invoice[]>(qKey, (prev) => [mapped, ...(prev ?? [])]);
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
    uploadInvoice: (payload: { file: File; amount: number; status: string }) => uploadMutation.mutateAsync(payload),
    isUploading: uploadMutation.isPending,
    invalidate,
  };
}
