"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapProjectLinksApiToView } from "@/lib/projects/map-project-links";
import { queryKeys } from "@/lib/query/keys";
import type { ProjectLinks, ProjectLinksApi, UpdateProjectLinksPayload } from "@/types/project-links";

export function useProjectLinks(
  projectId: string | null,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const enabled =
    options.enabled !== false && Boolean(projectId) && !isAuthDisabled();
  const qKey = queryKeys.projectLinks.detail(projectId ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`);
      return mapProjectLinksApiToView(raw);
    },
    staleTime: 30_000,
    enabled,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProjectLinksPayload) =>
      authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (result) => {
      const mapped = mapProjectLinksApiToView(result);
      qc.setQueryData<ProjectLinks>(qKey, mapped);
    },
  });

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: qKey });
  }, [qc, qKey]);

  return {
    links: data ?? { client: null, suppliers: [], subVendors: [] },
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load project links") : null,
    refetch: () => refetch().then(() => undefined),
    updateLinks: (payload: UpdateProjectLinksPayload) => updateMutation.mutateAsync(payload),
    isUpdating: updateMutation.isPending,
    invalidate,
  };
}
