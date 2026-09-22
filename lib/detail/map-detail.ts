import type {
  DetailCategoryId,
  DetailCategoryStateApi,
  DetailCategoriesResponse,
  DirectorOverviewProjectApi,
  DirectorOverviewResponse,
  DirectorProject,
} from "@/types/detail";

const CAT_IDS: DetailCategoryId[] = [
  "electrical",
  "flooring",
  "ceiling",
  "walls",
  "furniture",
  "interior",
];

const DESIGNER_COLORS = [
  "#7C3AED",
  "#0891B2",
  "#D97706",
  "#059669",
  "#6366F1",
  "#0E7C86",
  "#DC2626",
];

/** Stage statuses that mean the project is currently in Detail Drawings. */
const IN_PHASE_STATUSES = new Set(["IN_PROGRESS", "IN_REVIEW"]);

function asCategoryId(id: string): DetailCategoryId {
  if (CAT_IDS.includes(id as DetailCategoryId)) return id as DetailCategoryId;
  return "electrical";
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return DESIGNER_COLORS[Math.abs(hash) % DESIGNER_COLORS.length]!;
}

function normalizeDesigner(
  raw: DirectorOverviewProjectApi["designer"],
): DirectorProject["designer"] {
  if (typeof raw === "string") {
    const name = raw.trim() || "Designer";
    return {
      name,
      initials: initialsFromName(name),
      color: colorFromName(name),
    };
  }
  const name = raw?.name?.trim() || "Designer";
  return {
    name,
    initials: raw?.initials || initialsFromName(name),
    color: raw?.color || colorFromName(name),
  };
}

function normalizeStatus(
  raw: DirectorOverviewProjectApi,
): DirectorProject["status"] {
  if (raw.status === "complete") return "complete";
  if (raw.status === "awaiting") return "awaiting";
  // Prefer stage status when Nest omits / mis-labels status
  if (raw.stage_status === "COMPLETED") return "complete";
  if (raw.stage_status === "IN_REVIEW") return "awaiting";
  return "awaiting";
}

/**
 * Nest returns `category_id` (slug) plus a row UUID in `id`.
 * Older/demo payloads may put the slug in `id` — accept either.
 */
export function mapDetailCategoryStates(raw: DetailCategoriesResponse) {
  return (raw.categories ?? []).map((c: DetailCategoryStateApi) => {
    const slug = String(c.category_id ?? c.id ?? "");
    return {
      id: asCategoryId(slug),
      complete: Boolean(c.complete),
      notes: c.notes ?? "",
      fileCount: c.file_count,
    };
  });
}

export function mapDirectorOverviewProject(
  raw: DirectorOverviewProjectApi,
): DirectorProject | null {
  const id = String(raw.project_id ?? raw.id ?? "").trim();
  if (!id) return null;

  const categories = {} as Record<DetailCategoryId, boolean>;
  for (const catId of CAT_IDS) {
    categories[catId] = Boolean(raw.categories?.[catId]);
  }

  return {
    id,
    name: raw.name || "Untitled project",
    client: (raw.client ?? raw.code ?? "").trim(),
    designer: normalizeDesigner(raw.designer),
    daysInPhase: Number(raw.days_in_phase) || 0,
    categories,
    status: normalizeStatus(raw),
    stageStatus: raw.stage_status ?? null,
  };
}

/**
 * Keep only projects currently in the Detail Drawings phase.
 * Nest may still return every ACTIVE project until BE filters by stage.
 *
 * - `stageStatus` string → include when IN_PROGRESS / IN_REVIEW
 * - `stageStatus === null` → API row with no Detail stage → exclude
 * - `stageStatus === undefined` → local/demo submission → include
 */
export function isDirectorOverviewInPhase(project: DirectorProject): boolean {
  if (project.stageStatus === undefined) return true;
  if (project.stageStatus === null) return false;
  return IN_PHASE_STATUSES.has(project.stageStatus.toUpperCase());
}

export function isAwaitingDirectorReview(project: DirectorProject): boolean {
  if (project.stageStatus === undefined) {
    return project.status === "awaiting";
  }
  return (project.stageStatus ?? "").toUpperCase() === "IN_REVIEW";
}

export function mapDirectorOverviewResponse(
  raw: DirectorOverviewResponse,
): DirectorProject[] {
  return (raw.projects ?? [])
    .map(mapDirectorOverviewProject)
    .filter((p): p is DirectorProject => p !== null)
    .filter(isDirectorOverviewInPhase);
}

export function computeDirectorOverviewStats(projects: DirectorProject[]) {
  const totalProjects = projects.length;
  const awaitingReview = projects.filter(isAwaitingDirectorReview).length;
  const avgDays = totalProjects
    ? Math.round(
        projects.reduce((sum, p) => sum + p.daysInPhase, 0) / totalProjects,
      )
    : 0;
  return { totalProjects, awaitingReview, avgDays };
}
