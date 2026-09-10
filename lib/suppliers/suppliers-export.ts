import type { SubVendor, Supplier } from "@/types/suppliers";
import { slugForFilename } from "@/lib/suppliers/vendor-tasks-export";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(lines: string[], filename: string): void {
  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadSuppliersCsv(suppliers: Supplier[], filename = "suppliers.csv"): void {
  const header = [
    "Name",
    "Category",
    "Range",
    "Contact Person",
    "Email",
    "Phone",
    "Active Projects",
    "Lead Time",
    "Credit Terms",
    "Status",
  ];
  const lines = [
    header.join(","),
    ...suppliers.map((s) =>
      [
        s.name,
        s.category,
        s.supplierRange,
        s.contactPerson,
        s.email,
        s.phone,
        String(s.activeProjects),
        s.avgLeadTime,
        s.creditTerms,
        s.status,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];
  downloadCsv(lines, filename);
}

export function downloadSubVendorsCsv(vendors: SubVendor[], filename = "sub-vendors.csv"): void {
  const header = [
    "Name",
    "Company",
    "Specialty",
    "Email",
    "Phone",
    "Availability",
    "Past Projects",
    "Payment Record",
  ];
  const lines = [
    header.join(","),
    ...vendors.map((v) =>
      [
        v.name,
        v.company,
        v.specialty,
        v.email,
        v.phone,
        v.availability,
        String(v.pastProjects),
        v.paymentRecord,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];
  downloadCsv(lines, filename);
}

export { slugForFilename };
