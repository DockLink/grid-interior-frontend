import { distanceKmFromCoords } from "@/lib/maps/distance";
import { PHASES, type ProjectHealthStatus, type ProjectPhase } from "@/lib/projects/design-tokens";
import { resolveProjectEndDate } from "@/lib/projects/duration";
import { buildProjectOverviewActivity } from "@/lib/projects/map-project-activity";
import { phaseIndex, resolveCurrentPhase } from "@/lib/projects/map-project-hub";
import { isTaskCompleted, isTaskOverdue } from "@/lib/projects/map-stages";
import { resolveProjectProgress } from "@/lib/projects/project-progress";
import { resolveTaskEndDate } from "@/lib/tasks/task-dates";
import type { ProjectFile } from "@/types/files";
import type { HubActivityItem } from "@/types/project-hub";
import type { Project, ProjectMember, ProjectStatus } from "@/types/projects";
import type { Task } from "@/types/tasks";

export interface ProjectOverviewView {
  id: string;
  name: string;
  clientName: string;
  clientId: string | null;
  phase: ProjectPhase;
  phaseIndex: number;
  status: ProjectHealthStatus;
  progress: number;
  nextDeadline: string;
  /** Title of the open task that owns nextDeadline, when known. */
  nextDeadlineLabel: string | null;
  startDate: string;
  endDate: string;
  location: string;
  distanceKm: number | null;
  projectType: string;
  tasksTotal: number;
  tasksDone: number;
  daysActive: number;
  description: string;
  activity: HubActivityItem[];
  teamMemberIds: string[];
}

type OverviewTask = Pick<Task, "status"> &
  Partial<Pick<Task, "start_date" | "end_date" | "duration" | "durationHours" | "title">>;

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function projectStatusToHealth(status: ProjectStatus): ProjectHealthStatus {
  return status === "ACTIVE" ? "In Progress" : "Completed";
}

function toTaskDateLike(task: OverviewTask) {
  if (!task.start_date) return null;
  return {
    status: task.status,
    start_date: task.start_date,
    end_date: task.end_date,
    duration: task.duration,
    durationHours: task.durationHours,
  };
}

function resolveOverviewHealth(
  projectStatus: ProjectStatus,
  tasks: OverviewTask[],
): ProjectHealthStatus {
  if (projectStatus !== "ACTIVE") return "Completed";
  if (tasks.some((t) => {
    const dated = toTaskDateLike(t);
    return dated ? isTaskOverdue(dated) : false;
  })) {
    return "Overdue";
  }
  return "In Progress";
}

/** Soonest open-task end date (includes overdue — that is the urgent deadline). */
function resolveNextDeadline(tasks: OverviewTask[]): {
  date: string;
  label: string | null;
} {
  const open = tasks.filter((t) => !isTaskCompleted(t.status));
  const dated = open
    .map((task) => {
      const like = toTaskDateLike(task);
      if (!like) return null;
      return { task, due: resolveTaskEndDate(like) };
    })
    .filter((x): x is { task: OverviewTask; due: Date } => Boolean(x))
    .filter((x) => !Number.isNaN(x.due.getTime()))
    .sort((a, b) => a.due.getTime() - b.due.getTime());

  const next = dated[0];
  if (!next) return { date: "—", label: null };

  return {
    date: formatShortDate(next.due.toISOString()),
    label: next.task.title?.trim() || null,
  };
}

function daysSince(iso: string): number {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return 0;
  const diff = Date.now() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function mapProjectToOverviewView(
  project: Project,
  options: {
    members?: ProjectMember[];
    tasks?: OverviewTask[];
    /** Full task rows when available — used for Recent Activity timestamps/text. */
    activityTasks?: Task[];
    recentFiles?: ProjectFile[];
    stages?: { title?: string | null; status?: string | null }[];
    activity?: HubActivityItem[];
  } = {},
): ProjectOverviewView {
  const phase = resolveCurrentPhase(project.current_stage, options.stages);
  const tasks = options.tasks ?? [];
  const tasksDone = tasks.filter((t) => isTaskCompleted(t.status)).length;
  const activeMembers = (options.members ?? []).filter((m) => m.status === "ACTIVE");
  const nextDeadline = resolveNextDeadline(tasks);
  const activity =
    options.activity ??
    buildProjectOverviewActivity({
      files: options.recentFiles,
      tasks: options.activityTasks,
      members: options.members,
    });

  return {
    id: project.id,
    name: project.name,
    clientName: project.client?.name ?? "No client",
    clientId: project.client?.id ?? null,
    phase,
    phaseIndex: phaseIndex(phase),
    status: resolveOverviewHealth(project.status, tasks),
    progress: resolveProjectProgress({
      apiCompletion: project.completion,
      currentStage: project.current_stage,
      projectStatus: project.status,
      stages: options.stages,
      tasks,
      blendTasks: true,
    }),
    nextDeadline: nextDeadline.date,
    nextDeadlineLabel: nextDeadline.label,
    startDate: formatShortDate(project.start_date),
    endDate: formatShortDate(resolveProjectEndDate(project)),
    location: project.location ?? "—",
    distanceKm: distanceKmFromCoords(project.latitude, project.longitude),
    projectType:
      project.main_type && project.sub_type
        ? `${project.main_type} · ${project.sub_type}`
        : project.description?.trim() || "Interior Design",
    tasksTotal: tasks.length,
    tasksDone,
    daysActive: daysSince(project.start_date),
    description: project.description ?? "",
    activity,
    teamMemberIds: activeMembers.map((m) => m.user_id),
  };
}

export function projectStatusLabel(status: ProjectStatus): ProjectHealthStatus {
  return projectStatusToHealth(status);
}

export function formatProjectStartDate(iso: string | null | undefined): string {
  return formatShortDate(iso);
}

export const PROJECT_PHASES = PHASES;
