"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapProjectFilesList } from "@/lib/files/map-project-file-record";
import { queryKeys } from "@/lib/query/keys";
import type { ProjectFile } from "@/types/files";

export function useProjectRecentFiles(projectId: string, limit = 10) {
  const authEnabled = !isAuthDisabled() && Boolean(projectId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.files.recent(projectId, limit),
    queryFn: async (): Promise<ProjectFile[]> => {
      const qs = new URLSearchParams({ limit: String(limit) });
      const raw = await authApiClient<unknown>(
        `/projects/${projectId}/files/recent?${qs}`,
      );
      return mapProjectFilesList(raw);
    },
    staleTime: 15_000,
    refetchOnMount: "always",
    enabled: authEnabled,
  });

  return {
    files: data ?? [],
    isLoading: authEnabled ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load recent files"
      : null,
    refetch: () => refetch().then(() => undefined),
  };
}
