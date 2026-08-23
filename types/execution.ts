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
  supplierId: number;
  supplierName: string;
  price: number;
}

export interface BoqLineItem {
  id: number;
  item: string;
  description: string;
  lengthIn: string;
  widthIn: string;
  heightIn: string;
  image?: string;
  unit: string;
  qty: number;
  rate: number;
  quotes: SupplierQuote[];
  selectedSupplierId: number | null;
  designFirmPrice: number;
  negotiationStatus: NegotiationStatus;
  paymentStatus: AdvancePaymentStatus;
  contractUploaded: boolean;
}

export interface BoqCategory {
  id: BoqCategoryId;
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
