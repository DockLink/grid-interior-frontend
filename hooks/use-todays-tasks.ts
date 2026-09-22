"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  TODAYS_TASKS_DATA,
  type TodaysTaskItem,
} from "@/components/dashboard/studio/demo-data";
import { useAuth } from "@/hooks/use-auth";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapTaskToTodaysItem } from "@/lib/dashboard/map-dashboard-data";
import { isTaskCompleted } from "@/lib/projects/map-stages";
import { toProjectsQueryString } from "@/lib/projects/query-string";
import { queryKeys } from "@/lib/query/keys";
import { todayIsoDate } from "@/lib/suppliers/map-vendor-tasks";
import { assigneesFromRecords } from "@/lib/tasks/assignees";
import { toTasksQueryString } from "@/lib/tasks/query-string";
import { mapTaskToView } from "@/lib/tasks/task-board";
import type { ProjectsListResponse } from "@/types/projects";
import type { Task, TaskAssigneeRecord, TasksListResponse } from "@/types/tasks";

export type TodaysTasksScope = "org" | "led" | "mine";

const DISPLAY_LIMIT = 16;

export function useTodaysTasks(options: {
  scope: TodaysTasksScope;
  ledProjectIds?: string[];
  enabled?: boolean;
}) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const authOff = isAuthDisabled();
  const ledProjectIds = options.ledProjectIds ?? [];
  const enabled =
    options.enabled !== false && !authOff && (options.scope !== "mine" || Boolean(userId));

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tasks.todays(options.scope, userId, ledProjectIds),
    queryFn: async () => {
      const tasksQuery = toTasksQueryString({
        taskable_type: "TASK",
        limit: 200,
        depth: 0,
      });
      const projectsQuery = toProjectsQueryString({ status: "ACTIVE", limit: 100 });

      const [tasksRes, projectsRes] = await Promise.all([
        authApiClient<TasksListResponse>(`/tasks${tasksQuery}`),
        authApiClient<ProjectsListResponse>(`/projects${projectsQuery}`),
      ]);

      const tasks: Task[] = (tasksRes.data ?? []).filter((t) => !isTaskCompleted(t.status));
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
    enabled,
  });

  const items: TodaysTaskItem[] = useMemo(() => {
    if (authOff) return TODAYS_TASKS_DATA;
    if (!data) return [];

    const today = todayIsoDate();
    const ledIds = new Set(ledProjectIds);
    const rows: { item: TodaysTaskItem; dueDate: string }[] = [];

    for (const task of data.tasks) {
      if (options.scope === "led" && !ledIds.has(task.projectId)) continue;

      const assignees = assigneesFromRecords(data.assigneeMap[task.id] ?? []);
      if (options.scope === "mine") {
        if (!assignees.some((a) => a.userId === userId)) continue;
      }

      const view = mapTaskToView(task, { assignees });
      if (view.dueDate > today) continue;

      const projectName = data.projectNameMap[task.projectId] ?? "Project";
      const targets =
        options.scope === "mine"
          ? assignees.filter((a) => a.userId === userId)
          : assignees.length > 0
            ? assignees
            : [null];

      for (const assignee of targets) {
        rows.push({
          item: mapTaskToTodaysItem(view, projectName, assignee),
          dueDate: view.dueDate,
        });
      }
    }

    rows.sort((a, b) => {
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return a.item.title.localeCompare(b.item.title);
    });

    return rows.slice(0, DISPLAY_LIMIT).map((r) => r.item);
  }, [authOff, data, ledProjectIds, options.scope, userId]);

  return {
    items,
    isLoading: enabled && isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load today's tasks") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
