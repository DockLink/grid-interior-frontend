import type { ClientStatus } from "@/types/clients";
import type { SubVendor, Supplier } from "@/types/suppliers";
import type { ProjectHealthStatus, ProjectPhase } from "@/lib/projects/design-tokens";

export interface LinkedClientView {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  initials: string;
  color: string;
  status: ClientStatus;
}

export interface LinkedSupplierView extends Supplier {
  role: string;
}

export interface LinkedSubVendorView extends SubVendor {
  scope: string;
}

export interface ProjectLinks {
  client: LinkedClientView | null;
  suppliers: LinkedSupplierView[];
  subVendors: LinkedSubVendorView[];
}

export interface ProjectLinksApi {
  client_id?: string | null;
  client?: LinkedClientView | null;
  suppliers?: { supplier_id: string; role: string }[];
  sub_vendors?: { sub_vendor_id: string; scope: string }[];
}

export interface UpdateProjectLinksPayload {
  client_id?: string | null;
  suppliers?: { supplier_id: string; role: string }[];
  sub_vendors?: { sub_vendor_id: string; scope: string }[];
}

export type LinkedProjectHealth = "on-track" | "at-risk";

export interface SupplierLinkedProject {
  projectId: string;
  name: string;
  phase: ProjectPhase;
  status: LinkedProjectHealth;
  role: string;
}

export interface SubVendorLinkedProject {
  projectId: string;
  name: string;
  phase: ProjectPhase;
  status: LinkedProjectHealth;
  scope: string;
}
