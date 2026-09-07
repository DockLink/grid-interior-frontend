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
