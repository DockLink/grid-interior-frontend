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

export function mapDetailCategoryStates(raw: DetailCategoriesResponse) {
  return (raw.categories ?? []).map((c: DetailCategoryStateApi) => ({
    id: asCategoryId(String(c.id)),
    complete: Boolean(c.complete),
    notes: c.notes ?? "",
    fileCount: c.file_count,
  }));
}

export function mapDirectorOverviewProject(
  raw: DirectorOverviewProjectApi,
): DirectorProject {
  const categories = {} as Record<DetailCategoryId, boolean>;
  for (const id of CAT_IDS) {
    categories[id] = Boolean(raw.categories?.[id]);
  }
  const name = raw.designer?.name ?? "Designer";
  return {
    id: raw.id,
    name: raw.name,
    client: raw.client ?? "",
    designer: {
      name,
      initials: raw.designer?.initials || initialsFromName(name),
      color: raw.designer?.color || "#7C3AED",
    },
    daysInPhase: Number(raw.days_in_phase) || 0,
    categories,
    status: raw.status === "complete" ? "complete" : "awaiting",
  };
}

export function mapDirectorOverviewResponse(
  raw: DirectorOverviewResponse,
): DirectorProject[] {
  return (raw.projects ?? []).map(mapDirectorOverviewProject);
}
