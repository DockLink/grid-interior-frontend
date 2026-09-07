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

async function fetchProject(projectId: string): Promise<Project | null> {
  if (isAuthDisabled()) {
    if (isMockProjectId(projectId)) {
      return getMockProjectDetail(projectId) ?? null;
    }
    return getUiOnlyProjectDetail(projectId);
  }

  if (isMockProjectId(projectId)) {
    return getMockProjectDetail(projectId) ?? null;
  }

  return authApiClient<Project>(`/projects/${projectId}`);
}

export function useProject(projectId: string | null) {
  const authEnabled = !isAuthDisabled();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKeys.projects.detail(projectId ?? ""), authEnabled ? "api" : "ui"],
    queryFn: () => fetchProject(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30_000,
  });

  return {
    project: data ?? null,
    isLoading: authEnabled ? isLoading : false,
    error: authEnabled
      ? error
        ? error instanceof Error
          ? error.message
          : "Failed to load project"
        : null
      : null,
    refetch: () => refetch().then(() => undefined),
  };
}
