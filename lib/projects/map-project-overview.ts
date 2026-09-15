import { distanceKmFromCoords } from "@/lib/maps/distance";
import { PHASES, type ProjectHealthStatus, type ProjectPhase } from "@/lib/projects/design-tokens";
import { resolveProjectEndDate } from "@/lib/projects/duration";
import { phaseIndex, resolveCurrentPhase } from "@/lib/projects/map-project-hub";
import type { HubActivityItem } from "@/types/project-hub";
import type { Project, ProjectMember, ProjectStatus } from "@/types/projects";

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

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function projectStatusToHealth(status: ProjectStatus): ProjectHealthStatus {
  return status === "ACTIVE" ? "In Progress" : "Completed";
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
    tasks?: { status: string }[];
    stages?: { title?: string | null; status?: string | null }[];
  } = {},
): ProjectOverviewView {
  const phase = resolveCurrentPhase(project.current_stage, options.stages);
  const tasks = options.tasks ?? [];
  const tasksDone = tasks.filter((t) => t.status === "COMPLETED").length;
  const activeMembers = (options.members ?? []).filter((m) => m.status === "ACTIVE");

  return {
    id: project.id,
    name: project.name,
    clientName: project.client?.name ?? "No client",
    clientId: project.client?.id ?? null,
    phase,
    phaseIndex: phaseIndex(phase),
    status: projectStatusToHealth(project.status),
    progress: tasks.length ? Math.round((tasksDone / tasks.length) * 100) : 0,
    nextDeadline: formatShortDate(project.updated_at),
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
    activity: [],
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
