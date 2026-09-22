"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSubVendorHistoryApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type {
  SubVendorHistory,
  SubVendorHistoryApi,
  SubVendorHistoryListResponse,
} from "@/types/suppliers";

function unwrapHistoryList(
  raw: SubVendorHistoryApi[] | SubVendorHistoryListResponse | null | undefined,
): SubVendorHistoryApi[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

export function useSubVendorHistory(
  subVendorId: string | null,
  options: { enabled?: boolean } = {},
) {
  const enabled =
    options.enabled !== false && Boolean(subVendorId) && !isAuthDisabled();
  const qKey = queryKeys.subVendors.history(subVendorId ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<
        SubVendorHistoryApi[] | SubVendorHistoryListResponse
      >(`/sub-vendors/${subVendorId}/history`);
      return unwrapHistoryList(raw).map(mapSubVendorHistoryApiToView);
    },
    staleTime: 30_000,
    enabled,
  });

  return {
    history: (data ?? []) as SubVendorHistory[],
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load project history"
      : null,
    refetch: () => refetch().then(() => undefined),
  };
}
