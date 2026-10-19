"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { queryKeys } from "@/lib/query/keys";
import type {
  SubVendorAssignedProjectApi,
  SubVendorAssignedProjectsResponse,
} from "@/types/suppliers";

function unwrapProjectList(
  raw: SubVendorAssignedProjectApi[] | SubVendorAssignedProjectsResponse | null | undefined,
): SubVendorAssignedProjectApi[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

export function useSubVendorLinkedProjects(
  subVendorId: string | null,
  options: { enabled?: boolean } = {},
) {
  const enabled =
    options.enabled !== false && Boolean(subVendorId) && !isAuthDisabled();
  const qKey = queryKeys.subVendors.projects(subVendorId ?? "");

  const { data, isLoading, isFetched, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<
        SubVendorAssignedProjectApi[] | SubVendorAssignedProjectsResponse
      >(`/sub-vendors/${subVendorId}/projects`);
      return unwrapProjectList(raw);
    },
    staleTime: 30_000,
    enabled,
  });

  return {
    projects: data ?? [],
    isLoading: enabled && isLoading,
    isFetched: !enabled || isFetched,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load linked projects"
      : null,
    refetch: () => refetch().then(() => undefined),
  };
}
