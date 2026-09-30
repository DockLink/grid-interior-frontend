"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { stageToPhase } from "@/lib/projects/map-project-hub";
import { supplierLinkRowsFromRaw } from "@/lib/projects/map-project-links";
import { queryKeys } from "@/lib/query/keys";
import type { ProjectLinksApi, SupplierLinkedProject } from "@/types/project-links";
import type { ProjectCardView } from "@/types/projects";

type LinkArgs = {
  projectId: string;
  role: string;
  /** Used to optimistically update the Linked Projects tab before refetch completes. */
  project?: ProjectCardView;
};

export function useLinkSupplierToProject(supplierId: string) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ projectId, role }: LinkArgs) => {
      const raw = await authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`);
      const existing = supplierLinkRowsFromRaw(raw);
      if (existing.some((row) => row.supplier_id === supplierId)) {
        return raw;
      }
      // Only patch suppliers — omit client_id / sub_vendors so the backend leaves them unchanged.
      return authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`, {
        method: "PATCH",
        body: JSON.stringify({
          suppliers: [...existing, { supplier_id: supplierId, role }],
        }),
      });
    },
    onSuccess: async (_result, { projectId, role, project }) => {
      await qc.cancelQueries({ queryKey: queryKeys.suppliers.linkedProjects(supplierId) });

      if (project) {
        const linked: SupplierLinkedProject = {
          projectId: project.id,
          name: project.name,
          phase: stageToPhase(project.currentStage),
          status: project.status === "Inactive" ? "at-risk" : "on-track",
          role: role || "Supplier",
        };
        qc.setQueriesData<SupplierLinkedProject[]>(
          { queryKey: queryKeys.suppliers.linkedProjects(supplierId) },
          (old) => {
            const prev = old ?? [];
            if (prev.some((row) => row.projectId === linked.projectId)) return prev;
            return [...prev, linked];
          },
        );
      }

      void qc.invalidateQueries({ queryKey: queryKeys.projectLinks.detail(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.suppliers.linkedProjects(supplierId) });
      void qc.invalidateQueries({ queryKey: queryKeys.suppliers.detail(supplierId) });
      void qc.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });

  const linkProject = useCallback(
    (projectId: string, role: string, project?: ProjectCardView) =>
      mutation.mutateAsync({ projectId, role, project }),
    [mutation],
  );

  return {
    linkProject,
    isLinking: mutation.isPending,
  };
}
