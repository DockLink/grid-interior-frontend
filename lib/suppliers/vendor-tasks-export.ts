import {
  formatVendorTaskDate,
  getVendorPartyName,
  getVendorProjectName,
  type VendorTask,
} from "@/lib/suppliers/mock-vendor-tasks";

export interface VendorTaskExportRow {
  party: string;
  project: string;
  title: string;
  start: string;
  deadline: string;
  status: string;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function vendorTaskToExportRow(task: VendorTask, statusLabel: string): VendorTaskExportRow {
  return {
    party: getVendorPartyName(task.partyKind, task.partyId),
    project: getVendorProjectName(task.projectId),
    title: task.title,
    start: formatVendorTaskDate(task.startDate),
    deadline: formatVendorTaskDate(task.dueDate),
    status: statusLabel,
  };
}

export function downloadVendorTasksCsv(rows: VendorTaskExportRow[], filename: string): void {
  const header = ["Party", "Project", "Task", "Start", "Deadline", "Status"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [row.party, row.project, row.title, row.start, row.deadline, row.status]
        .map(csvEscape)
        .join(","),
    ),
  ];
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

export function slugForFilename(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "export";
}
