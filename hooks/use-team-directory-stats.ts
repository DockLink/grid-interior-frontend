"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { isTaskCompleted } from "@/lib/projects/map-stages";
import { mapProjectMembersList } from "@/lib/projects/map-project-members";
import { toProjectsQueryString } from "@/lib/projects/query-string";
import { queryKeys } from "@/lib/query/keys";
import { toTasksQueryString } from "@/lib/tasks/query-string";
import type { ProjectMember, ProjectsListResponse } from "@/types/projects";
import type { Task, TaskAssigneeRecord, TasksListResponse } from "@/types/tasks";

function emptyCounts(): Map<string, number> {
  return new Map();
}

function increment(map: Map<string, number>, userId: string) {
  if (!userId) return;
  map.set(userId, (map.get(userId) ?? 0) + 1);
}

/**
 * Live Team Directory card stats (projects assigned + open tasks).
 * Reuses project-members cache so Assignment tab saves refresh the directory.
 */
export function useTeamDirectoryStats(enabled = true) {
  const authOff = isAuthDisabled();
  const active = enabled && !authOff;

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.list({ page: 1, limit: 100, status: "ACTIVE" }),
    queryFn: () =>
      authApiClient<ProjectsListResponse>(
        `/projects${toProjectsQueryString({ page: 1, limit: 100, status: "ACTIVE" })}`,
      ),
    staleTime: 30_000,
    enabled: active,
  });

  const projectIds = useMemo(
    () => (projectsQuery.data?.data ?? []).map((p) => p.id),
    [projectsQuery.data],
  );

  const memberQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: queryKeys.projects.members(projectId),
      queryFn: async () => {
        const result = await authApiClient<{ members: ProjectMember[] }>(
          `/projects/${projectId}/members`,
        );
        return mapProjectMembersList(result);
      },
      staleTime: 30_000,
      refetchOnMount: "always" as const,
      enabled: active && Boolean(projectId),
    })),
  });

  const projectCountByUserId = useMemo(() => {
    const counts = emptyCounts();
    memberQueries.forEach((q) => {
      if (!q.data) return;
      for (const member of q.data) {
        if (member.status !== "ACTIVE") continue;
        increment(counts, member.user_id);
      }
    });
    return counts;
  }, [memberQueries]);

  const openTasksQuery = useQuery({
    queryKey: queryKeys.team.directoryStats(),
    queryFn: async () => {
      const tasksRes = await authApiClient<TasksListResponse>(
        `/tasks${toTasksQueryString({
          taskable_type: "TASK",
          limit: 200,
          depth: 0,
        })}`,
      );
      const tasks: Task[] = (tasksRes.data ?? []).filter((t) => !isTaskCompleted(t.status));
      if (tasks.length === 0) return emptyCounts();

      let assigneeMap: Record<string, TaskAssigneeRecord[]> = {};
      try {
        assigneeMap = await authApiClient<Record<string, TaskAssigneeRecord[]>>(
          "/tasks/batch-assignees",
          {
            method: "POST",
            body: JSON.stringify({ task_ids: tasks.map((t) => t.id) }),
          },
        );
      } catch {
        return emptyCounts();
      }

      const counts = emptyCounts();
      for (const task of tasks) {
        const records = assigneeMap[task.id] ?? [];
        const seen = new Set<string>();
        for (const r of records) {
          if (r.status !== "ACTIVE" || !r.user_id || seen.has(r.user_id)) continue;
          seen.add(r.user_id);
          increment(counts, r.user_id);
        }
      }
      return counts;
    },
    staleTime: 30_000,
    refetchOnMount: "always",
    enabled: active,
  });

  const membersLoading = memberQueries.some((q) => q.isLoading);
  const isLoading =
    active &&
    (projectsQuery.isLoading || membersLoading || openTasksQuery.isLoading);

  return {
    projectCountByUserId,
    openTaskCountByUserId: openTasksQuery.data ?? emptyCounts(),
    isLoading,
  };
}
