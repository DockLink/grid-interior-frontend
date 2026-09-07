"use client";

import { useMemo } from "react";
import { toast } from "sonner";

import type {
  AttentionItem,
  FileActivityItem,
  ProjectOverviewItem,
  StatItem,
  TodaysTaskItem,
} from "@/components/dashboard/studio/demo-data";
import { useAccessRequests } from "@/hooks/use-access-requests";
import { useHoldRequests } from "@/hooks/use-project-hold-requests";
import { useLedProjects } from "@/hooks/use-led-projects";
import { useMemberProjects } from "@/hooks/use-member-projects";
import { useMyTasks } from "@/hooks/use-my-tasks";
import { useNotifications } from "@/hooks/use-notifications";
import { useProjects } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  buildAdminStats,
  buildLeadStats,
  buildMemberStats,
  buildSuperAdminStats,
  fileActivityFromNotifications,
  mapAccessRequestToAttention,
  mapHoldRequestToAttention,
  mapProjectToOverview,
  mapTaskToAttention,
  mapTaskToTodaysItem,
} from "@/lib/dashboard/map-dashboard-data";

export type DashboardRole = "admin" | "superadmin" | "lead" | "member";

export function useDashboardData(role: DashboardRole) {
  const authDisabled = isAuthDisabled();

  const { projects, isLoading: projectsLoading } = useProjects({
    status: "ACTIVE",
    limit: 100,
  });
  const { users, isLoading: usersLoading } = useUsers({ limit: 100 });
  const { requests: accessRequests, isLoading: accessLoading } = useAccessRequests({
    status: "PENDING",
    page: 1,
    limit: 50,
  });
  const { requests: holdRequests, isLoading: holdsLoading } = useHoldRequests({
    status: "PENDING",
    limit: 100,
  });
  const { tasks: myTasks, projectNameMap, isLoading: tasksLoading } = useMyTasks();
  const { ledProjects, rawProjects: ledRawProjects, isLoading: ledLoading } = useLedProjects();
  const { memberProjects, rawProjects: memberRawProjects, isLoading: memberLoading } =
    useMemberProjects();
  const {
    notifications,
    isLoading: notifLoading,
    processAccessRequest,
    processHoldRequest,
    refetch: refetchNotifications,
  } = useNotifications();

  const today = new Date().toISOString().slice(0, 10);

  const openTasks = useMemo(
    () => myTasks.filter((t) => t.status !== "done"),
    [myTasks],
  );
  const overdueTasks = useMemo(
    () => myTasks.filter((t) => t.dueDate < today && t.status !== "done"),
    [myTasks, today],
  );
  const todaysTasks = useMemo(
    () =>
      myTasks
        .filter((t) => t.dueDate === today || t.dueDate < today)
        .slice(0, 8)
        .map((t) => mapTaskToTodaysItem(t, projectNameMap[t.raw.projectId] ?? "Project")),
    [myTasks, projectNameMap, today],
  );

  const fileActivity: FileActivityItem[] = useMemo(
    () => fileActivityFromNotifications(notifications),
    [notifications],
  );

  const stats: StatItem[] = useMemo(() => {
    if (role === "superadmin") {
      return buildSuperAdminStats({
        activeProjects: projects.length,
        totalUsers: users.length,
        pendingAccess: accessRequests.length,
        openTasks: openTasks.length,
      });
    }
    if (role === "admin") {
      return buildAdminStats({
        activeProjects: projects.length,
        pendingAccess: accessRequests.length,
        pendingHolds: holdRequests.length,
        openTasks: openTasks.length,
      });
    }
    if (role === "lead") {
      return buildLeadStats({
        ledProjects: ledProjects.length,
        openTasks: openTasks.length,
        overdueTasks: overdueTasks.length,
      });
    }
    return buildMemberStats({
      assignedProjects: memberProjects.length,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
    });
  }, [
    role,
    projects.length,
    users.length,
    accessRequests.length,
    holdRequests.length,
    openTasks.length,
    overdueTasks.length,
    ledProjects.length,
    memberProjects.length,
  ]);

  const attention: AttentionItem[] = useMemo(() => {
    if (role === "member") {
      return overdueTasks.slice(0, 5).map((t) =>
        mapTaskToAttention(t, projectNameMap[t.raw.projectId] ?? "Project"),
      );
    }

    const items: AttentionItem[] = [];

    if (role === "admin" || role === "superadmin") {
      items.push(...accessRequests.slice(0, 5).map(mapAccessRequestToAttention));
      items.push(...holdRequests.slice(0, 5).map(mapHoldRequestToAttention));
    } else if (role === "lead") {
      const ledIds = new Set(ledProjects.map((p) => p.id));
      items.push(
        ...holdRequests
          .filter((h) => h.task?.projectId && ledIds.has(h.task.projectId))
          .slice(0, 5)
          .map(mapHoldRequestToAttention),
      );
      items.push(
        ...accessRequests
          .filter((a) => ledIds.has(a.projectId))
          .slice(0, 5)
          .map(mapAccessRequestToAttention),
      );
    }

    return items.slice(0, 8);
  }, [role, accessRequests, holdRequests, ledProjects, overdueTasks, projectNameMap]);

  const projectOverview: ProjectOverviewItem[] = useMemo(() => {
    if (role === "lead") {
      return ledRawProjects.slice(0, 6).map(mapProjectToOverview);
    }
    if (role === "member") {
      return memberRawProjects.slice(0, 6).map(mapProjectToOverview);
    }
    return projects.slice(0, 6).map(mapProjectToOverview);
  }, [role, projects, ledRawProjects, memberRawProjects]);

  const isLoading =
    !authDisabled &&
    (projectsLoading ||
      accessLoading ||
      holdsLoading ||
      tasksLoading ||
      notifLoading ||
      (role === "superadmin" && usersLoading) ||
      (role === "lead" && ledLoading) ||
      (role === "member" && memberLoading));

  async function handleAttentionAction(item: AttentionItem, action: "approve" | "decline") {
    if (!item.sourceId) return;
    try {
      if (item.type === "access") {
        await processAccessRequest({
          accessRequestId: item.sourceId,
          action: action === "approve" ? "approve" : "reject",
          grantedRole: action === "approve" ? "MEMBER" : undefined,
        });
        toast.success(action === "approve" ? "Access request approved" : "Access request declined");
      } else if (item.type === "hold") {
        await processHoldRequest({
          taskableHoldRequestId: item.sourceId,
          action: action === "approve" ? "approve" : "reject",
        });
        toast.success(action === "approve" ? "Hold request approved" : "Hold request declined");
      }
      await refetchNotifications();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  return {
    stats,
    attention,
    projects: projectOverview,
    todaysTasks,
    fileActivity,
    isLoading,
    authDisabled,
    handleAttentionAction,
  };
}
