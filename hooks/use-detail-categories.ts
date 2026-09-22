"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { handleApiError } from "@/lib/api/handle-api-error";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  mapDetailCategoryStates,
  mapDirectorOverviewResponse,
} from "@/lib/detail/map-detail";
import {
  getLocalCategoryStates,
  getSubmittedDirectorProjects,
  upsertLocalCategoryState,
} from "@/lib/detail/local-detail-store";
import { DETAIL_CATEGORIES } from "@/lib/projects/mock-detail";
import { queryKeys } from "@/lib/query/keys";
import { ApiError } from "@/types/api";
import type {
  DetailCategoriesResponse,
  DetailCategoryId,
  DetailCategoryStateApi,
  DetailCategoryUpdatePayload,
  DirectorOverviewResponse,
  DirectorProject,
} from "@/types/detail";

function isMissingEndpoint(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 404 || error.status === 501) return true;
  // Legacy: `/projects/director-overview` could collide with `GET /projects/:id`
  // and surface as a generic lookup failure.
  const msg = error.message.toLowerCase();
  return error.status === 400 && msg.includes("not found");
}

function mergeLocalStates(
  remote: ReturnType<typeof mapDetailCategoryStates>,
  projectId: string,
) {
  const local = getLocalCategoryStates(projectId);
  // Prefer live Nest rows; only fill gaps from localStorage (demo / missing API).
  const byId = new Map(remote.map((s) => [s.id, s]));
  for (const state of local) {
    if (byId.has(state.id)) continue;
    byId.set(state.id, {
      id: state.id,
      complete: state.complete,
      notes: state.notes,
      fileCount: undefined,
    });
  }
  return Array.from(byId.values());
}

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
        const local = getLocalCategoryStates(projectId);
        const byId = new Map(local.map((s) => [s.id, s]));
        return DETAIL_CATEGORIES.map((c) => {
          const state = byId.get(c.id);
          return {
            id: c.id,
            complete: state?.complete ?? c.complete,
            notes: state?.notes ?? c.notes,
            fileCount: c.files.length,
          };
        });
      }
      try {
        const raw = await authApiClient<DetailCategoriesResponse>(
          `/projects/${projectId}/detail/categories`,
        );
        return mergeLocalStates(mapDetailCategoryStates(raw), projectId);
      } catch (err) {
        // Backend detail module not shipped yet — keep UI usable via local store.
        if (isMissingEndpoint(err)) {
          return mergeLocalStates([], projectId);
        }
        throw err;
      }
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
        complete: state?.complete ?? (authOff ? chrome.complete : false),
        notes: state?.notes ?? (authOff ? chrome.notes : ""),
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
      const local = upsertLocalCategoryState(projectId, categoryId, payload);
      if (authOff) return local;

      try {
        return await authApiClient<DetailCategoryStateApi>(
          `/projects/${projectId}/detail/categories/${categoryId}`,
          { method: "PATCH", body: JSON.stringify(payload) },
        );
      } catch (err) {
        if (isMissingEndpoint(err)) {
          return {
            id: categoryId,
            category_id: categoryId,
            complete: local.complete,
            notes: local.notes,
          } satisfies DetailCategoryStateApi;
        }
        // Notes are autosaved while typing — keep local copy and avoid toast spam.
        // Mark-complete still surfaces errors so the user knows the toggle failed.
        const notesOnly =
          payload.notes !== undefined && payload.complete === undefined;
        if (notesOnly) {
          return {
            id: categoryId,
            category_id: categoryId,
            complete: local.complete,
            notes: local.notes,
          } satisfies DetailCategoryStateApi;
        }
        throw err;
      }
    },
    meta: { skipGlobalErrorToast: true },
    onError: (error) => {
      handleApiError(error, { toast: true, redirectOn401: true });
    },
    onSuccess: (_data, vars) => {
      qc.setQueryData(
        queryKeys.detail.categories(projectId),
        (prev: ReturnType<typeof mapDetailCategoryStates> | undefined) => {
          const list = prev ?? [];
          const idx = list.findIndex((s) => s.id === vars.categoryId);
          const next = {
            id: vars.categoryId,
            complete:
              vars.payload.complete ??
              list[idx]?.complete ??
              false,
            notes: vars.payload.notes ?? list[idx]?.notes ?? "",
            fileCount: list[idx]?.fileCount,
          };
          if (idx === -1) return [...list, next];
          const copy = list.slice();
          copy[idx] = { ...copy[idx], ...next };
          return copy;
        },
      );
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

/** Merge localStorage submissions when Nest overview is unavailable (demo / missing API). */
function mergeDirectorProjects(remote: DirectorProject[]): DirectorProject[] {
  const local = getSubmittedDirectorProjects();
  if (!local.length) return remote;
  const byId = new Map(remote.map((p) => [p.id, p]));
  for (const entry of local) {
    // Prefer remote row when both exist (source of truth)
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  }
  return Array.from(byId.values());
}

export function useDirectorOverview(options: { enabled?: boolean } = {}) {
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.detail.directorOverview(),
    queryFn: async (): Promise<DirectorProject[]> => {
      if (authOff) {
        return mergeDirectorProjects([]);
      }
      try {
        const raw = await authApiClient<DirectorOverviewResponse>(
          `/projects/director-overview`,
        );
        // Live Nest response is authoritative — do not overlay stale localStorage.
        return mapDirectorOverviewResponse(raw);
      } catch (err) {
        if (isMissingEndpoint(err)) {
          return mergeDirectorProjects([]);
        }
        throw err;
      }
    },
    staleTime: 15_000,
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
