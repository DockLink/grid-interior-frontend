"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  mapDetailCategoryStates,
  mapDirectorOverviewResponse,
} from "@/lib/detail/map-detail";
import { DETAIL_CATEGORIES, DIRECTOR_PROJECTS } from "@/lib/projects/mock-detail";
import { queryKeys } from "@/lib/query/keys";
import type {
  DetailCategoriesResponse,
  DetailCategoryId,
  DetailCategoryStateApi,
  DetailCategoryUpdatePayload,
  DirectorOverviewResponse,
  DirectorProject,
} from "@/types/detail";

export function useDetailCategories(
  projectId: string,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false && Boolean(projectId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.detail.categories(projectId),
    queryFn: async () => {
      if (authOff) {
        return DETAIL_CATEGORIES.map((c) => ({
          id: c.id,
          complete: c.complete,
          notes: c.notes,
          fileCount: c.files.length,
        }));
      }
      const raw = await authApiClient<DetailCategoriesResponse>(
        `/projects/${projectId}/detail/categories`,
      );
      return mapDetailCategoryStates(raw);
    },
    staleTime: 15_000,
    enabled,
  });

  const states = useMemo(() => data ?? [], [data]);

  const categories = useMemo(() => {
    const byId = new Map(states.map((s) => [s.id, s]));
    return DETAIL_CATEGORIES.map((chrome) => {
      const state = byId.get(chrome.id);
      return {
        ...chrome,
        complete: state?.complete ?? chrome.complete,
        notes: state?.notes ?? chrome.notes,
        files: authOff ? chrome.files : [],
      };
    });
  }, [states, authOff]);

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({
      queryKey: queryKeys.detail.categories(projectId),
    });
  }, [qc, projectId]);

  const updateMutation = useMutation({
    mutationFn: async ({
      categoryId,
      payload,
    }: {
      categoryId: DetailCategoryId;
      payload: DetailCategoryUpdatePayload;
    }) => {
      if (authOff) return payload;
      return authApiClient<DetailCategoryStateApi>(
        `/projects/${projectId}/detail/categories/${categoryId}`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
    },
    onSuccess: () => {
      void invalidate();
    },
  });

  return {
    categories,
    states,
    isLoading: enabled && !authOff ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load detail categories"
      : null,
    refetch: () => refetch().then(() => undefined),
    updateCategory: (
      categoryId: DetailCategoryId,
      payload: DetailCategoryUpdatePayload,
    ) => updateMutation.mutateAsync({ categoryId, payload }),
    isMutating: updateMutation.isPending,
    isAuthOff: authOff,
  };
}

export function useDirectorOverview(options: { enabled?: boolean } = {}) {
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.detail.directorOverview(),
    queryFn: async (): Promise<DirectorProject[]> => {
      if (authOff) return DIRECTOR_PROJECTS;
      const raw = await authApiClient<DirectorOverviewResponse>(
        `/projects/director-overview`,
      );
      return mapDirectorOverviewResponse(raw);
    },
    staleTime: 30_000,
    enabled,
  });

  return {
    projects: data ?? [],
    isLoading: enabled && !authOff ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load director overview"
      : null,
    refetch: () => refetch().then(() => undefined),
  };
}
