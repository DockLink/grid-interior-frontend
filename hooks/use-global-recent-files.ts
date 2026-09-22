"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useProjects } from "@/hooks/use-projects";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import type { GlobalRecentFile } from "@/lib/files/map-global-files";
import { mapProjectFilesList } from "@/lib/files/map-project-file-record";
import { queryKeys } from "@/lib/query/keys";
import { mapWithConcurrency } from "@/lib/utils";

export function useGlobalRecentFiles() {
  const { projects, isLoading: projectsLoading } = useProjects({
    status: "ACTIVE",
    limit: 50,
  });

  const projectIdsKey = useMemo(
    () => projects.map((p) => p.id).sort().join(","),
    [projects],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.files.recentGlobal(projectIdsKey),
    queryFn: async (): Promise<GlobalRecentFile[]> => {
      const batches = await mapWithConcurrency(projects, 10, async (project) => {
        try {
          const res = await authApiClient<unknown>(
            `/projects/${project.id}/files/recent?limit=5`,
          );
          return mapProjectFilesList(res).map(
            (file): GlobalRecentFile => ({
              ...file,
              projectId: file.projectId || project.id,
              projectName: project.name,
            }),
          );
        } catch {
          return [];
        }
      });

      return batches
        .flat()
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    staleTime: 30_000,
    enabled: !isAuthDisabled() && !projectsLoading && projects.length > 0,
  });

  return {
    files: data ?? [],
    isLoading: projectsLoading || isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load recent files"
      : null,
    refetch: () => refetch().then(() => undefined),
  };
}
