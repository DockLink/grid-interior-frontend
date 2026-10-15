"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApiClient } from "@/lib/api/authenticated-client";
import { getApiErrorMessage } from "@/lib/api/handle-api-error";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import {
  PHASE_AMENDMENT_LIMIT,
  resolvePhaseEditAccess,
  type PhaseAmendmentMode,
} from "@/lib/projects/phase-amendment";
import { findStageTaskable } from "@/lib/projects/seed-phases";
import { mapTask } from "@/lib/tasks/map-task";
import type { ProjectPhase } from "@/lib/projects/design-tokens";
import type { Task } from "@/types/tasks";

export type PhaseAmendmentBannerState = {
  mode: PhaseAmendmentMode;
  used: number;
  limit: number;
  canReopen: boolean;
  limitReached: boolean;
  busy: boolean;
  onReopen: () => void;
  onFinish: () => void;
};

function patchTaskablesCache(
  qc: ReturnType<typeof useQueryClient>,
  projectId: string,
  updated: Task,
) {
  qc.setQueriesData<Task[]>(
    { queryKey: ["projects", "taskables", projectId] },
    (prev) =>
      prev ? prev.map((task) => (task.id === updated.id ? { ...task, ...updated } : task)) : prev,
  );
}

export function usePhaseEditAccess(
  projectId: string,
  currentPhase: ProjectPhase | undefined,
  targetPhase: ProjectPhase,
): {
  readOnly: boolean;
  amendment: PhaseAmendmentBannerState | null;
} {
  const qc = useQueryClient();
  const { tasks, isLoading } = useProjectTaskables(projectId, "STAGE", { limit: 100 });
  const stage = findStageTaskable(tasks, targetPhase);

  const access = resolvePhaseEditAccess({
    currentPhase,
    targetPhase,
    amendmentCount: stage?.amendment_count ?? 0,
    amendmentOpen: stage?.amendment_open ?? false,
    hasStage: Boolean(stage?.id),
    stagesLoading: isLoading,
  });

  const mutation = useMutation({
    mutationFn: async ({
      action,
      taskId,
    }: {
      action: "reopen" | "lock";
      taskId: string;
    }) => {
      const updated = await authApiClient<unknown>(`/tasks/${taskId}/amendment/${action}`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      return mapTask(updated);
    },
    onSuccess: (updated, { action }) => {
      patchTaskablesCache(qc, projectId, updated);
      void qc.invalidateQueries({ queryKey: ["projects", "taskables", projectId] });
      toast.success(
        action === "reopen"
          ? "Phase reopened for editing"
          : "Amendments finished. This phase is read-only again.",
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err) || "Failed to update this phase");
    },
  });

  const { mutate, isPending } = mutation;
  const stageId = stage?.id;

  const onReopen = useCallback(() => {
    if (!stageId || !access.canReopen || isPending) return;
    mutate({ action: "reopen", taskId: stageId });
  }, [access.canReopen, isPending, mutate, stageId]);

  const onFinish = useCallback(() => {
    if (!stageId || access.mode !== "amending" || isPending) return;
    mutate({ action: "lock", taskId: stageId });
  }, [access.mode, isPending, mutate, stageId]);

  if (!access.pastPhase || !access.mode) {
    return { readOnly: false, amendment: null };
  }

  return {
    readOnly: access.readOnly,
    amendment: {
      mode: access.mode,
      used: access.used,
      limit: PHASE_AMENDMENT_LIMIT,
      canReopen: access.canReopen,
      limitReached: access.limitReached,
      busy: isPending,
      onReopen,
      onFinish,
    },
  };
}
