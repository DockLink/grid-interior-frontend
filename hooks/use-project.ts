"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  getMockProjectDetail,
  getUiOnlyProjectDetail,
  isMockProjectId,
} from "@/lib/projects/mock-projects";
import { queryKeys } from "@/lib/query/keys";
import type { Project } from "@/types/projects";

async function fetchProject(projectId: string): Promise<Project> {
  if (isAuthDisabled()) {
    return getUiOnlyProjectDetail(projectId);
  }

  if (isMockProjectId(projectId)) {
    const mock = getMockProjectDetail(projectId);
    if (mock) return mock;
  }

  return authApiClient<Project>(`/projects/${projectId}`);
}

export function useProject(projectId: string | null) {
  const uiOnly = isAuthDisabled();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKeys.projects.detail(projectId ?? ""), uiOnly ? "ui" : "api"],
    queryFn: () => fetchProject(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30_000,
  });

  const fallback = projectId && uiOnly ? getUiOnlyProjectDetail(projectId) : null;

  return {
    project: data ?? fallback,
    isLoading: uiOnly ? false : isLoading,
    error: uiOnly ? null : error ? (error instanceof Error ? error.message : "Failed to load project") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
