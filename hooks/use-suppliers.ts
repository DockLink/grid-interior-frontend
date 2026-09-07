"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSupplierApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type {
  CreateSupplierPayload,
  Supplier,
  SuppliersListResponse,
  SuppliersQueryParams,
  UpdateSupplierPayload,
} from "@/types/suppliers";

function toQueryString(params: SuppliersQueryParams = {}): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.category) qs.set("category", params.category);
  if (params.status) qs.set("status", params.status);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export function useSuppliers(
  params: SuppliersQueryParams = { page: 1, limit: 100 },
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const enabled = options.enabled !== false && !isAuthDisabled();
  const qKey = queryKeys.suppliers.list(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<SuppliersListResponse>(`/suppliers${toQueryString(params)}`);
      return {
        data: raw.data.map(mapSupplierApiToView),
        meta: raw.meta,
      };
    },
    staleTime: 30_000,
    enabled,
  });

  const suppliers: Supplier[] = useMemo(() => data?.data ?? [], [data]);

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: queryKeys.suppliers.all });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateSupplierPayload) =>
      authApiClient("/suppliers", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => void invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      authApiClient(`/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: (result, { id }) => {
      const mapped = mapSupplierApiToView(result as Record<string, unknown>);
      qc.setQueryData<{ data: Supplier[]; meta: unknown }>(qKey, (prev) => {
        if (!prev) return prev;
        return { ...prev, data: prev.data.map((s) => (s.id === id ? mapped : s)) };
      });
      qc.setQueryData(queryKeys.suppliers.detail(id), mapped);
      void invalidate();
    },
  });

  return {
    suppliers,
    meta: data?.meta ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load suppliers") : null,
    refetch: () => refetch().then(() => undefined),
    createSupplier: (payload: CreateSupplierPayload) => createMutation.mutateAsync(payload),
    updateSupplier: (id: string, payload: UpdateSupplierPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
