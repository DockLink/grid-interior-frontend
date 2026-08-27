import { getActiveProject } from "@/lib/projects/mock-projects";
import { getProjectLinks } from "@/lib/projects/mock-project-links";
import { SUB_VENDORS, SUPPLIERS } from "@/lib/suppliers/mock-suppliers";

export type VendorPartyKind = "supplier" | "subvendor";
export type VendorTaskStatus = "todo" | "in-progress" | "done";

export interface VendorTask {
  id: string;
  partyKind: VendorPartyKind;
  partyId: number;
  projectId: string;
  title: string;
  description?: string;
  startDate?: string;
  dueDate: string;
  status: VendorTaskStatus;
}

export interface VendorPartyContact {
  name: string;
  company?: string;
  contactPerson?: string;
  email: string;
  phone: string;
}

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

const VENDOR_TASK_SEEDS: VendorTask[] = [
  {
    id: "vt-1",
    partyKind: "supplier",
    partyId: 1,
    projectId: "mock-1",
    title: "Deliver kitchen carcasses",
    description: "Poliform kitchen run for the Marchetti villa — carcasses and plinths.",
    startDate: "2026-07-28",
    dueDate: "2026-08-14",
    status: "in-progress",
  },
  {
    id: "vt-2",
    partyKind: "supplier",
    partyId: 1,
    projectId: "mock-1",
    title: "Wardrobe install — master suite",
    description: "On-site fit of walk-in wardrobe after flooring is complete.",
    startDate: "2026-08-18",
    dueDate: "2026-09-05",
    status: "todo",
  },
  {
    id: "vt-3",
    partyKind: "supplier",
    partyId: 1,
    projectId: "mock-2",
    title: "Bedroom furniture suite delivery",
    startDate: "2026-08-01",
    dueDate: "2026-08-20",
    status: "todo",
  },
  {
    id: "vt-4",
    partyKind: "supplier",
    partyId: 2,
    projectId: "mock-1",
    title: "Solid oak flooring delivery",
    description: "Fiemme 3000 boards for living, dining, and hall.",
    startDate: "2026-08-25",
    dueDate: "2026-09-12",
    status: "todo",
  },
  {
    id: "vt-5",
    partyKind: "subvendor",
    partyId: 101,
    projectId: "mock-1",
    title: "Feature wall and marble flooring",
    description: "Feature wall installation, marble flooring, kitchen splashback.",
    startDate: "2026-08-04",
    dueDate: "2026-08-30",
    status: "in-progress",
  },
  {
    id: "vt-6",
    partyKind: "subvendor",
    partyId: 101,
    projectId: "mock-2",
    title: "Marble kitchen island",
    startDate: "2026-06-02",
    dueDate: "2026-07-15",
    status: "done",
  },
  {
    id: "vt-7",
    partyKind: "subvendor",
    partyId: 103,
    projectId: "mock-1",
    title: "Smart home wiring — first fix",
    description: "Smart home wiring and underfloor heating controls.",
    startDate: "2026-07-20",
    dueDate: "2026-08-22",
    status: "in-progress",
  },
  {
    id: "vt-8",
    partyKind: "subvendor",
    partyId: 103,
    projectId: "mock-3",
    title: "Distribution board and smart lighting",
    startDate: "2026-09-01",
    dueDate: "2026-09-18",
    status: "todo",
  },
  {
    id: "vt-9",
    partyKind: "subvendor",
    partyId: 105,
    projectId: "mock-4",
    title: "Custom millwork shop drawings",
    description: "Meeting-room joinery pack for client sign-off.",
    startDate: "2026-08-10",
    dueDate: "2026-09-01",
    status: "todo",
  },
];

let vendorTasks: VendorTask[] = VENDOR_TASK_SEEDS.map((t) => ({ ...t }));
let nextId = VENDOR_TASK_SEEDS.length + 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeVendorTasks(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getVendorTasksSnapshot(): VendorTask[] {
  return vendorTasks;
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

export function getVendorPartyContact(
  partyKind: VendorPartyKind,
  partyId: number,
): VendorPartyContact {
  if (partyKind === "supplier") {
    const supplier = SUPPLIERS.find((s) => s.id === partyId);
    return {
      name: supplier?.name ?? "Supplier",
      contactPerson: supplier?.contactPerson,
      email: supplier?.email ?? "",
      phone: supplier?.phone ?? "",
    };
  }
  const vendor = SUB_VENDORS.find((v) => v.id === partyId);
  return {
    name: vendor?.name ?? "Sub-vendor",
    company: vendor?.company,
    email: vendor?.email ?? "",
    phone: vendor?.phone ?? "",
  };
}

export function getVendorPartyName(partyKind: VendorPartyKind, partyId: number): string {
  return getVendorPartyContact(partyKind, partyId).name;
}

export function getVendorProjectName(projectId: string): string {
  return getActiveProject(projectId)?.name ?? "Project";
}

export function isVendorLinkedToProject(
  partyKind: VendorPartyKind,
  partyId: number,
  projectId: string,
): boolean {
  const links = getProjectLinks(projectId);
  if (partyKind === "supplier") return links.suppliers.some((s) => s.id === partyId);
  return links.subVendors.some((v) => v.id === partyId);
}

export function getVendorTasksForParty(
  partyKind: VendorPartyKind,
  partyId: number,
  source = vendorTasks,
): VendorTask[] {
  return source
    .filter((t) => t.partyKind === partyKind && t.partyId === partyId)
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title));
}

export function getVendorTasksForProject(projectId: string, source = vendorTasks): VendorTask[] {
  return source
    .filter((t) => t.projectId === projectId)
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title));
}

export interface CreateVendorTaskInput {
  partyKind: VendorPartyKind;
  partyId: number;
  projectId: string;
  title: string;
  description?: string;
  startDate?: string;
  dueDate: string;
  status: VendorTaskStatus;
}

export function addVendorTask(input: CreateVendorTaskInput): VendorTask {
  if (!isVendorLinkedToProject(input.partyKind, input.partyId, input.projectId)) {
    throw new Error("Party is not linked to this project");
  }
  const task: VendorTask = {
    id: `vt-${nextId++}`,
    partyKind: input.partyKind,
    partyId: input.partyId,
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    startDate: input.startDate || undefined,
    dueDate: input.dueDate,
    status: input.status,
  };
  vendorTasks = [...vendorTasks, task];
  emit();
  return task;
}

export function updateVendorTask(
  id: string,
  patch: Partial<Omit<VendorTask, "id">>,
): VendorTask | null {
  const current = vendorTasks.find((t) => t.id === id);
  if (!current) return null;
  const next: VendorTask = { ...current, ...patch, id };
  if (!isVendorLinkedToProject(next.partyKind, next.partyId, next.projectId)) {
    throw new Error("Party is not linked to this project");
  }
  vendorTasks = vendorTasks.map((t) => (t.id === id ? next : t));
  emit();
  return next;
}

export function displayVendorTaskStatus(task: VendorTask): {
  label: string;
  color: string;
  bg: string;
} {
  if (isVendorTaskOverdue(task)) return VENDOR_TASK_OVERDUE_CFG;
  return VENDOR_TASK_STATUS_CFG[task.status];
}
