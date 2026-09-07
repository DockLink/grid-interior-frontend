import { pickString } from "@/lib/api/normalize";
import type { VendorTask, VendorTaskApi, VendorTaskStatus } from "@/types/vendor-tasks";

export const VENDOR_TASK_STATUS_CFG: Record<
  VendorTaskStatus,
  { label: string; color: string; bg: string }
> = {
  todo: { label: "To Do", color: "#1B2A4A", bg: "rgba(27,42,74,0.09)" },
  "in-progress": { label: "In Progress", color: "#0E7C86", bg: "rgba(14,124,134,0.10)" },
  done: { label: "Done", color: "#3FA66B", bg: "rgba(63,166,107,0.10)" },
};

export const VENDOR_TASK_OVERDUE_CFG = {
  label: "Overdue",
  color: "#F26D6D",
  bg: "rgba(242,109,109,0.10)",
} as const;

export const VENDOR_TASK_STATUS_OPTIONS: { id: VendorTaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export function mapVendorTaskApiToView(raw: VendorTaskApi | Record<string, unknown>): VendorTask {
  return {
    id: pickString(raw as Record<string, unknown>, "id") ?? "",
    partyKind:
      (pickString(raw as Record<string, unknown>, "party_kind", "partyKind") as VendorTask["partyKind"]) ??
      "supplier",
    partyId:
      pickString(raw as Record<string, unknown>, "party_id", "partyId") ?? "",
    projectId:
      pickString(raw as Record<string, unknown>, "project_id", "projectId") ?? "",
    title: pickString(raw as Record<string, unknown>, "title") ?? "",
    description:
      pickString(raw as Record<string, unknown>, "description") ?? undefined,
    startDate:
      pickString(raw as Record<string, unknown>, "start_date", "startDate") ?? undefined,
    dueDate: pickString(raw as Record<string, unknown>, "due_date", "dueDate") ?? "",
    status:
      (pickString(raw as Record<string, unknown>, "status") as VendorTaskStatus) ?? "todo",
  };
}

export function todayIsoDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isVendorTaskOverdue(task: VendorTask, today = todayIsoDate()): boolean {
  return task.status !== "done" && task.dueDate < today;
}

export function formatVendorTaskDate(iso?: string): string {
  if (!iso) return "—";
  const dt = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function displayVendorTaskStatus(task: VendorTask): {
  label: string;
  color: string;
  bg: string;
} {
  if (isVendorTaskOverdue(task)) return VENDOR_TASK_OVERDUE_CFG;
  return VENDOR_TASK_STATUS_CFG[task.status];
}
