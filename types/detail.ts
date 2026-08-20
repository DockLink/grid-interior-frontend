export type DetailView = "hub" | "boq" | "director-overview";

export type DetailCategoryId =
  | "electrical"
  | "flooring"
  | "ceiling"
  | "walls"
  | "furniture"
  | "interior";

export interface DetailDrawingFile {
  id: number;
  name: string;
  type: "pdf" | "dwg" | "img";
  size: string;
  date: string;
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
  id: number;
  name: string;
  client: string;
  designer: { initials: string; color: string; name: string };
  daysInPhase: number;
  categories: Record<DetailCategoryId, boolean>;
  status: "awaiting" | "complete";
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
