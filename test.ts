function pickString(obj: any, ...keys: string[]) {
  for (const k of keys) {
    if (typeof obj[k] === "string") return obj[k];
  }
  return null;
}

const obj = {
  sub_vendors: [
    {
      sub_vendor_id: "sv_1",
      scope: "Masonry",
      sub_vendor: {
        id: "sv_1",
        name: "Test Vendor"
      }
    }
  ]
};

const subVendorRaw = obj.sub_vendors;
const subVendorLinks = Array.isArray(subVendorRaw) ? subVendorRaw : [];

const subVendors = subVendorLinks.map((link) => {
  const l = link as any;
  const vendorId = pickString(l, "sub_vendor_id", "subVendorId", "id") ?? "";
  const scope = pickString(l, "scope") ?? "";
  const vendor = l.sub_vendor || l.subVendor ? l.sub_vendor || l.subVendor : null;
  if (!vendor) return null;
  return { ...vendor, scope };
}).filter(Boolean);

console.log(subVendors);
