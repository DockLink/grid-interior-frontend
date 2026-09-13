"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  mapEndedAfterBoq,
  mapExecutionStagesResponse,
  mapExecutionSiteResponse,
  mapSiteSubStageApi,
  nextSiteSubstageStatus,
} from "@/lib/execution/map-execution";
import {
  cycleSiteSubstageStatus,
  getSiteSubstagesSnapshot,
  SITE_SUBSTAGES,
  SITE_TOTAL_DAYS,
} from "@/lib/projects/mock-execution";
import { queryKeys } from "@/lib/query/keys";
import type {
  EndedAfterBoqPayload,
  EndedAfterBoqResponse,
  ExecutionStageStatus,
  ExecutionStageStatusPayload,
  ExecutionStagesResponse,
  ExecutionSiteResponse,
  SiteSubStage,
  SiteSubStageApi,
  SiteSubStageUpdatePayload,
} from "@/types/execution";

function base(projectId: string) {
  return `/projects/${projectId}/execution`;
}

export function useExecutionStages(
  projectId: string,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false && Boolean(projectId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.execution.stages(projectId),
    queryFn: async () => {
      if (authOff) return [];
      const raw = await authApiClient<ExecutionStagesResponse>(
        `${base(projectId)}/stages`,
      );
      return mapExecutionStagesResponse(raw);
    },
    staleTime: 15_000,
    enabled: enabled && !authOff,
  });

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({
      queryKey: queryKeys.execution.stages(projectId),
    });
  }, [qc, projectId]);

  const patchMutation = useMutation({
    mutationFn: async ({
      taskableId,
      status,
    }: {
      taskableId: string;
      status: ExecutionStageStatus;
    }) => {
      if (authOff) return null;
      const payload: ExecutionStageStatusPayload = { status };
      return authApiClient(`${base(projectId)}/stages/${taskableId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  return {
    stages: data ?? [],
    isLoading: enabled && !authOff ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load stages"
      : null,
    refetch: () => refetch().then(() => undefined),
    setStageStatus: (taskableId: string, status: ExecutionStageStatus) =>
      patchMutation.mutateAsync({ taskableId, status }),
    isMutating: patchMutation.isPending,
  };
}

export function useSiteSubstages(
  projectId: string,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false && Boolean(projectId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.execution.site(projectId),
    queryFn: async () => {
      if (authOff) {
        return {
          substages: getSiteSubstagesSnapshot(),
          totalDays: SITE_TOTAL_DAYS,
        };
      }
      const raw = await authApiClient<ExecutionSiteResponse>(
        `${base(projectId)}/site`,
      );
      return mapExecutionSiteResponse(raw);
    },
    staleTime: 15_000,
    enabled,
  });

  const substages = useMemo(
    () => data?.substages ?? (authOff ? SITE_SUBSTAGES : []),
    [data, authOff],
  );
  const totalDays = data?.totalDays ?? SITE_TOTAL_DAYS;

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({
      queryKey: queryKeys.execution.site(projectId),
    });
  }, [qc, projectId]);

  const updateMutation = useMutation({
    mutationFn: async ({
      substageId,
      payload,
    }: {
      substageId: string;
      payload: SiteSubStageUpdatePayload;
    }) => {
      if (authOff) {
        if (payload.status) cycleSiteSubstageStatus(substageId);
        return getSiteSubstagesSnapshot().find((s) => s.id === substageId) ?? null;
      }
      const raw = await authApiClient<SiteSubStageApi>(
        `${base(projectId)}/site/${substageId}`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
      return mapSiteSubStageApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
      else void invalidate();
    },
  });

  const cycleStatus = useCallback(
    async (stage: SiteSubStage) => {
      if (stage.status === "blocked") return;
      if (authOff) {
        cycleSiteSubstageStatus(stage.id);
        void invalidate();
        return;
      }
      const next = nextSiteSubstageStatus(stage.status, stage.blockedBy);
      await updateMutation.mutateAsync({
        substageId: stage.id,
        payload: { status: next },
      });
    },
    [authOff, invalidate, updateMutation],
  );

  return {
    substages,
    totalDays,
    isLoading: enabled && !authOff ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load site substages"
      : null,
    refetch: () => refetch().then(() => undefined),
    updateSubstage: (substageId: string, payload: SiteSubStageUpdatePayload) =>
      updateMutation.mutateAsync({ substageId, payload }),
    cycleStatus,
    isMutating: updateMutation.isPending,
    isAuthOff: authOff,
  };
}

export function useEndedAfterBoq(
  projectId: string,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false && Boolean(projectId);

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.execution.endedAfterBoq(projectId),
    queryFn: async () => {
      if (authOff) return false;
      const raw = await authApiClient<EndedAfterBoqResponse>(
        `${base(projectId)}/ended-after-boq`,
      );
      return mapEndedAfterBoq(raw);
    },
    staleTime: 15_000,
    enabled: enabled && !authOff,
  });

  const mutation = useMutation({
    mutationFn: async (ended: boolean) => {
      if (authOff) return ended;
      const payload: EndedAfterBoqPayload = { ended_after_boq: ended };
      const raw = await authApiClient<EndedAfterBoqResponse>(
        `${base(projectId)}/ended-after-boq`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
      return mapEndedAfterBoq(raw);
    },
    onSuccess: (ended) => {
      qc.setQueryData(queryKeys.execution.endedAfterBoq(projectId), ended);
    },
  });

  return {
    endedAfterBoq: data ?? false,
    isLoading: enabled && !authOff ? isLoading : false,
    setEndedAfterBoq: (ended: boolean) => mutation.mutateAsync(ended),
    refetch: () => refetch().then(() => undefined),
    isMutating: mutation.isPending,
    isAuthOff: authOff,
  };
}
