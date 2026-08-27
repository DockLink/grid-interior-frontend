import { CLIENTS, type Client, type ClientStatus } from "@/lib/clients/mock-clients";
import { getActiveProject } from "@/lib/projects/mock-projects";
import type { ProjectHealthStatus, ProjectPhase } from "@/lib/projects/design-tokens";
import {
  SUB_VENDORS,
  SUPPLIERS,
  type SubVendor,
  type Supplier,
} from "@/lib/suppliers/mock-suppliers";

export interface LinkedClientView {
  id: number;
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

interface ProjectLinkSeed {
  supplierRoles: { supplierId: number; role: string }[];
  subVendorScopes: { vendorId: number; scope: string }[];
}

const PROJECT_LINK_SEEDS: Record<string, ProjectLinkSeed> = {
  "mock-1": {
    supplierRoles: [
      { supplierId: 1, role: "Kitchen & wardrobe supply" },
      { supplierId: 2, role: "Solid oak flooring" },
      { supplierId: 8, role: "Marble & stone" },
    ],
    subVendorScopes: [
      { vendorId: 101, scope: "Feature wall, marble flooring, kitchen splashback" },
      { vendorId: 103, scope: "Smart home wiring, underfloor heating controls" },
    ],
  },
  "mock-2": {
    supplierRoles: [
      { supplierId: 1, role: "Bedroom furniture suite" },
      { supplierId: 3, role: "Architectural lighting" },
    ],
    subVendorScopes: [{ vendorId: 101, scope: "Marble kitchen island, bathroom tiling" }],
  },
  "mock-3": {
    supplierRoles: [
      { supplierId: 1, role: "Display cabinetry" },
      { supplierId: 3, role: "Dining pendants" },
    ],
    subVendorScopes: [{ vendorId: 103, scope: "Smart lighting system, distribution board" }],
  },
  "mock-4": {
    supplierRoles: [{ supplierId: 8, role: "Reception stone cladding" }],
    subVendorScopes: [{ vendorId: 105, scope: "Custom millwork for meeting rooms" }],
  },
  "mock-5": {
    supplierRoles: [
      { supplierId: 2, role: "Terrace & indoor timber" },
      { supplierId: 3, role: "Outdoor & interior lighting" },
      { supplierId: 4, role: "Upholstery fabrics" },
    ],
    subVendorScopes: [{ vendorId: 102, scope: "Bathroom and kitchen plumbing rough-in" }],
  },
  "mock-6": {
    supplierRoles: [
      { supplierId: 1, role: "Custom furniture suite" },
      { supplierId: 4, role: "Soft furnishings" },
    ],
    subVendorScopes: [
      { vendorId: 101, scope: "Travertine feature wall, terrace paving" },
      { vendorId: 103, scope: "Full electrical installation, outdoor lighting" },
    ],
  },
  "mock-7": {
    supplierRoles: [
      { supplierId: 3, role: "Lobby & suite lighting" },
      { supplierId: 5, role: "Restaurant tile package" },
      { supplierId: 6, role: "Suite door sets" },
    ],
    subVendorScopes: [
      { vendorId: 105, scope: "Joinery for lobby reception and guest suites" },
      { vendorId: 107, scope: "Final paint and decorative finishes" },
    ],
  },
  "mock-8": {
    supplierRoles: [
      { supplierId: 3, role: "Ensuite lighting" },
      { supplierId: 4, role: "Drapery and bed textiles" },
      { supplierId: 5, role: "Ensuite tile package" },
    ],
    subVendorScopes: [
      { vendorId: 104, scope: "Venetian plaster in sitting area" },
      { vendorId: 106, scope: "Ensuite and wet-room tiling" },
    ],
  },
};

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function clientToView(client: Client): LinkedClientView {
  return {
    id: client.id,
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
    initials: client.initials,
    color: client.color,
    status: client.status,
  };
}

function fallbackClient(id: number, name: string): LinkedClientView {
  return {
    id,
    name,
    company: "",
    email: "",
    phone: "",
    initials: initialsFromName(name) || "CL",
    color: "#1B2A4A",
    status: "Active",
  };
}

function hubStatusToLinkHealth(status: ProjectHealthStatus): LinkedProjectHealth {
  return status === "At Risk" || status === "Overdue" ? "at-risk" : "on-track";
}

function resolveClient(clientId: number, clientName: string): LinkedClientView {
  const match = CLIENTS.find((c) => c.id === clientId && !c.deleted);
  return match ? clientToView(match) : fallbackClient(clientId, clientName);
}

export function getProjectLinks(projectId: string): ProjectLinks {
  const project = getActiveProject(projectId);
  const client = project ? resolveClient(project.clientId, project.clientName) : null;
  const seed = PROJECT_LINK_SEEDS[projectId];

  if (!seed) {
    return { client, suppliers: [], subVendors: [] };
  }

  const suppliers = seed.supplierRoles.flatMap(({ supplierId, role }) => {
    const supplier = SUPPLIERS.find((s) => s.id === supplierId);
    return supplier ? [{ ...supplier, role }] : [];
  });

  const subVendors = seed.subVendorScopes.flatMap(({ vendorId, scope }) => {
    const vendor = SUB_VENDORS.find((v) => v.id === vendorId);
    return vendor ? [{ ...vendor, scope }] : [];
  });

  return { client, suppliers, subVendors };
}

export function getSupplierLinkedProjects(supplierId: number): SupplierLinkedProject[] {
  const results: SupplierLinkedProject[] = [];

  for (const [projectId, seed] of Object.entries(PROJECT_LINK_SEEDS)) {
    const link = seed.supplierRoles.find((r) => r.supplierId === supplierId);
    if (!link) continue;
    const project = getActiveProject(projectId);
    if (!project) continue;
    results.push({
      projectId: project.id,
      name: project.name,
      phase: project.phase,
      status: hubStatusToLinkHealth(project.status),
      role: link.role,
    });
  }

  return results;
}

export function getSubVendorLinkedProjects(vendorId: number): SubVendorLinkedProject[] {
  const results: SubVendorLinkedProject[] = [];

  for (const [projectId, seed] of Object.entries(PROJECT_LINK_SEEDS)) {
    const link = seed.subVendorScopes.find((r) => r.vendorId === vendorId);
    if (!link) continue;
    const project = getActiveProject(projectId);
    if (!project) continue;
    results.push({
      projectId: project.id,
      name: project.name,
      phase: project.phase,
      status: hubStatusToLinkHealth(project.status),
      scope: link.scope,
    });
  }

  return results;
}
