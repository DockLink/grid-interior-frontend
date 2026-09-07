"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { stageToPhase } from "@/lib/projects/map-project-hub";
import { rawLinksIncludeSupplier, supplierLinkRowsFromRaw } from "@/lib/projects/map-project-links";
import { queryKeys } from "@/lib/query/keys";
import { mapWithConcurrency } from "@/lib/utils";
import type { ProjectLinksApi, SupplierLinkedProject } from "@/types/project-links";
import type { ProjectCardView } from "@/types/projects";

const LINK_FETCH_CONCURRENCY = 5;

export function useSupplierLinkedFromProjectLinks(
  supplierId: string,
  projects: ProjectCardView[],
  options: { enabled?: boolean } = {},
) {
  const enabled =
    options.enabled !== false && Boolean(supplierId) && projects.length > 0 && !isAuthDisabled();
  const projectIdsKey = projects.map((p) => p.id).slice().sort().join(",");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKeys.suppliers.linkedProjects(supplierId), projectIdsKey],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const results = await mapWithConcurrency(projects, LINK_FETCH_CONCURRENCY, async (project) => {
        const raw = await authApiClient<ProjectLinksApi>(`/projects/${project.id}/links`);
        return { project, raw };
      });
      return results
        .filter(({ raw }) => rawLinksIncludeSupplier(raw, supplierId))
        .map(({ project, raw }): SupplierLinkedProject => {
          const role =
            supplierLinkRowsFromRaw(raw).find((row) => row.supplier_id === supplierId)?.role ??
            "Supplier";
          return {
            projectId: project.id,
            name: project.name,
            phase: stageToPhase(project.currentStage),
            status: project.status === "Inactive" ? "at-risk" : "on-track",
            role: role || "Supplier",
          };
        });
    },
  });

  return {
    linkedFromProjectLinks: data ?? [],
    isLoading: enabled && isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load linked projects") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
