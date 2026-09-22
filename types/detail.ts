export type DetailView = "hub" | "boq" | "director-overview";

export type DetailCategoryId =
  | "electrical"
  | "flooring"
  | "ceiling"
  | "walls"
  | "furniture"
  | "interior";

export interface DetailDrawingFile {
  id: number | string;
  name: string;
  type: "pdf" | "dwg" | "img";
  size: string;
  date: string;
  fileId?: string;
}

export interface DetailCategory {
  id: DetailCategoryId;
  label: string;
  icon: string;
  color: string;
  accentBg: string;
  files: DetailDrawingFile[];
  complete: boolean;
  notes: string;
  estimate: number;
}

export interface DirectorProject {
  id: string;
  name: string;
  client: string;
  designer: { initials: string; color: string; name: string };
  daysInPhase: number;
  categories: Record<DetailCategoryId, boolean>;
  /** awaiting = needs director attention; complete = detail phase done */
  status: "awaiting" | "complete";
  /** Raw stage status from Nest (e.g. IN_PROGRESS, IN_REVIEW, COMPLETED) */
  stageStatus?: string | null;
}

/* ---------- API ---------- */

export interface DetailCategoryStateApi {
  /** Row UUID from Nest — not the category slug */
  id?: string;
  /** Category slug: electrical | flooring | ceiling | walls | furniture | interior */
  category_id?: DetailCategoryId | string;
  complete: boolean;
  notes: string;
  file_count?: number;
  folder_path?: string;
  project_id?: string;
}

export interface DetailCategoriesResponse {
  categories: DetailCategoryStateApi[];
}

export interface DetailCategoryUpdatePayload {
  complete?: boolean;
  notes?: string;
}

export interface DetailSubmitForReviewResponse {
  project_id: string;
  submitted: boolean;
  stage_id: string;
  stage_title: string;
  stage_status: string;
}

export interface DirectorOverviewDesignerApi {
  id?: string;
  name: string;
  initials?: string;
  color?: string;
}

/**
 * Nest `GET /projects/director-overview` project row.
 * Accepts both the live Nest shape (`project_id`, designer string) and
 * the older FE-oriented shape (`id`, designer object, client).
 */
export interface DirectorOverviewProjectApi {
  id?: string;
  project_id?: string;
  name: string;
  code?: string | null;
  client?: string | null;
  designer?: DirectorOverviewDesignerApi | string | null;
  days_in_phase: number;
  categories?: Record<string, boolean> | null;
  status?: "awaiting" | "complete" | string;
  stage_title?: string | null;
  stage_status?: string | null;
}

export interface DirectorOverviewResponse {
  projects: DirectorOverviewProjectApi[];
  counts?: { awaiting?: number; complete?: number };
}

const ALLOWED: DetailView[] = ["hub", "boq", "director-overview"];

export function detailViewFromParam(view: string | undefined): DetailView {
  if (view && ALLOWED.includes(view as DetailView)) return view as DetailView;
  return "hub";
}

export function formatLKR(n: number) {
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(0)}K`;
  return `LKR ${n.toLocaleString()}`;
}
