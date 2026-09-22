import type {
  AttentionItem,
  FileActivityItem,
  ProjectOverviewItem,
  StatItem,
  TodaysTaskItem,
} from "@/components/dashboard/studio/demo-data";
import { stageToPhase } from "@/lib/projects/map-project-hub";
import { resolveProjectProgress } from "@/lib/projects/project-progress";
import { todayIsoDate } from "@/lib/suppliers/map-vendor-tasks";
import type { ProjectTaskView } from "@/lib/tasks/task-board";
import type { AccessRequest } from "@/types/access-requests";
import type { AppNotification, FileVersionAppNotification } from "@/types/notifications";
import type { Project, ProjectCardView } from "@/types/projects";
import type { TaskableHoldRequest } from "@/types/hold-requests";
import { getUserInitials } from "@/lib/user/display";

function hashStringToNumber(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

const MEMBER_COLORS = ["#0E7C86", "#7C3AED", "#0891B2", "#D97706", "#1B2A4A"];

function initialsColor(name: string): string {
  return MEMBER_COLORS[hashStringToNumber(name) % MEMBER_COLORS.length];
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fileExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "file";
}

export function mapAccessRequestToAttention(req: AccessRequest): AttentionItem {
  const name =
    [
      req.requestedBy?.firstName ?? req.requestedBy?.first_name,
      req.requestedBy?.lastName ?? req.requestedBy?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    req.requestedBy?.email ||
    "Member";
  return {
    id: hashStringToNumber(req.id),
    sourceId: req.id,
    type: "access",
    requester: name,
    initials: getUserInitials({
      email: req.requestedBy?.email ?? "",
      first_name: req.requestedBy?.firstName ?? req.requestedBy?.first_name,
      last_name: req.requestedBy?.lastName ?? req.requestedBy?.last_name,
    }),
    color: initialsColor(name),
    project: req.project?.name ?? "Project",
    date: formatShortDate(req.created_at ?? new Date().toISOString()),
    detail: req.requestNote ?? undefined,
  };
}

export function mapHoldRequestToAttention(req: TaskableHoldRequest): AttentionItem {
  const name =
    [req.requestedBy?.firstName, req.requestedBy?.lastName].filter(Boolean).join(" ").trim() ||
    req.requestedBy?.email ||
    "Member";
  return {
    id: hashStringToNumber(req.id),
    sourceId: req.id,
    type: "hold",
    requester: name,
    initials: getUserInitials({
      email: req.requestedBy?.email ?? "",
      first_name: req.requestedBy?.firstName,
      last_name: req.requestedBy?.lastName,
    }),
    color: initialsColor(name),
    project: req.task?.title ?? "Task hold",
    date: formatShortDate(req.created_at ?? new Date().toISOString()),
    detail: req.reason,
  };
}

export function mapTaskToAttention(task: ProjectTaskView, projectName: string): AttentionItem {
  const assignee = task.assignees[0];
  const name = assignee?.name ?? "You";
  const today = todayIsoDate();
  const overdue = task.status !== "done" && task.dueDate < today;
  return {
    id: hashStringToNumber(task.id),
    sourceId: task.id,
    type: "task",
    requester: task.title,
    initials: assignee?.initials ?? "?",
    color: initialsColor(name),
    project: projectName,
    date: formatShortDate(task.dueDate),
    detail: overdue ? "Overdue" : task.dueDate === today ? "Due today" : undefined,
  };
}

export function mapProjectToOverview(project: Project | ProjectCardView): ProjectOverviewItem {
  const name = project.name;
  const client =
    "client" in project
      ? typeof project.client === "string"
        ? project.client
        : project.client?.name ?? "Client"
      : "Client";
  const code = "code" in project ? project.code : project.number ?? "";
  const rawStage =
    ("currentStage" in project && project.currentStage) ||
    ("current_stage" in project && project.current_stage) ||
    null;

  const isInactive = project.status === "INACTIVE" || project.status === "Inactive";
  const completion = resolveProjectProgress({
    apiCompletion: "completion" in project ? project.completion : null,
    currentStage: rawStage,
    projectStatus: isInactive ? "INACTIVE" : "ACTIVE",
  });

  let status: ProjectOverviewItem["status"] = "on-track";
  if (isInactive) status = "inactive";
  else if (completion >= 100) status = "completed";

  return {
    id: hashStringToNumber(project.id),
    projectId: project.id,
    code: code.slice(0, 12),
    name,
    client,
    phase: stageToPhase(rawStage),
    nextDeadline: "—",
    status,
    progress: completion,
  };
}

export function mapTaskToTodaysItem(
  task: ProjectTaskView,
  projectName: string,
  assignee?: ProjectTaskView["assignees"][number] | null,
): TodaysTaskItem {
  const resolved = assignee ?? task.assignees[0] ?? null;
  const priorityMap = {
    CRITICAL: "high" as const,
    HIGH: "high" as const,
    MEDIUM: "medium" as const,
    LOW: "low" as const,
  };

  let status: TodaysTaskItem["status"] = "todo";
  if (task.apiStatus === "IN_REVIEW") status = "review";
  else if (task.status === "in-progress") status = "in-progress";

  return {
    id: resolved ? `${task.id}:${resolved.userId}` : task.id,
    title: task.title,
    project: projectName,
    projectId: task.raw.projectId,
    status,
    priority: priorityMap[task.priority] ?? "medium",
    assignee: {
      name: resolved?.name ?? "Unassigned",
      initials: resolved?.initials ?? "?",
      color: initialsColor(resolved?.userId ?? task.id),
    },
  };
}

export function mapFileNotificationToActivity(n: FileVersionAppNotification): FileActivityItem {
  return {
    id: hashStringToNumber(n.id),
    name: n.newFileName,
    ext: fileExt(n.newFileName),
    project: n.projectName,
    uploader: n.requesterName,
    time: formatShortDate(n.createdAt),
  };
}

export function mapRecentFileToActivity(
  file: {
    id: string;
    fileName: string;
    projectName: string;
    created_at: string;
    uploadedById?: string;
  },
  uploaderById?: Record<string, string>,
): FileActivityItem {
  const uploader =
    (file.uploadedById && uploaderById?.[file.uploadedById]) || "Team member";
  return {
    id: hashStringToNumber(file.id),
    name: file.fileName || "Untitled file",
    ext: fileExt(file.fileName),
    project: file.projectName || "Project",
    uploader,
    time: formatShortDate(file.created_at),
  };
}

export function fileActivityFromRecentFiles(
  files: Array<{
    id: string;
    fileName: string;
    projectName: string;
    created_at: string;
    uploadedById?: string;
  }>,
  uploaderById?: Record<string, string>,
): FileActivityItem[] {
  return files.slice(0, 5).map((f) => mapRecentFileToActivity(f, uploaderById));
}

export function buildAdminStats(input: {
  activeProjects: number;
  pendingAccess: number;
  pendingHolds: number;
  openTasks: number;
}): StatItem[] {
  return [
    {
      label: "Active Projects",
      value: String(input.activeProjects),
      icon: "folder",
      accent: "#0B2545",
      bg: "rgba(11,37,69,0.08)",
    },
    {
      label: "Pending Access Requests",
      value: String(input.pendingAccess),
      icon: "user-plus",
      accent: "#0FA8A0",
      bg: "rgba(15,168,160,0.1)",
    },
    {
      label: "Pending Hold Requests",
      value: String(input.pendingHolds),
      icon: "pause",
      accent: "#FF6B6B",
      bg: "#FDECEC",
    },
    {
      label: "My Open Tasks",
      value: String(input.openTasks),
      icon: "check",
      accent: "#2FBE6B",
      bg: "#E7F9EE",
    },
  ];
}

export function buildSuperAdminStats(input: {
  activeProjects: number;
  totalUsers: number;
  pendingAccess: number;
  openTasks: number;
}): StatItem[] {
  return [
    {
      label: "Active Projects",
      value: String(input.activeProjects),
      icon: "folder",
      accent: "#0B2545",
      bg: "rgba(11,37,69,0.08)",
    },
    {
      label: "Total Users",
      value: String(input.totalUsers),
      icon: "users",
      accent: "#0FA8A0",
      bg: "rgba(15,168,160,0.1)",
    },
    {
      label: "Pending Access Requests",
      value: String(input.pendingAccess),
      icon: "user-plus",
      accent: "#FF6B6B",
      bg: "#FDECEC",
    },
    {
      label: "My Open Tasks",
      value: String(input.openTasks),
      icon: "check",
      accent: "#2FBE6B",
      bg: "#E7F9EE",
    },
  ];
}

export function buildLeadStats(input: {
  ledProjects: number;
  openTasks: number;
  overdueTasks: number;
}): StatItem[] {
  return [
    {
      label: "Led Projects",
      value: String(input.ledProjects),
      icon: "folder",
      accent: "#0B2545",
      bg: "rgba(11,37,69,0.08)",
    },
    {
      label: "Open Tasks",
      value: String(input.openTasks),
      icon: "list",
      accent: "#0FA8A0",
      bg: "rgba(15,168,160,0.1)",
    },
    {
      label: "Overdue Items",
      value: String(input.overdueTasks),
      icon: "flag",
      accent: "#FF6B6B",
      bg: "#FDECEC",
    },
    {
      label: "Team Members",
      value: "—",
      icon: "users",
      accent: "#2FBE6B",
      bg: "#E7F9EE",
    },
  ];
}

export function buildMemberStats(input: {
  assignedProjects: number;
  openTasks: number;
  overdueTasks: number;
}): StatItem[] {
  return [
    {
      label: "Assigned Projects",
      value: String(input.assignedProjects),
      icon: "folder",
      accent: "#0B2545",
      bg: "rgba(11,37,69,0.08)",
    },
    {
      label: "Open Tasks",
      value: String(input.openTasks),
      icon: "list",
      accent: "#0FA8A0",
      bg: "rgba(15,168,160,0.1)",
    },
    {
      label: "Overdue Items",
      value: String(input.overdueTasks),
      icon: "flag",
      accent: "#FF6B6B",
      bg: "#FDECEC",
    },
    {
      label: "Due Today",
      value: String(input.openTasks),
      icon: "calendar",
      accent: "#2FBE6B",
      bg: "#E7F9EE",
    },
  ];
}

export function fileActivityFromNotifications(notifications: AppNotification[]): FileActivityItem[] {
  return notifications
    .filter((n): n is FileVersionAppNotification => n.type === "file_version")
    .slice(0, 5)
    .map(mapFileNotificationToActivity);
}

/** Prefer recently uploaded files; fall back to file-version notifications. */
export function buildFileActivity(input: {
  recentFiles: Array<{
    id: string;
    fileName: string;
    projectName: string;
    created_at: string;
    uploadedById?: string;
  }>;
  notifications: AppNotification[];
  authDisabled?: boolean;
  demoData: FileActivityItem[];
  uploaderById?: Record<string, string>;
}): FileActivityItem[] {
  if (input.authDisabled) return input.demoData;
  const fromRecent = fileActivityFromRecentFiles(input.recentFiles, input.uploaderById);
  if (fromRecent.length > 0) return fromRecent;
  return fileActivityFromNotifications(input.notifications);
}
