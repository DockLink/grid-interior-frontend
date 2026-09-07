import {
  type GanttPhase,
  type MaterialItem,
  type Milestone,
} from "@/lib/timeline/mock-timeline";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(header: string[], rows: string[][], filename: string): void {
  const lines = [
    header.join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
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

function parseProjectStart(projectStartIso?: string): Date {
  if (projectStartIso) {
    const d = new Date(`${projectStartIso.slice(0, 10)}T00:00:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date("2026-05-15");
}

export function weekToDateLabel(startWeek: number, projectStartIso?: string): string {
  const d = parseProjectStart(projectStartIso);
  d.setDate(d.getDate() + Math.round(startWeek) * 7);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function slugForFilename(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "export";
}

export function downloadTimelinePhasesExcel(
  phases: GanttPhase[],
  filename: string,
  projectStartIso?: string,
): void {
  const header = [
    "Phase",
    "Status",
    "Start",
    "End",
    "Duration (weeks)",
    "Progress (%)",
    "Lead",
    "Milestone",
  ];
  const rows = phases.map((phase) => [
    phase.name,
    statusLabel(phase.status),
    weekToDateLabel(phase.startWeek, projectStartIso),
    weekToDateLabel(phase.startWeek + phase.durationWeeks, projectStartIso),
    String(phase.durationWeeks),
    String(phase.progress),
    phase.lead.name,
    phase.milestone ?? "",
  ]);
  downloadCsv(header, rows, filename);
}

export function downloadMilestonesExcel(
  milestones: Milestone[],
  filename: string,
): void {
  const header = ["Milestone", "Date", "Status", "Phase", "Notes"];
  const rows = milestones.map((m) => [
    m.name,
    m.date,
    statusLabel(m.status),
    m.phase,
    m.notes ?? "",
  ]);
  downloadCsv(header, rows, filename);
}

export function downloadMaterialsExcel(
  items: MaterialItem[],
  filename: string,
): void {
  const header = [
    "Category",
    "Item",
    "Supplier",
    "Status",
    "ETA",
    "Value",
    "Notes",
  ];
  const rows = items.map((item) => [
    item.category,
    item.item,
    item.supplier,
    statusLabel(item.status),
    item.eta,
    item.value,
    item.notes ?? "",
  ]);
  downloadCsv(header, rows, filename);
}
