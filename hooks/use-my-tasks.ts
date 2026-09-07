"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { toProjectsQueryString } from "@/lib/projects/query-string";
import { queryKeys } from "@/lib/query/keys";
import { assigneesFromRecords } from "@/lib/tasks/assignees";
import { toTasksQueryString } from "@/lib/tasks/query-string";
import { mapTaskToView, type ProjectTaskView } from "@/lib/tasks/task-board";
import type { ProjectsListResponse } from "@/types/projects";
import type { Task, TaskAssigneeRecord, TasksListResponse } from "@/types/tasks";

export function useMyTasks() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tasks.my(userId),
    queryFn: async () => {
      const tasksQuery = toTasksQueryString({
        taskable_type: "TASK",
        limit: 100,
        depth: 0,
      });
      const projectsQuery = toProjectsQueryString({ status: "ACTIVE", limit: 100 });

      const [tasksRes, projectsRes] = await Promise.all([
        authApiClient<TasksListResponse>(`/tasks${tasksQuery}`),
        authApiClient<ProjectsListResponse>(`/projects${projectsQuery}`),
      ]);

      const tasks: Task[] = tasksRes.data ?? [];
      let assigneeMap: Record<string, TaskAssigneeRecord[]> = {};

      if (tasks.length > 0) {
        try {
          assigneeMap = await authApiClient<Record<string, TaskAssigneeRecord[]>>(
            "/tasks/batch-assignees",
            {
              method: "POST",
              body: JSON.stringify({ task_ids: tasks.map((t) => t.id) }),
            },
          );
        } catch {
          assigneeMap = {};
        }
      }

      const projectNameMap = Object.fromEntries(
        (projectsRes.data ?? []).map((p) => [p.id, p.name]),
      );

      return { tasks, assigneeMap, projectNameMap };
    },
    staleTime: 30_000,
    enabled: !isAuthDisabled() && Boolean(userId),
  });

  const tasks: ProjectTaskView[] = useMemo(() => {
    if (!userId || !data) return [];

    return data.tasks
      .filter((task) => {
        const records = data.assigneeMap[task.id] ?? [];
        return records.some((r) => r.status === "ACTIVE" && r.user_id === userId);
      })
      .map((task) =>
        mapTaskToView(task, {
          assignees: assigneesFromRecords(data.assigneeMap[task.id] ?? []),
        }),
      );
  }, [data, userId]);

  const projectNameMap = data?.projectNameMap ?? {};

  return {
    tasks,
    projectNameMap,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load tasks") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
