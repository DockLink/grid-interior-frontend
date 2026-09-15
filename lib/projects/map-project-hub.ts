import {
  PHASES,
  type PhaseWorkspace,
  type ProjectPhase,
} from "@/lib/projects/design-tokens";
import {
  FALLBACK_THUMBNAIL,
  mapProjectToCard,
  projectThumbnailUrl,
} from "@/lib/projects/map-projects";
import { resolveProjectEndDate } from "@/lib/projects/duration";
import type { Project, ProjectCardView } from "@/types/projects";
import type {
  ActiveProjectView,
  HistoricalGalleryItem,
  HistoricalProjectView,
} from "@/types/project-hub";

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

const WORKSPACE_TO_PHASE: Record<PhaseWorkspace, ProjectPhase> = {
  consultation: "Consultation",
  concept: "Concept Design",
  detail: "Detail Drawings",
  layout: "Layout",
  threed: "3D Design",
  execution: "Execution",
};

export function workspaceToPhase(id: PhaseWorkspace): ProjectPhase {
  return WORKSPACE_TO_PHASE[id];
}

/** Past phases are locked; current and later remain editable. */
export function isPhaseEditable(current: ProjectPhase, target: ProjectPhase): boolean {
  return phaseIndex(target) >= phaseIndex(current);
}

export function phaseWorkspaceStatus(
  currentPhaseIndex: number,
  targetPhaseIndex: number,
): "Completed" | "In Progress" | "Upcoming" {
  if (targetPhaseIndex < currentPhaseIndex) return "Completed";
  if (targetPhaseIndex === currentPhaseIndex) return "In Progress";
  return "Upcoming";
}

/**
 * Prefer STAGE taskable progress over project.current_stage (API may not accept
 * current_stage on PATCH). First non-COMPLETED phase in order is current.
 */
export function resolveCurrentPhase(
  currentStage: string | null | undefined,
  stages?: { title?: string | null; status?: string | null }[],
): ProjectPhase {
  if (stages?.length) {
    let matchedAny = false;
    for (const phase of PHASES) {
      const needle = phase.toLowerCase();
      const stage =
        stages.find((t) => (t.title ?? "").trim().toLowerCase() === needle) ??
        stages.find((t) => (t.title ?? "").toLowerCase().includes(needle));
      if (!stage) continue;
      matchedAny = true;
      if (stage.status !== "COMPLETED") return phase;
    }
    if (matchedAny) return "Execution";
  }
  return stageToPhase(currentStage);
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
    distanceKm: null,
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

export function mapProjectToHistoricalView(project: Project): HistoricalProjectView {
  const card = mapProjectToCard(project);
  const endIso = resolveProjectEndDate(project);
  const yearSource = endIso ?? project.updated_at ?? project.created_at;
  const year = yearSource ? new Date(yearSource).getFullYear() : new Date().getFullYear();
  const type =
    [project.main_type, project.sub_type].filter(Boolean).join(" · ") || "Interior Design";

  return {
    id: project.id,
    name: project.name,
    clientName: project.client?.name ?? "No client",
    startDate: card.startDate ?? "—",
    completionDate: card.endDate ?? card.updatedAt ?? "—",
    year: Number.isNaN(year) ? new Date().getFullYear() : year,
    type,
    description: project.description?.trim() || project.location || "",
    photo: projectThumbnailUrl(project.images),
    photoAlt: project.name,
  };
}

export function mapProjectImagesToGallery(project: Project): HistoricalGalleryItem[] {
  const source = project.images ?? [];
  if (!source.length) {
    return [
      {
        url: FALLBACK_THUMBNAIL,
        alt: project.name,
        caption: project.name,
      },
    ];
  }
  return source.map((img, idx) => ({
    url: img.url,
    alt: `${project.name} photo ${idx + 1}`,
    caption: idx === 0 ? "Cover" : `Photo ${idx + 1}`,
  }));
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
