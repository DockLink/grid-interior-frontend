"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSubVendorApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type {
  CreateSubVendorPayload,
  SubVendor,
  SubVendorsListResponse,
  SubVendorsQueryParams,
} from "@/types/suppliers";

function toQueryString(params: SubVendorsQueryParams = {}): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.specialty) qs.set("specialty", params.specialty);
  if (params.availability) qs.set("availability", params.availability);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export function useSubVendors(
  params: SubVendorsQueryParams = { page: 1, limit: 100 },
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const enabled = options.enabled !== false && !isAuthDisabled();
  const qKey = queryKeys.subVendors.list(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<SubVendorsListResponse>(`/sub-vendors${toQueryString(params)}`);
      return {
        data: raw.data.map(mapSubVendorApiToView),
        meta: raw.meta,
      };
    },
    staleTime: 30_000,
    enabled,
  });

  const subVendors: SubVendor[] = useMemo(() => data?.data ?? [], [data]);

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: queryKeys.subVendors.all });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateSubVendorPayload) =>
      authApiClient("/sub-vendors", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => void invalidate(),
  });

  return {
    subVendors,
    meta: data?.meta ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load sub-vendors") : null,
    refetch: () => refetch().then(() => undefined),
    createSubVendor: (payload: CreateSubVendorPayload) => createMutation.mutateAsync(payload),
    isCreating: createMutation.isPending,
  };
}
