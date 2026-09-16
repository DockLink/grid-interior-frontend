import type {
  DetailCategoryId,
  DetailCategoryUpdatePayload,
  DirectorProject,
} from "@/types/detail";
import type { ActiveProjectView } from "@/types/project-hub";

const CATEGORY_KEY = "grid.detail.categoryStates";
const SUBMITTED_KEY = "grid.detail.submittedForReview";

export type LocalCategoryState = {
  id: DetailCategoryId;
  complete: boolean;
  notes: string;
};

type CategoryStore = Record<string, Partial<Record<DetailCategoryId, LocalCategoryState>>>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getLocalCategoryStates(projectId: string): LocalCategoryState[] {
  const store = readJson<CategoryStore>(CATEGORY_KEY, {});
  return Object.values(store[projectId] ?? {}).filter(Boolean) as LocalCategoryState[];
}

export function upsertLocalCategoryState(
  projectId: string,
  categoryId: DetailCategoryId,
  payload: DetailCategoryUpdatePayload,
): LocalCategoryState {
  const store = readJson<CategoryStore>(CATEGORY_KEY, {});
  const prev = store[projectId]?.[categoryId];
  const next: LocalCategoryState = {
    id: categoryId,
    complete: payload.complete ?? prev?.complete ?? false,
    notes: payload.notes ?? prev?.notes ?? "",
  };
  store[projectId] = { ...(store[projectId] ?? {}), [categoryId]: next };
  writeJson(CATEGORY_KEY, store);
  return next;
}

export function getSubmittedDirectorProjects(): DirectorProject[] {
  return readJson<DirectorProject[]>(SUBMITTED_KEY, []);
}

export function markProjectSubmittedForReview(
  project: ActiveProjectView,
  categories: Record<DetailCategoryId, boolean>,
): DirectorProject {
  const entry: DirectorProject = {
    id: project.id,
    name: project.name,
    client: project.clientName,
    designer: {
      initials: "ME",
      color: "#0E7C86",
      name: "You",
    },
    daysInPhase: Math.max(1, project.daysActive || 1),
    categories,
    status: "awaiting",
  };

  const existing = getSubmittedDirectorProjects().filter((p) => p.id !== project.id);
  writeJson(SUBMITTED_KEY, [entry, ...existing]);
  return entry;
}
