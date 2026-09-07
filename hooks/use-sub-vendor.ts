"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSubVendorApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type { SubVendor, SubVendorApi, UpdateSubVendorPayload } from "@/types/suppliers";

export function useSubVendor(vendorId: string | null, options: { enabled?: boolean } = {}) {
  const qc = useQueryClient();
  const enabled =
    options.enabled !== false && Boolean(vendorId) && !isAuthDisabled();
  const qKey = queryKeys.subVendors.detail(vendorId ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<SubVendorApi>(`/sub-vendors/${vendorId}`);
      return mapSubVendorApiToView(raw);
    },
    staleTime: 30_000,
    enabled,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSubVendorPayload) =>
      authApiClient<SubVendorApi>(`/sub-vendors/${vendorId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (result) => {
      const mapped = mapSubVendorApiToView(result);
      qc.setQueryData(qKey, mapped);
      void qc.invalidateQueries({ queryKey: queryKeys.subVendors.all });
    },
  });

  return {
    subVendor: (data ?? null) as SubVendor | null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load sub-vendor") : null,
    refetch: () => refetch().then(() => undefined),
    updateSubVendor: (payload: UpdateSubVendorPayload) => updateMutation.mutateAsync(payload),
    isUpdating: updateMutation.isPending,
  };
}
