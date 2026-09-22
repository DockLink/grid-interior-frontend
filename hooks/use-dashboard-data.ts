"use client";

import { useMemo } from "react";
import { toast } from "sonner";

import {
  ATTENTION_DATA,
  FILE_ACTIVITY_DATA,
  LEAD_ATTENTION_DATA,
  MEMBER_ATTENTION_DATA,
  type AttentionItem,
  type FileActivityItem,
  type ProjectOverviewItem,
  type StatItem,
} from "@/components/dashboard/studio/demo-data";
import { useAccessRequests } from "@/hooks/use-access-requests";
import { useHoldRequests } from "@/hooks/use-project-hold-requests";
import { useLedProjects } from "@/hooks/use-led-projects";
import { useMemberProjects } from "@/hooks/use-member-projects";
import { useMyTasks } from "@/hooks/use-my-tasks";
import { useNotifications } from "@/hooks/use-notifications";
import { useProjects } from "@/hooks/use-projects";
import { useGlobalRecentFiles } from "@/hooks/use-global-recent-files";
import { useTodaysTasks, type TodaysTasksScope } from "@/hooks/use-todays-tasks";
import { useUsers } from "@/hooks/use-users";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  buildAdminStats,
  buildFileActivity,
  buildLeadStats,
  buildMemberStats,
  buildSuperAdminStats,
  mapAccessRequestToAttention,
  mapHoldRequestToAttention,
  mapProjectToOverview,
  mapTaskToAttention,
} from "@/lib/dashboard/map-dashboard-data";
import { todayIsoDate } from "@/lib/suppliers/map-vendor-tasks";
import { getUserListPrimaryLabel } from "@/lib/user/display";

export type DashboardRole = "admin" | "superadmin" | "lead" | "member";

function todaysScopeForRole(role: DashboardRole): TodaysTasksScope {
  if (role === "lead") return "led";
  if (role === "member") return "mine";
  return "org";
}

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
  const { tasks: myTasks, projectNameMap, isLoading: myTasksLoading } = useMyTasks();
  const {
    ledProjects,
    ledProjectIds: allLedProjectIds,
    rawProjects: ledRawProjects,
    isLoading: ledLoading,
  } = useLedProjects();
  const { memberProjects, rawProjects: memberRawProjects, isLoading: memberLoading } =
    useMemberProjects();
  const todaysScope = todaysScopeForRole(role);
  const {
    items: todaysTasks,
    isLoading: todaysTasksLoading,
  } = useTodaysTasks({
    scope: todaysScope,
    ledProjectIds: todaysScope === "led" ? allLedProjectIds : [],
  });
  const {
    notifications,
    processAccessRequest,
    processHoldRequest,
    refetch: refetchNotifications,
  } = useNotifications();
  const { files: recentFiles } = useGlobalRecentFiles();

  const today = todayIsoDate();

  const uploaderById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const u of users) {
      map[u.id] = getUserListPrimaryLabel(u);
    }
    return map;
  }, [users]);

  const openTasks = useMemo(
    () => myTasks.filter((t) => t.status !== "done"),
    [myTasks],
  );
  const overdueTasks = useMemo(
    () => myTasks.filter((t) => t.dueDate < today && t.status !== "done"),
    [myTasks, today],
  );

  const fileActivity: FileActivityItem[] = useMemo(
    () =>
      buildFileActivity({
        recentFiles,
        notifications,
        authDisabled,
        demoData: FILE_ACTIVITY_DATA,
        uploaderById,
      }),
    [recentFiles, notifications, authDisabled, uploaderById],
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
    if (authDisabled) {
      if (role === "member") return MEMBER_ATTENTION_DATA;
      if (role === "lead") return LEAD_ATTENTION_DATA;
      return ATTENTION_DATA;
    }

    if (role === "member") {
      return myTasks
        .filter((t) => t.status !== "done" && t.dueDate <= today)
        .slice(0, 5)
        .map((t) => mapTaskToAttention(t, projectNameMap[t.raw.projectId] ?? "Project"));
    }

    const items: AttentionItem[] = [];
    const ledIds = new Set(allLedProjectIds);

    if (role === "admin" || role === "superadmin") {
      items.push(...accessRequests.slice(0, 5).map(mapAccessRequestToAttention));
      items.push(...holdRequests.slice(0, 5).map(mapHoldRequestToAttention));
    } else if (role === "lead") {
      items.push(
        ...holdRequests
          .filter((h) => {
            const projectId = h.task?.projectId;
            // Include when project is known and led; keep unscoping holds visible
            // so missing nested task.projectId does not empty the panel.
            if (!projectId) return true;
            return ledIds.has(projectId);
          })
          .slice(0, 5)
          .map(mapHoldRequestToAttention),
      );
      items.push(
        ...accessRequests
          .filter((a) => a.projectId && ledIds.has(a.projectId))
          .slice(0, 5)
          .map(mapAccessRequestToAttention),
      );
    }

    return items.slice(0, 8);
  }, [
    authDisabled,
    role,
    accessRequests,
    holdRequests,
    allLedProjectIds,
    myTasks,
    projectNameMap,
    today,
  ]);

  const projectOverview: ProjectOverviewItem[] = useMemo(() => {
    if (role === "lead") {
      return ledRawProjects.slice(0, 6).map(mapProjectToOverview);
    }
    if (role === "member") {
      return memberRawProjects.slice(0, 6).map(mapProjectToOverview);
    }
    return projects.slice(0, 6).map(mapProjectToOverview);
  }, [role, projects, ledRawProjects, memberRawProjects]);

  // Notification polling must not gate the whole dashboard — background
  // refreshes would otherwise blank the page into skeletons (auto-"refresh").
  const isLoading =
    !authDisabled &&
    (projectsLoading ||
      accessLoading ||
      holdsLoading ||
      myTasksLoading ||
      todaysTasksLoading ||
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
