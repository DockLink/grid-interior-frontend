"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { useProjectMembers } from "@/hooks/use-project-members";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { canManageProject, isActiveProjectMember } from "@/lib/projects/permissions";
import { queryKeys } from "@/lib/query/keys";
import { mapTask } from "@/lib/tasks/map-task";
import { toTasksQueryString } from "@/lib/tasks/query-string";
import type { TaskAssigneeRecord, TasksListResponse } from "@/types/tasks";

function useIsActiveTaskAssignee(projectId: string, enabled: boolean) {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const { data } = useQuery({
    queryKey: queryKeys.tasks.projectAssignee(projectId, userId),
    queryFn: async () => {
      const tasksQuery = toTasksQueryString({
        taskable_type: "TASK",
        projects: [projectId],
        limit: 200,
        depth: 0,
      });
      const tasksRes = await authApiClient<TasksListResponse>(`/tasks${tasksQuery}`);
      const tasks = (tasksRes.data ?? [])
        .map((task) => mapTask(task))
        .filter((task) => task.projectId === projectId);
      if (tasks.length === 0) return false;

      const assigneeMap = await authApiClient<Record<string, TaskAssigneeRecord[]>>(
        "/tasks/batch-assignees",
        {
          method: "POST",
          body: JSON.stringify({ task_ids: tasks.map((task) => task.id) }),
        },
      );

      return Object.values(assigneeMap).some((records) =>
        records.some((record) => record.status === "ACTIVE" && record.user_id === userId),
      );
    },
    staleTime: 30_000,
    enabled: enabled && !isAuthDisabled() && Boolean(userId),
  });

  return data === true;
}

/** Upload and minute-create access for an active member or an active task assignee. */
export function useProjectContribution(projectId: string) {
  const { user } = useAuth();
  const { members, effectiveRole, isViewer, isOrgGuest } = useProjectMembers();
  const canManage = canManageProject(effectiveRole, isViewer);
  const isMember = isActiveProjectMember(members, user?.id);
  const isTaskAssignee = useIsActiveTaskAssignee(
    projectId,
    !canManage && !isMember && !isOrgGuest,
  );
  const canContribute = !isOrgGuest && (canManage || isMember || isTaskAssignee);

  return { canManage, canContribute };
}
