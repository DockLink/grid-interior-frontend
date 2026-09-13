import type { AdvancePaymentStatus, NegotiationStatus } from "@/types/execution";

export interface BoqQuoteApi {
  supplier_id: string;
  supplier_name: string;
  price: number;
}

export interface BoqLineItemApi {
  id: string;
  item: string;
  description: string;
  length_in: string;
  width_in: string;
  height_in: string;
  /** Resolved signed/public URL from the backend (response). */
  image_url: string | null;
  /** Floating storage file id from POST /storage/upload. */
  image_file_id?: string | null;
  unit: string;
  qty: number;
  rate: number;
  design_firm_price: number;
  negotiation_status: NegotiationStatus | string;
  payment_status: AdvancePaymentStatus | string;
  contract_uploaded: boolean;
  /** Floating storage file id for the supplier contract. */
  contract_file_id?: string | null;
  /** Resolved signed URL for the contract (response). */
  contract_url?: string | null;
  selected_supplier_id: string | null;
  sort_order: number;
  quotes: BoqQuoteApi[];
}

export interface BoqCategoryApi {
  id: string;
  code: string;
  label: string;
  icon: string;
  color: string;
  accent_bg: string;
  budget: number;
  duration_days: number;
  items: BoqLineItemApi[];
}

export interface BoqCategoriesResponse {
  categories: BoqCategoryApi[];
}

export interface BoqSummaryBucketApi {
  id: string;
  label: string;
  estimate: number;
}

export interface BoqSummaryResponse {
  buckets: BoqSummaryBucketApi[];
}

export interface BoqCategoryUpdatePayload {
  budget?: number;
  duration_days?: number;
}

export interface BoqLineItemCreatePayload {
  item: string;
  description?: string;
  length_in?: string;
  width_in?: string;
  height_in?: string;
  image_url?: string | null;
  image_file_id?: string | null;
  unit?: string;
  qty?: number;
  rate?: number;
  sort_order?: number;
}

export interface BoqLineItemUpdatePayload {
  item?: string;
  description?: string;
  length_in?: string;
  width_in?: string;
  height_in?: string;
  image_url?: string | null;
  image_file_id?: string | null;
  unit?: string;
  qty?: number;
  rate?: number;
  sort_order?: number;
}

export interface BoqQuotesReplacePayload {
  quotes: Array<{ supplier_id: string; price: number }>;
}

export interface BoqCommercialUpdatePayload {
  selected_supplier_id?: string | null;
  design_firm_price?: number;
  negotiation_status?: NegotiationStatus;
  payment_status?: AdvancePaymentStatus;
  contract_uploaded?: boolean;
  contract_file_id?: string | null;
}
