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
  status: "awaiting" | "complete";
}

/* ---------- API ---------- */

export interface DetailCategoryStateApi {
  id: DetailCategoryId | string;
  complete: boolean;
  notes: string;
  file_count?: number;
}

export interface DetailCategoriesResponse {
  categories: DetailCategoryStateApi[];
}

export interface DetailCategoryUpdatePayload {
  complete?: boolean;
  notes?: string;
}

export interface DirectorOverviewDesignerApi {
  id?: string;
  name: string;
  initials?: string;
  color?: string;
}

export interface DirectorOverviewProjectApi {
  id: string;
  name: string;
  client: string;
  designer: DirectorOverviewDesignerApi;
  days_in_phase: number;
  categories: Record<string, boolean>;
  status: "awaiting" | "complete" | string;
}

export interface DirectorOverviewResponse {
  projects: DirectorOverviewProjectApi[];
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
