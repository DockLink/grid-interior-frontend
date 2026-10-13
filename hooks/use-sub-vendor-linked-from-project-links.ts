"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { stageToPhase } from "@/lib/projects/map-project-hub";
import { rawLinksIncludeSubVendor, subVendorLinkRowsFromRaw } from "@/lib/projects/map-project-links";
import { queryKeys } from "@/lib/query/keys";
import { mapWithConcurrency } from "@/lib/utils";
import type { ProjectLinksApi, SubVendorLinkedProject } from "@/types/project-links";
import type { ProjectCardView } from "@/types/projects";

const LINK_FETCH_CONCURRENCY = 5;

export function useSubVendorLinkedFromProjectLinks(
  subVendorId: string,
  projects: ProjectCardView[],
  options: { enabled?: boolean } = {},
) {
  const enabled =
    options.enabled !== false && Boolean(subVendorId) && projects.length > 0 && !isAuthDisabled();
  const projectIdsKey = projects.map((p) => p.id).slice().sort().join(",");

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [...queryKeys.subVendors.linkedProjects(subVendorId), projectIdsKey],
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const results = await mapWithConcurrency(projects, LINK_FETCH_CONCURRENCY, async (project) => {
        const raw = await authApiClient<ProjectLinksApi>(`/projects/${project.id}/links`);
        return { project, raw };
      });
      return results
        .filter(({ raw }) => rawLinksIncludeSubVendor(raw, subVendorId))
        .map(({ project, raw }): SubVendorLinkedProject => {
          const scope =
            subVendorLinkRowsFromRaw(raw).find((row) => row.sub_vendor_id === subVendorId)?.scope ??
            "Sub-vendor";
          return {
            projectId: project.id,
            name: project.name,
            phase: stageToPhase(project.currentStage),
            status: project.status === "Inactive" ? "at-risk" : "on-track",
            scope: scope || "Sub-vendor",
          };
        });
    },
  });

  return {
    linkedFromProjectLinks: data ?? [],
    isLoading: enabled && isLoading,
    isFetching: enabled && isFetching,
    error: error ? (error instanceof Error ? error.message : "Failed to load linked projects") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
