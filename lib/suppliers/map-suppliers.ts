import { pickNumber, pickString } from "@/lib/api/normalize";
import type {
  AvailabilityStatus,
  DeliveryStatus,
  PaymentStatus,
  SubVendor,
  SubVendorApi,
  SubVendorHistory,
  SubVendorHistoryApi,
  SubVendorHistoryStatus,
  SubVendorPayment,
  SubVendorPaymentApi,
  Supplier,
  SupplierApi,
  SupplierCategory,
  SupplierOrder,
  SupplierOrderApi,
  SupplierRange,
  SupplierStatus,
} from "@/types/suppliers";

export const SUPPLIER_RANGES: SupplierRange[] = ["Budget", "Standard", "Premium"];

export const SUPPLIER_RANGE_CFG: Record<
  SupplierRange,
  { color: string; bg: string; icon: string; label: string }
> = {
  Budget: {
    color: "#3FA66B",
    bg: "rgba(63,166,107,0.10)",
    icon: "savings",
    label: "Budget",
  },
  Standard: {
    color: "var(--figma-teal)",
    bg: "rgba(14,124,134,0.10)",
    icon: "sell",
    label: "Standard",
  },
  Premium: {
    color: "#F5A623",
    bg: "rgba(245,166,35,0.12)",
    icon: "workspace_premium",
    label: "Premium",
  },
};

export const AVAILABILITY_CFG: Record<AvailabilityStatus, { color: string; label: string }> = {
  Available: { color: "#3FA66B", label: "Available" },
  Busy: { color: "#F26D6D", label: "Busy" },
  Unknown: { color: "#9CA3AF", label: "Unknown" },
};

export const PAYMENT_STATUS_CFG: Record<PaymentStatus, { color: string; bg: string }> = {
  Paid: { color: "#3FA66B", bg: "rgba(63,166,107,0.10)" },
  Partial: { color: "#1B2A4A", bg: "rgba(27,42,74,0.09)" },
  Unpaid: { color: "#F26D6D", bg: "rgba(242,109,109,0.10)" },
};

export const DELIVERY_STATUS_CFG: Record<DeliveryStatus, { color: string; bg: string }> = {
  Delivered: { color: "#3FA66B", bg: "rgba(63,166,107,0.10)" },
  Pending: { color: "#1B2A4A", bg: "rgba(27,42,74,0.09)" },
  Delayed: { color: "#F26D6D", bg: "rgba(242,109,109,0.10)" },
};

export const HISTORY_STATUS_CFG: Record<SubVendorHistoryStatus, { color: string; bg: string }> = {
  Completed: { color: "#3FA66B", bg: "rgba(63,166,107,0.10)" },
  "In Progress": { color: "#0E7C86", bg: "rgba(14,124,134,0.10)" },
  Cancelled: { color: "#F26D6D", bg: "rgba(242,109,109,0.10)" },
};

function parseSupplierRange(raw: Record<string, unknown>): SupplierRange {
  const value = pickString(raw, "supplier_range", "supplierRange");
  if (value === "Budget" || value === "Standard" || value === "Premium") return value;
  return "Standard";
}

export function mapSupplierApiToView(raw: SupplierApi | Record<string, unknown>): Supplier {
  return {
    id: pickString(raw as Record<string, unknown>, "id") ?? "",
    name: pickString(raw as Record<string, unknown>, "name") ?? "",
    category:
      (pickString(raw as Record<string, unknown>, "category") as SupplierCategory) ?? "Furniture",
    supplierRange: parseSupplierRange(raw as Record<string, unknown>),
    contactPerson:
      pickString(raw as Record<string, unknown>, "contact_person", "contactPerson") ?? "",
    phone: pickString(raw as Record<string, unknown>, "phone") ?? "",
    email: pickString(raw as Record<string, unknown>, "email") ?? "",
    address: pickString(raw as Record<string, unknown>, "address") ?? "",
    website: pickString(raw as Record<string, unknown>, "website") ?? undefined,
    activeProjects:
      pickNumber(raw as Record<string, unknown>, "active_projects", "activeProjects") ?? 0,
    totalOrders:
      pickNumber(raw as Record<string, unknown>, "total_orders", "totalOrders") ?? 0,
    avgLeadTime:
      pickString(raw as Record<string, unknown>, "avg_lead_time", "avgLeadTime") ?? "—",
    creditTerms:
      pickString(raw as Record<string, unknown>, "credit_terms", "creditTerms") ?? "—",
    status:
      (pickString(raw as Record<string, unknown>, "status") as SupplierStatus) ?? "Active",
    notes: pickString(raw as Record<string, unknown>, "notes") ?? undefined,
  };
}

function formatOrderDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatOrderAmount(raw: number | string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return "—";
    if (/[€$£]/.test(trimmed) || /[a-zA-Z]/.test(trimmed)) return trimmed;
    const asNumber = Number(trimmed.replace(/,/g, ""));
    if (!Number.isFinite(asNumber)) return trimmed;
    return `€ ${asNumber.toLocaleString("en-US")}`;
  }
  if (!Number.isFinite(raw)) return "—";
  return `€ ${raw.toLocaleString("en-US")}`;
}

function parseDeliveryStatus(raw: string | null | undefined): DeliveryStatus {
  if (raw === "Delivered" || raw === "Pending" || raw === "Delayed") return raw;
  return "Pending";
}

function parsePaymentStatus(raw: string | null | undefined): PaymentStatus {
  if (raw === "Paid" || raw === "Partial" || raw === "Unpaid") return raw;
  const normalized = (raw ?? "").toLowerCase().replace(/_/g, " ").trim();
  if (normalized === "paid") return "Paid";
  if (normalized === "partial") return "Partial";
  if (normalized === "unpaid") return "Unpaid";
  return "Unpaid";
}

export function mapSupplierOrderApiToView(
  raw: SupplierOrderApi | Record<string, unknown>,
): SupplierOrder {
  const record = raw as Record<string, unknown>;
  const amountRaw = record.amount;
  return {
    id: pickString(record, "id") ?? "",
    date: formatOrderDate(pickString(record, "order_date", "orderDate", "date")),
    project:
      pickString(record, "project_name", "projectName", "project") ?? "—",
    item: pickString(record, "item") ?? "—",
    quantity: pickString(record, "quantity") ?? "—",
    deliveryStatus: parseDeliveryStatus(
      pickString(record, "delivery_status", "deliveryStatus"),
    ),
    paymentStatus: parsePaymentStatus(
      pickString(record, "payment_status", "paymentStatus"),
    ),
    amount: formatOrderAmount(
      typeof amountRaw === "number" || typeof amountRaw === "string"
        ? amountRaw
        : null,
    ),
  };
}

export function mapSubVendorApiToView(raw: SubVendorApi | Record<string, unknown>): SubVendor {
  return {
    id: pickString(raw as Record<string, unknown>, "id") ?? "",
    name: pickString(raw as Record<string, unknown>, "name") ?? "",
    company: pickString(raw as Record<string, unknown>, "company") ?? "",
    specialty:
      (pickString(raw as Record<string, unknown>, "specialty") as SubVendor["specialty"]) ??
      "Masonry",
    phone: pickString(raw as Record<string, unknown>, "phone") ?? "",
    email: pickString(raw as Record<string, unknown>, "email") ?? "",
    address: pickString(raw as Record<string, unknown>, "address") ?? "",
    availability:
      (pickString(raw as Record<string, unknown>, "availability") as SubVendor["availability"]) ??
      "Unknown",
    pastProjects:
      pickNumber(raw as Record<string, unknown>, "past_projects", "pastProjects") ?? 0,
    paymentRecord:
      (pickString(raw as Record<string, unknown>, "payment_record", "paymentRecord") as SubVendor["paymentRecord"]) ??
      "Good",
    notes: pickString(raw as Record<string, unknown>, "notes") ?? undefined,
  };
}

function formatHistoryDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function parseHistoryStatus(raw: string | null | undefined): SubVendorHistoryStatus {
  if (raw === "Completed" || raw === "In Progress" || raw === "Cancelled") return raw;
  const normalized = (raw ?? "").toLowerCase().replace(/_/g, " ").trim();
  if (normalized === "completed" || normalized === "complete") return "Completed";
  if (normalized === "in progress" || normalized === "in-progress" || normalized === "active") {
    return "In Progress";
  }
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";
  return "Completed";
}

export function mapSubVendorHistoryApiToView(
  raw: SubVendorHistoryApi | Record<string, unknown>,
): SubVendorHistory {
  const record = raw as Record<string, unknown>;
  const amountRaw = record.amount;
  return {
    id: pickString(record, "id") ?? "",
    project: pickString(record, "project_name", "projectName", "project") ?? "—",
    startDate: formatHistoryDate(pickString(record, "start_date", "startDate")),
    endDate: formatHistoryDate(pickString(record, "end_date", "endDate")),
    scope: pickString(record, "scope") ?? "—",
    status: parseHistoryStatus(pickString(record, "status")),
    amount:
      amountRaw == null || amountRaw === ""
        ? undefined
        : formatOrderAmount(
            typeof amountRaw === "number" || typeof amountRaw === "string" ? amountRaw : null,
          ),
  };
}

export function mapSubVendorPaymentApiToView(
  raw: SubVendorPaymentApi | Record<string, unknown>,
): SubVendorPayment {
  const record = raw as Record<string, unknown>;
  const amountRaw = record.amount;
  return {
    id: pickString(record, "id") ?? "",
    project: pickString(record, "project_name", "projectName", "project") ?? "—",
    amount: formatOrderAmount(
      typeof amountRaw === "number" || typeof amountRaw === "string" ? amountRaw : null,
    ),
    date: formatOrderDate(pickString(record, "payment_date", "paymentDate", "date")),
    status: parsePaymentStatus(pickString(record, "status", "payment_status", "paymentStatus")),
  };
}
