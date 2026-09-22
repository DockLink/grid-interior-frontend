"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSupplierOrderApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type { SupplierOrder, SupplierOrderApi, SupplierOrdersListResponse } from "@/types/suppliers";

function unwrapOrderList(
  raw: SupplierOrderApi[] | SupplierOrdersListResponse | null | undefined,
): SupplierOrderApi[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

export function useSupplierOrders(
  supplierId: string | null,
  options: { enabled?: boolean } = {},
) {
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

  return {
    orders: (data ?? []) as SupplierOrder[],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load order history") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
