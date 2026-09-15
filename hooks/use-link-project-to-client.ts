"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { queryKeys } from "@/lib/query/keys";
import type { ProjectLinksApi } from "@/types/project-links";

export function useLinkProjectToClient(clientId: string) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (projectId: string) =>
      authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`, {
        method: "PATCH",
        body: JSON.stringify({ client_id: clientId }),
      }),
    onSuccess: (_result, projectId) => {
      void qc.invalidateQueries({ queryKey: queryKeys.clients.projects(clientId) });
      void qc.invalidateQueries({ queryKey: queryKeys.clients.documents(clientId) });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.projectLinks.detail(projectId) });
    },
  });

  const linkProject = useCallback(
    (projectId: string) => mutation.mutateAsync(projectId),
    [mutation],
  );

  return {
    linkProject,
    isLinking: mutation.isPending,
  };
}
