"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { queryKeys } from "@/lib/query/keys";
import { withTaskEndDate } from "@/lib/tasks/create-task-payload";
import { mapTask, mapTasksList } from "@/lib/tasks/map-task";
import { toTasksQueryString } from "@/lib/tasks/query-string";
import type { CreateTaskRequest, Task, TaskableType, TasksListResponse, TasksQueryParams } from "@/types/tasks";

const EMPTY_TASKS: Task[] = [];

async function fetchTaskables(
  projectId: string,
  taskableType?: TaskableType,
  options: { limit?: number; depth?: number } = {}
): Promise<Task[]> {
  const params: TasksQueryParams = {
    page: 1,
    limit: options.limit ?? 100,
    projects: [projectId],
    taskable_type: taskableType,
    depth: options.depth,
  };
  const query = toTasksQueryString(params);
  const res = await authApiClient<TasksListResponse>(`/tasks${query}`);
  return mapTasksList(res);
}

export function useProjectTaskables(
  projectId: string | null,
  taskableType?: TaskableType,
  options: {
    limit?: number;
    depth?: number;
    refetchInterval?: number | false;
    refetchOnMount?: boolean | "always";
  } = {}
) {
  const qc = useQueryClient();
  const qKey = queryKeys.projects.taskables(projectId ?? "", taskableType, options);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: () => fetchTaskables(projectId!, taskableType, options),
    enabled: Boolean(projectId) && !isAuthDisabled(),
    staleTime: 20_000,
    refetchInterval: options.refetchInterval,
    refetchOnMount: options.refetchOnMount,
  });

  const tasks = data ?? EMPTY_TASKS;

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (payload: CreateTaskRequest) => {
      const normalized = withTaskEndDate(payload);
      const created = await authApiClient<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify(normalized),
      });
      return mapTask(created);
    },
    onSuccess: (created) => {
      // Only insert into this hook's list (TASK vs STAGE vs MILESTONE keys differ).
      qc.setQueryData<Task[]>(qKey, (prev) =>
        prev ? [...prev, created].sort((a, b) => a.order - b.order) : [created],
      );
      void qc.invalidateQueries({
        queryKey: ["projects", "taskables", projectId ?? ""],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: { title?: string; description?: string };
    }) => {
      const updated = await authApiClient<Task>(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return mapTask(updated);
    },
    onSuccess: (updated) => {
      qc.setQueriesData<Task[]>(
        { queryKey: ["projects", "taskables", projectId ?? ""] },
        (prev) =>
          prev
            ? prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
            : [updated],
      );
    },
  });

  const updateDatesMutation = useMutation({
    mutationFn: async ({
      taskId,
      startDateIso,
      endDateIso,
    }: {
      taskId: string;
      startDateIso: string;
      endDateIso: string;
    }) => {
      const updated = await authApiClient<Task>(`/tasks/${taskId}/dates`, {
        method: "PATCH",
        body: JSON.stringify({ start_date: startDateIso, end_date: endDateIso }),
      });
      return mapTask(updated);
    },
    onSuccess: (updated) => {
      qc.setQueriesData<Task[]>(
        { queryKey: ["projects", "taskables", projectId ?? ""] },
        (prev) =>
          prev
            ? prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
            : [updated],
      );
    },
  });

  // Stable wrappers keep the hook's public API unchanged for callers.
  const createTaskable = useCallback(
    (payload: CreateTaskRequest) => createMutation.mutateAsync(payload),
    [createMutation]
  );

  const updateTaskable = useCallback(
    (taskId: string, payload: { title?: string; description?: string }) =>
      updateMutation.mutateAsync({ taskId, payload }),
    [updateMutation]
  );

  const updateTaskableDates = useCallback(
    (taskId: string, startDateIso: string, endDateIso: string) =>
      updateDatesMutation.mutateAsync({ taskId, startDateIso, endDateIso }),
    [updateDatesMutation]
  );

  const patchTaskInCache = useCallback(
    (taskId: string, patch: Partial<Task>) => {
      // Patch every taskables cache for this project so overview cards that share
      // (or partially share) the list update without waiting on a refetch.
      qc.setQueriesData<Task[]>(
        { queryKey: ["projects", "taskables", projectId ?? ""] },
        (prev) =>
          prev ? prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) : prev,
      );
    },
    [qc, projectId],
  );

  const setStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task["status"] }) => {
      const updated = await authApiClient<Task>(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return mapTask(updated);
    },
    onSuccess: (updated) => {
      // Patch every taskables cache for this project (overview / stages editor / hub
      // use different limit/type keys and would otherwise stay stale).
      qc.setQueriesData<Task[]>(
        { queryKey: ["projects", "taskables", projectId ?? ""] },
        (prev) =>
          prev
            ? prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
            : prev,
      );
      void qc.invalidateQueries({
        queryKey: ["projects", "taskables", projectId ?? ""],
      });
      void qc.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId ?? ""),
      });
      // List / studio progress bars derive from project.current_stage + completion.
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: async ({
      taskId,
      startDateIso,
      endDateIso,
    }: {
      taskId: string;
      startDateIso?: string;
      endDateIso?: string;
    }) => {
      const updated = await authApiClient<Task>(`/tasks/${taskId}/reopen`, {
        method: "POST",
        body: JSON.stringify(
          startDateIso && endDateIso
            ? { start_date: startDateIso, end_date: endDateIso }
            : {}
        ),
      });
      return mapTask(updated);
    },
    onSuccess: (updated) => {
      qc.setQueriesData<Task[]>(
        { queryKey: ["projects", "taskables", projectId ?? ""] },
        (prev) =>
          prev
            ? prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
            : prev,
      );
      void qc.invalidateQueries({
        queryKey: ["projects", "taskables", projectId ?? ""],
      });
      void qc.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId ?? ""),
      });
      void qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  const setTaskableStatus = useCallback(
    (taskId: string, status: Task["status"]) =>
      setStatusMutation.mutateAsync({ taskId, status }),
    [setStatusMutation]
  );

  const reopenTaskable = useCallback(
    (taskId: string, startDateIso?: string, endDateIso?: string) =>
      reopenMutation.mutateAsync({ taskId, startDateIso, endDateIso }),
    [reopenMutation]
  );

  return {
    tasks,
    isLoading: isPending,
    error: error ? (error instanceof Error ? error.message : "Failed to load tasks") : null,
    refetch: () => refetch().then(() => undefined),
    createTaskable,
    updateTaskable,
    updateTaskableDates,
    patchTaskInCache,
    setTaskableStatus,
    reopenTaskable,
  };
}
