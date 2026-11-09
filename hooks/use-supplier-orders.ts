"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSupplierOrderApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type {
  CreateSupplierOrderPayload,
  SupplierOrder,
  SupplierOrderApi,
  SupplierOrdersListResponse,
  UpdateSupplierOrderPayload,
} from "@/types/suppliers";

function unwrapOrderList(
  raw: SupplierOrderApi[] | SupplierOrdersListResponse | null | undefined,
): SupplierOrderApi[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

function unwrapOrder(
  raw: SupplierOrderApi | { data?: SupplierOrderApi } | null | undefined,
): SupplierOrderApi {
  if (raw && typeof raw === "object" && "data" in raw && raw.data && !Array.isArray(raw.data)) {
    return raw.data;
  }
  return raw as SupplierOrderApi;
}

export function useSupplierOrders(
  supplierId: string | null,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const enabled =
    options.enabled !== false && Boolean(supplierId) && !isAuthDisabled();
  const qKey = queryKeys.suppliers.orders(supplierId ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<SupplierOrderApi[] | SupplierOrdersListResponse>(
        `/suppliers/${supplierId}/orders`,
      );
      return unwrapOrderList(raw).map(mapSupplierOrderApiToView);
    },
    staleTime: 30_000,
    enabled,
  });

  const invalidateOrders = async () => {
    await qc.invalidateQueries({ queryKey: qKey });
    if (supplierId) {
      void qc.invalidateQueries({ queryKey: queryKeys.suppliers.detail(supplierId) });
    }
    void qc.invalidateQueries({ queryKey: queryKeys.suppliers.all });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: CreateSupplierOrderPayload) => {
      const raw = await authApiClient<SupplierOrderApi | { data: SupplierOrderApi }>(
        `/suppliers/${supplierId}/orders`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      return mapSupplierOrderApiToView(unwrapOrder(raw));
    },
    onSuccess: async () => {
      await invalidateOrders();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UpdateSupplierOrderPayload;
    }) => {
      const raw = await authApiClient<SupplierOrderApi | { data: SupplierOrderApi }>(
        `/suppliers/${supplierId}/orders/${orderId}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
      return mapSupplierOrderApiToView(unwrapOrder(raw));
    },
    onSuccess: async () => {
      await invalidateOrders();
    },
  });

  return {
    orders: (data ?? []) as SupplierOrder[],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load order history") : null,
    refetch: () => refetch().then(() => undefined),
    createOrder: (payload: CreateSupplierOrderPayload) => createMutation.mutateAsync(payload),
    updateOrder: (orderId: string, payload: UpdateSupplierOrderPayload) =>
      updateMutation.mutateAsync({ orderId, payload }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
