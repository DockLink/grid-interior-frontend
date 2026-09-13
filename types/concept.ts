export type ConceptView = "area-setup" | "concept-list";

export type ConfirmStatus = "confirmed" | "pending";
export type PresentStep = "presented" | "feedback" | "confirmed";
export type ConceptFileType = "jpg" | "pdf";

export const MAX_CONCEPTS_PER_AREA = 3;

export interface ConceptArea {
  id: string;
  name: string;
  icon: string;
  conceptCount: number;
}

export interface ConceptCard {
  id: string;
  name: string;
  areaId: string;
  fileName: string;
  fileType: ConceptFileType;
  fileSize: string;
  thumb: string;
  confirmStatus: ConfirmStatus;
}

export interface ConceptRenderImage {
  id: string;
  url: string;
  caption: string;
}

export interface ConceptRevisionEntry {
  id: string;
  date: string;
  note: string;
  chargeable: boolean;
}

/* ---------- API ---------- */

export interface ConceptCardApi {
  id: string;
  name: string;
  area_id?: string;
  file_id?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: string | null;
  thumb_url?: string | null;
  confirm_status: ConfirmStatus | string;
}

export interface ConceptAreaApi {
  id: string;
  name: string;
  icon: string;
  sort_order?: number;
  concept_count?: number;
  cards?: ConceptCardApi[];
}

export interface ConceptRenderApi {
  id: string;
  file_id?: string | null;
  url?: string | null;
  caption: string;
  sort_order?: number;
}

export interface ConceptRevisionApi {
  id: string;
  date: string;
  note: string;
  chargeable: boolean;
}

export interface ConceptTreeResponse {
  areas: ConceptAreaApi[];
  renders: ConceptRenderApi[];
  revisions: ConceptRevisionApi[];
}

export interface ConceptAreaCreatePayload {
  name: string;
  icon?: string;
}

export interface ConceptAreaUpdatePayload {
  name?: string;
  icon?: string;
}

export interface ConceptCardCreatePayload {
  name: string;
  file_id?: string | null;
  file_name?: string;
  file_type?: ConceptFileType | string;
  file_size?: string;
  thumb_url?: string | null;
  confirm_status?: ConfirmStatus;
}

export interface ConceptCardUpdatePayload {
  name?: string;
  file_name?: string;
  file_type?: ConceptFileType | string;
  file_size?: string;
  thumb_url?: string | null;
  confirm_status?: ConfirmStatus;
}

export interface ConceptRenderCreatePayload {
  url?: string | null;
  caption?: string;
  file_id?: string | null;
}

export interface ConceptRevisionCreatePayload {
  note: string;
  date?: string;
  chargeable?: boolean;
}

const ALLOWED: ConceptView[] = ["area-setup", "concept-list"];

export function conceptViewFromParam(view: string | undefined): ConceptView {
  if (view && ALLOWED.includes(view as ConceptView)) return view as ConceptView;
  return "area-setup";
}
