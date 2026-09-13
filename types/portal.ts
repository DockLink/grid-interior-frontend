export type PortalAccess = "active" | "buffer" | "closed";

export type PortalPhaseStatus = "completed" | "active" | "upcoming";
export type PortalMilestoneStatus = "completed" | "upcoming" | "overdue";
export type PortalMaterialStatus = "approved" | "pending" | "ordered" | "delivered";

/** Nest / BFF projection (snake_case). */
export interface PortalProjectApi {
  name: string;
  client_name: string;
  designer: string;
  project_code: string;
  start_date: string;
  end_date: string;
  overall_progress: number;
  last_friday_update: string;
  completed_date: string | null;
}

export interface PortalPhaseApi {
  id: string | number;
  name: string;
  status: PortalPhaseStatus | string;
  progress: number;
  start_date: string;
  end_date: string;
  description: string;
}

export interface PortalMilestoneApi {
  id: string | number;
  name: string;
  date: string;
  status: PortalMilestoneStatus | string;
  notes?: string | null;
}

export interface PortalMaterialApi {
  id: string | number;
  category: string;
  item: string;
  status: PortalMaterialStatus | string;
  description: string;
  approved_date?: string | null;
}

export interface PortalProjectionApi {
  access: PortalAccess | string;
  buffer_days: number;
  project: PortalProjectApi;
  phases: PortalPhaseApi[];
  milestones: PortalMilestoneApi[];
  materials: PortalMaterialApi[];
}

/** UI view models (camelCase, display-ready dates). */
export interface PortalProject {
  name: string;
  clientName: string;
  designer: string;
  projectId: string;
  startDate: string;
  endDate: string;
  overallProgress: number;
  lastFridayUpdate: string;
  completedDate: string | null;
  bufferDays: number;
}

export interface PortalPhase {
  id: number;
  name: string;
  status: PortalPhaseStatus;
  progress: number;
  startDate: string;
  endDate: string;
  description: string;
}

export interface PortalMilestone {
  id: number;
  name: string;
  date: string;
  status: PortalMilestoneStatus;
  notes?: string;
}

export interface PortalMaterial {
  id: number;
  category: string;
  item: string;
  status: PortalMaterialStatus;
  description: string;
  approvedDate?: string;
}

export interface PortalViewModel {
  access: PortalAccess;
  project: PortalProject;
  phases: PortalPhase[];
  milestones: PortalMilestone[];
  materials: PortalMaterial[];
}
