"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSupplierApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type { Supplier, SupplierApi, UpdateSupplierPayload } from "@/types/suppliers";

export function useSupplier(supplierId: string | null, options: { enabled?: boolean } = {}) {
  const qc = useQueryClient();
  const enabled =
    options.enabled !== false && Boolean(supplierId) && !isAuthDisabled();
  const qKey = queryKeys.suppliers.detail(supplierId ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<SupplierApi>(`/suppliers/${supplierId}`);
      return mapSupplierApiToView(raw);
    },
    staleTime: 30_000,
    enabled,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSupplierPayload) =>
      authApiClient<SupplierApi>(`/suppliers/${supplierId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (result) => {
      const mapped = mapSupplierApiToView(result);
      qc.setQueryData(qKey, mapped);
      void qc.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      authApiClient<{ id: string; deleted: true }>(`/suppliers/${supplierId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      qc.removeQueries({ queryKey: qKey });
    },
  });

  return {
    supplier: (data ?? null) as Supplier | null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load supplier") : null,
    refetch: () => refetch().then(() => undefined),
    updateSupplier: (payload: UpdateSupplierPayload) => updateMutation.mutateAsync(payload),
    deleteSupplier: () => deleteMutation.mutateAsync(),
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
