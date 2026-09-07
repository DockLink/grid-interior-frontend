"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { queryKeys } from "@/lib/query/keys";
import type { Project } from "@/types/projects";

export function useLinkProjectToClient(clientId: string) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (projectId: string) =>
      authApiClient<Project>(`/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ client: { id: clientId } }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.clients.projects(clientId) });
      void qc.invalidateQueries({ queryKey: queryKeys.clients.documents(clientId) });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
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
