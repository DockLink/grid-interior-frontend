"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapPortalProjection } from "@/lib/portal/map-portal";
import { getPortalFixtureView } from "@/lib/portal/portal-fixtures";
import { queryKeys } from "@/lib/query/keys";
import type { PortalProjectionApi, PortalViewModel } from "@/types/portal";

export function usePortal(token: string | undefined, options: { enabled?: boolean } = {}) {
  const authOff = isAuthDisabled();
  const safeToken = token ?? "";
  const enabled = options.enabled !== false && Boolean(safeToken);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.portal.byToken(safeToken),
    queryFn: async (): Promise<PortalViewModel> => {
      if (authOff) return getPortalFixtureView(safeToken);
      const raw = await apiClient<PortalProjectionApi>(`/portal/${safeToken}`);
      return mapPortalProjection(raw);
    },
    staleTime: 30_000,
    enabled,
  });

  const view = data ?? (authOff && enabled ? getPortalFixtureView(safeToken) : undefined);

  return {
    access: view?.access ?? "active",
    project: view?.project,
    phases: view?.phases ?? [],
    milestones: view?.milestones ?? [],
    materials: view?.materials ?? [],
    isLoading: enabled && !authOff && isLoading,
    error: authOff ? null : error,
    refetch,
  };
}
