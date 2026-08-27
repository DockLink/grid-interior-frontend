export type ConceptView = "area-setup" | "concept-list";

export type ConfirmStatus = "confirmed" | "pending";
export type PresentStep = "presented" | "feedback" | "confirmed";
export type ConceptFileType = "jpg" | "pdf";

export const MAX_CONCEPTS_PER_AREA = 3;

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
  fileName: string;
  fileType: ConceptFileType;
  fileSize: string;
  thumb: string;
  confirmStatus: ConfirmStatus;
}

export interface ConceptRenderImage {
  id: number;
  url: string;
  caption: string;
}

export interface ConceptRevisionEntry {
  id: number;
  date: string;
  note: string;
  chargeable: boolean;
}

const ALLOWED: ConceptView[] = ["area-setup", "concept-list"];

export function conceptViewFromParam(view: string | undefined): ConceptView {
  if (view && ALLOWED.includes(view as ConceptView)) return view as ConceptView;
  return "area-setup";
}
