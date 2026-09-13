import type {
  PortalAccess,
  PortalMaterial,
  PortalMaterialApi,
  PortalMaterialStatus,
  PortalMilestone,
  PortalMilestoneApi,
  PortalMilestoneStatus,
  PortalPhase,
  PortalPhaseApi,
  PortalPhaseStatus,
  PortalProjectionApi,
  PortalProject,
  PortalViewModel,
} from "@/types/portal";

function formatPortalDate(value: string | null | undefined): string {
  if (!value) return "—";
  // Already display-formatted (e.g. fixtures / Nest pre-formatted)
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function asAccess(value: string | undefined): PortalAccess {
  if (value === "buffer" || value === "closed" || value === "active") return value;
  return "active";
}

function asPhaseStatus(value: string): PortalPhaseStatus {
  if (value === "completed" || value === "active" || value === "upcoming") return value;
  return "upcoming";
}

function asMilestoneStatus(value: string): PortalMilestoneStatus {
  if (value === "completed" || value === "upcoming" || value === "overdue") return value;
  return "upcoming";
}

function asMaterialStatus(value: string): PortalMaterialStatus {
  if (
    value === "approved" ||
    value === "pending" ||
    value === "ordered" ||
    value === "delivered"
  ) {
    return value;
  }
  return "pending";
}

function toNumericId(id: string | number, fallback: number): number {
  if (typeof id === "number" && Number.isFinite(id)) return id;
  const n = Number(id);
  return Number.isFinite(n) ? n : fallback;
}

export function mapPortalProject(
  project: PortalProjectionApi["project"],
  bufferDays: number,
): PortalProject {
  return {
    name: project.name ?? "",
    clientName: project.client_name ?? "",
    designer: project.designer ?? "",
    projectId: project.project_code ?? "",
    startDate: formatPortalDate(project.start_date),
    endDate: formatPortalDate(project.end_date),
    overallProgress: Number(project.overall_progress) || 0,
    lastFridayUpdate: formatPortalDate(project.last_friday_update),
    completedDate: project.completed_date
      ? formatPortalDate(project.completed_date)
      : null,
    bufferDays: Number(bufferDays) || 10,
  };
}

export function mapPortalPhase(phase: PortalPhaseApi, index: number): PortalPhase {
  return {
    id: toNumericId(phase.id, index + 1),
    name: phase.name ?? "",
    status: asPhaseStatus(String(phase.status)),
    progress: Number(phase.progress) || 0,
    startDate: formatPortalDate(phase.start_date),
    endDate: formatPortalDate(phase.end_date),
    description: phase.description ?? "",
  };
}

export function mapPortalMilestone(
  milestone: PortalMilestoneApi,
  index: number,
): PortalMilestone {
  return {
    id: toNumericId(milestone.id, index + 1),
    name: milestone.name ?? "",
    date: formatPortalDate(milestone.date),
    status: asMilestoneStatus(String(milestone.status)),
    notes: milestone.notes ?? undefined,
  };
}

export function mapPortalMaterial(
  material: PortalMaterialApi,
  index: number,
): PortalMaterial {
  return {
    id: toNumericId(material.id, index + 1),
    category: material.category ?? "Uncategorized",
    item: material.item ?? "",
    status: asMaterialStatus(String(material.status)),
    description: material.description ?? "",
    approvedDate: material.approved_date
      ? formatPortalDate(material.approved_date)
      : undefined,
  };
}

export function mapPortalProjection(raw: PortalProjectionApi): PortalViewModel {
  const bufferDays = Number(raw.buffer_days) || 10;
  return {
    access: asAccess(String(raw.access)),
    project: mapPortalProject(raw.project, bufferDays),
    phases: (raw.phases ?? []).map(mapPortalPhase),
    milestones: (raw.milestones ?? []).map(mapPortalMilestone),
    materials: (raw.materials ?? []).map(mapPortalMaterial),
  };
}

/** Derive access from demo token when Nest is unavailable / auth-off. */
export function accessFromDemoToken(token: string | undefined): PortalAccess {
  if (token === "expired" || token === "closed") return "closed";
  if (token === "buffer") return "buffer";
  return "active";
}
