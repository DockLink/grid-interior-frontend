import { pickNumber, pickString } from "@/lib/api/normalize";
import type {
  AvailabilityStatus,
  DeliveryStatus,
  PaymentStatus,
  SubVendor,
  SubVendorApi,
  Supplier,
  SupplierApi,
  SupplierCategory,
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
