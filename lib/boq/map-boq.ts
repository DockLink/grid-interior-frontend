import type {
  BoqCategoriesResponse,
  BoqCategoryApi,
  BoqLineItemApi,
  BoqQuoteApi,
  BoqSummaryBucketApi,
  BoqSummaryResponse,
} from "@/types/boq";
import type {
  AdvancePaymentStatus,
  BoqCategory,
  BoqCategoryId,
  BoqLineItem,
  NegotiationStatus,
  SupplierQuote,
} from "@/types/execution";

const CATEGORY_CODES: BoqCategoryId[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

function asCategoryCode(code: string): BoqCategoryId {
  if (CATEGORY_CODES.includes(code as BoqCategoryId)) return code as BoqCategoryId;
  return "A";
}

function asNegotiation(status: string): NegotiationStatus {
  if (status === "pending" || status === "in-progress" || status === "agreed") return status;
  return "pending";
}

function asPayment(status: string): AdvancePaymentStatus {
  if (status === "not-paid" || status === "partial" || status === "paid") return status;
  return "not-paid";
}

export function mapBoqQuoteApi(quote: BoqQuoteApi): SupplierQuote {
  return {
    supplierId: quote.supplier_id,
    supplierName: quote.supplier_name,
    price: Number(quote.price) || 0,
  };
}

export function isBoqHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

export function mapBoqLineItemApi(item: BoqLineItemApi): BoqLineItem {
  const imageUrl = item.image_url ?? null;
  const imageFileId = item.image_file_id ?? null;
  const contractFileId = item.contract_file_id ?? null;
  const contractUrl = item.contract_url ?? null;

  return {
    id: item.id,
    item: item.item,
    description: item.description ?? "",
    lengthIn: item.length_in ?? "",
    widthIn: item.width_in ?? "",
    heightIn: item.height_in ?? "",
    // Prefer resolved HTTP URL; otherwise keep raw value only if it is already a URL.
    image: isBoqHttpUrl(imageUrl) ? imageUrl! : undefined,
    imageFileId:
      imageFileId ??
      (imageUrl && !isBoqHttpUrl(imageUrl) ? imageUrl : null),
    unit: item.unit ?? "LS",
    qty: Number(item.qty) || 0,
    rate: Number(item.rate) || 0,
    quotes: (item.quotes ?? []).map(mapBoqQuoteApi),
    selectedSupplierId: item.selected_supplier_id,
    designFirmPrice: Number(item.design_firm_price) || 0,
    negotiationStatus: asNegotiation(String(item.negotiation_status)),
    paymentStatus: asPayment(String(item.payment_status)),
    contractUploaded: Boolean(item.contract_uploaded) || Boolean(contractFileId),
    contractFileId,
    contractUrl: isBoqHttpUrl(contractUrl) ? contractUrl : null,
  };
}

export function mapBoqCategoryApi(cat: BoqCategoryApi): BoqCategory {
  return {
    id: cat.id,
    code: asCategoryCode(cat.code),
    label: cat.label,
    icon: cat.icon,
    color: cat.color,
    accentBg: cat.accent_bg,
    budget: Number(cat.budget) || 0,
    durationDays: Number(cat.duration_days) || 0,
    items: (cat.items ?? []).map(mapBoqLineItemApi),
  };
}

export function mapBoqCategoriesResponse(raw: BoqCategoriesResponse): BoqCategory[] {
  return (raw.categories ?? []).map(mapBoqCategoryApi);
}

export function mapBoqSummaryBucket(bucket: BoqSummaryBucketApi): BoqSummaryBucketApi {
  return {
    id: bucket.id,
    label: bucket.label,
    estimate: Number(bucket.estimate) || 0,
  };
}

export function mapBoqSummary(raw: BoqSummaryResponse): BoqSummaryBucketApi[] {
  return (raw.buckets ?? []).map(mapBoqSummaryBucket);
}

export function toQuotesPayload(quotes: SupplierQuote[]) {
  return {
    quotes: quotes.map((q) => ({
      supplier_id: q.supplierId,
      price: q.price,
    })),
  };
}
