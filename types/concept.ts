export type ConceptView =
  | "area-setup"
  | "concept-list"
  | "concept-nonrender"
  | "concept-render"
  | "concept-presentation"
  | "concept-revision"
  | "concept-walkthrough";

export type NonRenderStatus = "included" | "skipped";
export type RenderStatus = "not-started" | "in-progress" | "complete";
export type ConceptStage = "nonrender" | "render";
export type ConfirmStatus = "confirmed" | "pending";
export type PresentStep = "presented" | "feedback" | "confirmed";

export interface ConceptArea {
  id: number;
  name: string;
  icon: string;
  conceptCount: number;
}

export interface ConceptCard {
  id: number;
  name: string;
  areaId: number;
  nonRenderStatus: NonRenderStatus;
  renderStatus: RenderStatus;
  confirmStatus: ConfirmStatus;
  thumb: string;
}

export interface ConceptRenderImage {
  id: number;
  url: string;
  caption: string;
}

export interface ConceptNonRenderFile {
  id: number;
  name: string;
  type: "pdf" | "img";
  size: string;
  date: string;
  url?: string;
}

export interface ConceptRevisionEntry {
  id: number;
  date: string;
  note: string;
  chargeable: boolean;
}

const ALLOWED: ConceptView[] = [
  "area-setup",
  "concept-list",
  "concept-nonrender",
  "concept-render",
  "concept-presentation",
  "concept-revision",
  "concept-walkthrough",
];

export function conceptViewFromParam(view: string | undefined): ConceptView {
  if (view && ALLOWED.includes(view as ConceptView)) return view as ConceptView;
  return "area-setup";
}
