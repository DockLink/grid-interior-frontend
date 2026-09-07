import { pickString } from "@/lib/api/normalize";
import { mapClientApiToView } from "@/lib/clients/map-clients";
import { mapSubVendorApiToView, mapSupplierApiToView } from "@/lib/suppliers/map-suppliers";
import type { ProjectLinks, ProjectLinksApi } from "@/types/project-links";

export function mapProjectLinksApiToView(
  raw: ProjectLinksApi | Record<string, unknown>,
  lookups: {
    suppliers?: Record<string, ReturnType<typeof mapSupplierApiToView>>;
    subVendors?: Record<string, ReturnType<typeof mapSubVendorApiToView>>;
  } = {},
): ProjectLinks {
  const obj = raw as Record<string, unknown>;
  const clientRaw = obj.client ?? null;
  const client = clientRaw
    ? (() => {
        const mapped = mapClientApiToView(clientRaw as Record<string, unknown>);
        return {
          id: mapped.id,
          name: mapped.name,
          company: mapped.company,
          email: mapped.email,
          phone: mapped.phone,
          initials: mapped.initials,
          color: mapped.color,
          status: mapped.status,
        };
      })()
    : null;

  const supplierLinks: unknown[] = Array.isArray(obj.suppliers) ? obj.suppliers : [];
  const subVendorRaw = obj.sub_vendors ?? obj.subVendors;
  const subVendorLinks: unknown[] = Array.isArray(subVendorRaw) ? subVendorRaw : [];

  const suppliers = supplierLinks
    .map((link) => {
      const l = link as Record<string, unknown>;
      const supplierId = pickString(l, "supplier_id", "supplierId", "id") ?? "";
      const role = pickString(l, "role") ?? "";
      const supplier =
        lookups.suppliers?.[supplierId] ??
        (l.supplier ? mapSupplierApiToView(l.supplier as Record<string, unknown>) : null);
      if (!supplier) return null;
      return { ...supplier, role };
    })
    .filter(Boolean) as ProjectLinks["suppliers"];

  const subVendors = subVendorLinks
    .map((link) => {
      const l = link as Record<string, unknown>;
      const vendorId = pickString(l, "sub_vendor_id", "subVendorId", "id") ?? "";
      const scope = pickString(l, "scope") ?? "";
      const vendor =
        lookups.subVendors?.[vendorId] ??
        (l.sub_vendor || l.subVendor
          ? mapSubVendorApiToView((l.sub_vendor ?? l.subVendor) as Record<string, unknown>)
          : null);
      if (!vendor) return null;
      return { ...vendor, scope };
    })
    .filter(Boolean) as ProjectLinks["subVendors"];

  return { client, suppliers, subVendors };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function nestedId(value: unknown): string | undefined {
  const obj = asRecord(value);
  return obj ? pickString(obj, "id") : undefined;
}

/** Keep raw supplier rows for PATCH so ID-only links are not dropped. */
export function supplierLinkRowsFromRaw(
  raw: ProjectLinksApi | Record<string, unknown> | null | undefined,
): { supplier_id: string; role: string }[] {
  const obj = asRecord(raw);
  const list = Array.isArray(obj?.suppliers) ? obj.suppliers : [];
  const rows: { supplier_id: string; role: string }[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const l = asRecord(item);
    if (!l) continue;
    const supplierId =
      pickString(l, "supplier_id", "supplierId") ?? nestedId(l.supplier) ?? pickString(l, "id") ?? "";
    if (!supplierId || seen.has(supplierId)) continue;
    seen.add(supplierId);
    rows.push({ supplier_id: supplierId, role: pickString(l, "role") ?? "" });
  }
  return rows;
}

export function subVendorLinkRowsFromRaw(
  raw: ProjectLinksApi | Record<string, unknown> | null | undefined,
): { sub_vendor_id: string; scope: string }[] {
  const obj = asRecord(raw);
  const list = Array.isArray(obj?.sub_vendors)
    ? obj.sub_vendors
    : Array.isArray(obj?.subVendors)
      ? obj.subVendors
      : [];
  const rows: { sub_vendor_id: string; scope: string }[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const l = asRecord(item);
    if (!l) continue;
    const vendorId =
      pickString(l, "sub_vendor_id", "subVendorId") ??
      nestedId(l.sub_vendor ?? l.subVendor) ??
      pickString(l, "id") ??
      "";
    if (!vendorId || seen.has(vendorId)) continue;
    seen.add(vendorId);
    rows.push({ sub_vendor_id: vendorId, scope: pickString(l, "scope") ?? "" });
  }
  return rows;
}

export function clientIdFromLinksRaw(
  raw: ProjectLinksApi | Record<string, unknown> | null | undefined,
): string | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  return pickString(obj, "client_id", "clientId") ?? nestedId(obj.client) ?? null;
}

export function rawLinksIncludeSupplier(
  raw: ProjectLinksApi | Record<string, unknown> | null | undefined,
  supplierId: string,
): boolean {
  return supplierLinkRowsFromRaw(raw).some((row) => row.supplier_id === supplierId);
}
