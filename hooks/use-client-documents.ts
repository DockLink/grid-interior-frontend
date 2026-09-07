"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useClientProjects } from "@/hooks/use-client-projects";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  aggregateFolderCounts,
  mapProjectFileToClientDocument,
} from "@/lib/clients/map-client-documents";
import { queryKeys } from "@/lib/query/keys";
import { mapWithConcurrency } from "@/lib/utils";
import type { ClientDocumentFile, ClientDocumentFolder } from "@/types/clients";
import type { ProjectFile, ProjectFolderTree } from "@/types/files";

const MAX_PROJECTS = 20;
const CONCURRENCY = 8;

export function useClientDocuments(clientId: string | null) {
  const { projects: linkedProjects, isLoading: projectsLoading } = useClientProjects(clientId);

  const projectSlice = useMemo(
    () => linkedProjects.slice(0, MAX_PROJECTS),
    [linkedProjects],
  );

  const projectIdsKey = useMemo(
    () => projectSlice.map((p) => p.id).sort().join(","),
    [projectSlice],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.clients.documents(clientId ?? ""),
    queryFn: async (): Promise<{
      folders: ClientDocumentFolder[];
      files: ClientDocumentFile[];
    }> => {
      const batches = await mapWithConcurrency(projectSlice, CONCURRENCY, async (project) => {
        try {
          const [treeRes, recentRes] = await Promise.all([
            authApiClient<{ data: ProjectFolderTree }>(`/projects/${project.id}/files/tree`),
            authApiClient<{ data: ProjectFile[] }>(
              `/projects/${project.id}/files/recent?limit=8`,
            ),
          ]);
          return {
            tree: treeRes.data ?? null,
            files: (recentRes.data ?? []).map((f) =>
              mapProjectFileToClientDocument({ ...f, projectId: project.id }, project.name),
            ),
          };
        } catch {
          return { tree: null, files: [] as ClientDocumentFile[] };
        }
      });

      const folders = aggregateFolderCounts(batches);
      const files = batches
        .flatMap((b) => b.files)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 40);

      return { folders, files };
    },
    staleTime: 30_000,
    enabled: !isAuthDisabled() && Boolean(clientId) && !projectsLoading && projectSlice.length > 0,
  });

  return {
    folders: data?.folders ?? [],
    files: data?.files ?? [],
    linkedProjects: projectSlice,
    isLoading: projectsLoading || isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load documents") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
