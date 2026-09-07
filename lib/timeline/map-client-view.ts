import type { GanttPhase, Milestone } from "@/lib/timeline/mock-timeline";
import type { SiteSubStageStatus } from "@/types/execution";
import type { Task, TaskableStatus } from "@/types/tasks";

export type ClientKeyDateStatus = "upcoming" | "completed" | "active";

export interface ClientKeyDateCard {
  id: string;
  label: string;
  date: string;
  icon: string;
  status: ClientKeyDateStatus;
}

export interface ClientSubStageCard {
  id: string;
  number: string;
  name: string;
  detail: string;
  status: SiteSubStageStatus;
  dateLabel: string;
  checkpoint: boolean;
}

const FURNITURE_RE = /furniture|procurement|ff\s*&?\s*e|delivery/i;
const HANDOVER_RE = /handover|hand[\s-]?over|completion|close[\s-]?out/i;
const SITE_STAGE_RE = /site|execution/i;

function formatLabel(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function keyDateStatusFromIso(iso: string, now = new Date()): ClientKeyDateStatus {
  const day = iso.slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  if (!day || day === "—") return "upcoming";
  if (day < today) return "completed";
  if (day === today) return "active";
  return "upcoming";
}

function keyDateStatusFromMilestone(m: Milestone | undefined, fallbackIso: string, now = new Date()): ClientKeyDateStatus {
  if (!m) return keyDateStatusFromIso(fallbackIso, now);
  if (m.status === "completed") return "completed";
  if (m.status === "overdue") return "active";
  return "upcoming";
}

export function averagePhaseProgress(phases: GanttPhase[]): number {
  if (phases.length === 0) return 0;
  return Math.round(phases.reduce((sum, p) => sum + p.progress, 0) / phases.length);
}

export function isSiteExecutionPhase(name: string): boolean {
  return SITE_STAGE_RE.test(name);
}

export function findSiteExecutionStage(phases: GanttPhase[]): GanttPhase | undefined {
  return phases.find((p) => isSiteExecutionPhase(p.name));
}

export function mapClientKeyDates(args: {
  projectStartIso: string;
  projectEndIso: string;
  projectStartLabel: string;
  projectEndLabel: string;
  milestones: Milestone[];
  now?: Date;
}): ClientKeyDateCard[] {
  const now = args.now ?? new Date();
  const furniture =
    args.milestones.find((m) => FURNITURE_RE.test(m.name)) ??
    args.milestones.find((m) => m.status === "upcoming" || m.status === "overdue") ??
    args.milestones[0];
  const handoverNamed = [...args.milestones].reverse().find((m) => HANDOVER_RE.test(m.name));
  const handover = handoverNamed ?? args.milestones[args.milestones.length - 1];

  return [
    {
      id: "start",
      label: "Project start",
      date: args.projectStartLabel,
      icon: "flag",
      status: keyDateStatusFromIso(args.projectStartIso, now),
    },
    {
      id: "furniture",
      label: "Furniture delivery",
      date: furniture?.date ?? "—",
      icon: "weekend",
      status: keyDateStatusFromMilestone(furniture, args.projectStartIso, now),
    },
    {
      id: "handover",
      label: "Handover",
      date: handover?.date ?? args.projectEndLabel,
      icon: "handshake",
      status: keyDateStatusFromMilestone(
        handover,
        args.projectEndIso,
        now,
      ),
    },
  ];
}

function mapTaskStatusToSite(status: TaskableStatus): SiteSubStageStatus {
  if (status === "COMPLETED") return "complete";
  if (status === "IN_PROGRESS" || status === "IN_REVIEW" || status === "REOPENED") {
    return "in-progress";
  }
  if (status === "ON_HOLD") return "blocked";
  return "upcoming";
}

export function mapSiteSubstageCards(
  tasks: Task[],
  parentStageId: string,
): ClientSubStageCard[] {
  return tasks
    .filter((t) => t.parentTaskableId === parentStageId)
    .sort((a, b) => a.order - b.order)
    .map((t, index) => ({
      id: t.id,
      number: String(t.order || index + 1),
      name: t.title,
      detail: t.description?.trim() || "",
      status: mapTaskStatusToSite(t.status),
      dateLabel: formatLabel(t.start_date),
      checkpoint: t.taskablePriority === "HIGH" || t.taskablePriority === "CRITICAL",
    }));
}

export function siteProgressFromCards(
  cards: ClientSubStageCard[],
): { progress: number; status: "completed" | "active" | "upcoming" } {
  const total = cards.length || 1;
  const complete = cards.filter((s) => s.status === "complete").length;
  const inProgress = cards.some((s) => s.status === "in-progress");
  const progress = cards.length === 0 ? 0 : Math.round((complete / total) * 100);
  if (cards.length > 0 && complete === cards.length) {
    return { progress: 100, status: "completed" };
  }
  if (inProgress || complete > 0) return { progress, status: "active" };
  return { progress: 0, status: "upcoming" };
}
