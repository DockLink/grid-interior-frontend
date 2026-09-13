export type ExecutionView = "stages" | "boq" | "site";

export type ExecutionStageStatus = "complete" | "in-progress" | "upcoming";

export type NegotiationStatus = "pending" | "in-progress" | "agreed";

export type AdvancePaymentStatus = "not-paid" | "partial" | "paid";

export type SiteSubStageStatus = "complete" | "in-progress" | "upcoming" | "blocked";

export type BoqCategoryId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export interface ExecutionStage {
  id: number;
  name: string;
  detail: string;
  status: ExecutionStageStatus;
  icon: string;
}

export interface SupplierQuote {
  supplierId: string;
  supplierName: string;
  price: number;
}

export interface BoqLineItem {
  id: string;
  item: string;
  description: string;
  lengthIn: string;
  widthIn: string;
  heightIn: string;
  /** Display URL when backend resolves a signed/public image URL. */
  image?: string;
  /** Storage file id from /storage/upload (persisted until backend resolves URL). */
  imageFileId?: string | null;
  unit: string;
  qty: number;
  rate: number;
  quotes: SupplierQuote[];
  selectedSupplierId: string | null;
  designFirmPrice: number;
  negotiationStatus: NegotiationStatus;
  paymentStatus: AdvancePaymentStatus;
  contractUploaded: boolean;
  contractFileId?: string | null;
  /** Resolved signed URL for the contract document. */
  contractUrl?: string | null;
}

export interface BoqCategory {
  id: string;
  code: BoqCategoryId;
  label: string;
  icon: string;
  color: string;
  accentBg: string;
  budget: number;
  durationDays: number;
  items: BoqLineItem[];
}

export interface SiteSubStage {
  id: string;
  number: string;
  name: string;
  detail: string;
  status: SiteSubStageStatus;
  startDay: number;
  durationDays: number;
  checkpoint: boolean;
  blockedBy?: string;
}

/* ---------- API wire types (Nest execution facade) ---------- */

export interface ExecutionStageApi {
  id: string;
  name: string;
  detail?: string | null;
  status: ExecutionStageStatus | string;
  taskable_id: string;
  order?: number;
}

export interface ExecutionStagesResponse {
  stages: ExecutionStageApi[];
}

export interface ExecutionStageStatusPayload {
  status: ExecutionStageStatus;
}

export interface SiteSubStageApi {
  id: string;
  number: string;
  name: string;
  detail: string;
  status: SiteSubStageStatus | string;
  start_day: number;
  duration_days: number;
  checkpoint: boolean;
  blocked_by?: string | null;
  sort_order?: number;
}

export interface ExecutionSiteResponse {
  substages: SiteSubStageApi[];
  total_days: number;
}

export interface SiteSubStageUpdatePayload {
  status?: SiteSubStageStatus;
  start_day?: number;
  duration_days?: number;
}

export interface EndedAfterBoqResponse {
  ended_after_boq: boolean;
}

export interface EndedAfterBoqPayload {
  ended_after_boq: boolean;
}

const ALLOWED: ExecutionView[] = ["stages", "boq", "site"];

export function executionViewFromParam(view: string | undefined): ExecutionView {
  if (view && ALLOWED.includes(view as ExecutionView)) return view as ExecutionView;
  return "stages";
}

export function lineItemTotal(item: BoqLineItem): number {
  return item.qty * item.rate;
}

export function categorySubtotal(cat: BoqCategory): number {
  return cat.items.reduce((sum, item) => sum + lineItemTotal(item), 0);
}
