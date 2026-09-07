import { PHASES, type ProjectPhase } from "@/lib/projects/design-tokens";
import type { ProjectCardView } from "@/types/projects";
import type { ActiveProjectView, HistoricalProjectView } from "@/types/project-hub";

export function stageToPhase(stage: string | null | undefined): ProjectPhase {
  if (!stage) return "Consultation";
  const normalized = stage.trim().toLowerCase();
  const match = PHASES.find((p) => p.toLowerCase() === normalized);
  if (match) return match;
  if (normalized.includes("concept")) return "Concept Design";
  if (normalized.includes("layout")) return "Layout";
  if (normalized.includes("3d")) return "3D Design";
  if (normalized.includes("detail") || normalized.includes("drawing")) return "Detail Drawings";
  if (normalized.includes("execution") || normalized.includes("site")) return "Execution";
  if (normalized.includes("consult")) return "Consultation";
  return "Consultation";
}

export function phaseIndex(phase: ProjectPhase): number {
  const idx = PHASES.indexOf(phase);
  return idx >= 0 ? idx : 0;
}

export function mapProjectCardToActiveView(card: ProjectCardView): ActiveProjectView {
  const phase = stageToPhase(card.currentStage);
  return {
    id: card.id,
    name: card.name,
    clientId: 0,
    clientName: card.client,
    phase,
    phaseIndex: phaseIndex(phase),
    status: card.status === "Active" ? "In Progress" : "Completed",
    progress: card.completion ?? 0,
    nextDeadline: card.updatedAt ?? "—",
    teamIds: [],
    startDate: card.startDate ?? "—",
    endDate: card.endDate ?? undefined,
    location: card.location ?? "",
    distanceKm: 0,
    projectType: "Interior Design",
    tasksTotal: 0,
    tasksDone: 0,
    daysActive: 0,
    description: "",
    activity: [],
  };
}

export function mapProjectCardToHistoricalView(card: ProjectCardView): HistoricalProjectView {
  const yearSource = card.updatedAtIso ?? card.created_at;
  const year = yearSource ? new Date(yearSource).getFullYear() : new Date().getFullYear();

  return {
    id: card.id,
    name: card.name,
    clientName: card.client,
    startDate: card.startDate ?? "—",
    completionDate: card.updatedAt ?? "—",
    year: Number.isNaN(year) ? new Date().getFullYear() : year,
    type: "Interior Design",
    description: card.location ?? "",
    photo: card.thumbnail,
    photoAlt: card.name,
  };
}

export function filterActiveByPhase(
  projects: ActiveProjectView[],
  phaseFilter: string,
): ActiveProjectView[] {
  if (phaseFilter === "All") return projects;
  return projects.filter((p) => p.phase === phaseFilter);
}

export function filterActiveByStatus(
  projects: ActiveProjectView[],
  statusFilter: string,
): ActiveProjectView[] {
  if (statusFilter === "All") return projects;
  return projects.filter((p) => p.status === statusFilter);
}

export function filterHistoricalByYear(
  projects: HistoricalProjectView[],
  yearFilter: string,
): HistoricalProjectView[] {
  if (yearFilter === "All") return projects;
  const year = Number(yearFilter);
  if (Number.isNaN(year)) return projects;
  return projects.filter((p) => p.year === year);
}
