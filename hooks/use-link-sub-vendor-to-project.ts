"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { stageToPhase } from "@/lib/projects/map-project-hub";
import { subVendorLinkRowsFromRaw } from "@/lib/projects/map-project-links";
import { queryKeys } from "@/lib/query/keys";
import type { ProjectLinksApi, SubVendorLinkedProject } from "@/types/project-links";
import type { ProjectCardView } from "@/types/projects";

type LinkArgs = {
  projectId: string;
  scope: string;
  /** Used to optimistically update the Linked Projects tab before refetch completes. */
  project?: ProjectCardView;
};

export function useLinkSubVendorToProject(subVendorId: string) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ projectId, scope }: LinkArgs) => {
      const raw = await authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`);
      const existing = subVendorLinkRowsFromRaw(raw);
      if (existing.some((row) => row.sub_vendor_id === subVendorId)) {
        return raw;
      }
      return authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`, {
        method: "PATCH",
        body: JSON.stringify({
          sub_vendors: [...existing, { sub_vendor_id: subVendorId, scope }],
        }),
      });
    },
    onSuccess: async (_result, { projectId, scope, project }) => {
      await qc.cancelQueries({ queryKey: queryKeys.subVendors.linkedProjects(subVendorId) });

      if (project) {
        const linked: SubVendorLinkedProject = {
          projectId: project.id,
          name: project.name,
          phase: stageToPhase(project.currentStage),
          status: project.status === "Inactive" ? "at-risk" : "on-track",
          scope: scope || "Sub-vendor",
        };
        qc.setQueriesData<SubVendorLinkedProject[]>(
          { queryKey: queryKeys.subVendors.linkedProjects(subVendorId) },
          (old) => {
            const prev = old ?? [];
            if (prev.some((row) => row.projectId === linked.projectId)) return prev;
            return [...prev, linked];
          },
        );
      }

      void qc.invalidateQueries({ queryKey: queryKeys.projectLinks.detail(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.subVendors.linkedProjects(subVendorId) });
      void qc.invalidateQueries({ queryKey: queryKeys.subVendors.detail(subVendorId) });
      void qc.invalidateQueries({ queryKey: queryKeys.subVendors.all });
    },
  });

  const linkProject = useCallback(
    (projectId: string, scope: string, project?: ProjectCardView) =>
      mutation.mutateAsync({ projectId, scope, project }),
    [mutation],
  );

  return {
    linkProject,
    isLinking: mutation.isPending,
  };
}
