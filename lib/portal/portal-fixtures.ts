import type {
  PortalMaterial,
  PortalMilestone,
  PortalPhase,
  PortalProjectionApi,
  PortalViewModel,
} from "@/types/portal";
import { accessFromDemoToken } from "@/lib/portal/map-portal";

const PORTAL_PROJECT = {
  name: "Marchetti Villa",
  clientName: "Giulia Marchetti",
  designer: "Priya Nair",
  startDate: "15 May 2026",
  endDate: "18 Dec 2026",
  overallProgress: 38,
  projectId: "GRID-2026-042",
  lastFridayUpdate: "15 Aug 2026",
  completedDate: null as string | null,
  bufferDays: 10,
};

const PORTAL_PHASES: PortalPhase[] = [
  {
    id: 1,
    name: "Concept Design",
    status: "completed",
    progress: 100,
    startDate: "15 May 2026",
    endDate: "14 Jun 2026",
    description:
      "Initial design vision, mood boards, and space planning concepts.",
  },
  {
    id: 2,
    name: "Schematic Design",
    status: "completed",
    progress: 100,
    startDate: "15 Jun 2026",
    endDate: "09 Jul 2026",
    description: "Detailed floor plans, elevations, and material direction.",
  },
  {
    id: 3,
    name: "Design Development",
    status: "active",
    progress: 60,
    startDate: "10 Jul 2026",
    endDate: "14 Aug 2026",
    description:
      "Finalising all specifications — finishes, lighting, FF&E selection.",
  },
  {
    id: 4,
    name: "Technical Drawings",
    status: "upcoming",
    progress: 0,
    startDate: "15 Aug 2026",
    endDate: "01 Sep 2026",
    description:
      "Construction drawings, detail sheets, and consultant coordination.",
  },
  {
    id: 5,
    name: "Procurement",
    status: "upcoming",
    progress: 0,
    startDate: "02 Sep 2026",
    endDate: "30 Sep 2026",
    description: "Ordering all approved furniture, materials, and finishes.",
  },
  {
    id: 6,
    name: "Site Execution",
    status: "upcoming",
    progress: 0,
    startDate: "01 Oct 2026",
    endDate: "10 Dec 2026",
    description:
      "Construction, installation, and site supervision by the GRID team.",
  },
  {
    id: 7,
    name: "Handover",
    status: "upcoming",
    progress: 0,
    startDate: "11 Dec 2026",
    endDate: "18 Dec 2026",
    description: "Final snagging, styling, and project handover.",
  },
];

const PORTAL_MILESTONES: PortalMilestone[] = [
  {
    id: 1,
    name: "Concept Approval",
    date: "14 Jun 2026",
    status: "completed",
    notes:
      "You approved Concept 1 — contemporary Italian, warm stone palette, statement lighting.",
  },
  {
    id: 2,
    name: "Layout Finalised",
    date: "09 Jul 2026",
    status: "completed",
    notes: "All room layouts and flow approved and locked.",
  },
  {
    id: 3,
    name: "Mid-Design Review",
    date: "28 Jul 2026",
    status: "overdue",
    notes: "Rescheduled to 01 Aug — please confirm your availability.",
  },
  {
    id: 4,
    name: "Materials Sign-Off",
    date: "14 Aug 2026",
    status: "upcoming",
  },
  {
    id: 5,
    name: "Procurement Approval",
    date: "20 Sep 2026",
    status: "upcoming",
  },
  {
    id: 6,
    name: "Site Handover",
    date: "18 Dec 2026",
    status: "upcoming",
  },
];

const PORTAL_MATERIALS: PortalMaterial[] = [
  {
    id: 1,
    category: "Stone & Marble",
    item: "Calacatta Viola Marble — Lobby Feature Wall",
    status: "approved",
    description: "Italian marble, custom 1800×900mm panels, brushed finish.",
    approvedDate: "20 Jul 2026",
  },
  {
    id: 2,
    category: "Stone & Marble",
    item: "Travertine Floor Tiles — Main Areas",
    status: "ordered",
    description: "Cross-cut Travertine, 600×600mm, honed finish.",
  },
  {
    id: 3,
    category: "Furniture",
    item: "Custom Living Room Sofa",
    status: "pending",
    description:
      "Contemporary curved sofa, boucle fabric — awaiting your fabric selection.",
  },
  {
    id: 4,
    category: "Furniture",
    item: "10-Seater Dining Table — Walnut",
    status: "approved",
    description:
      "Custom solid walnut dining table, 280×110cm, matte lacquer base.",
    approvedDate: "22 Jul 2026",
  },
  {
    id: 5,
    category: "Lighting",
    item: "Lobby Statement Chandelier",
    status: "pending",
    description:
      "Custom fabricated chandelier — technical drawings in progress. Your review required.",
  },
  {
    id: 6,
    category: "Lighting",
    item: "Bedroom Pendant Set × 4",
    status: "ordered",
    description: "Murano glass pendants, brushed gold finish.",
  },
  {
    id: 7,
    category: "Hardware",
    item: "Brushed Brass Door Hardware",
    status: "delivered",
    description: "Full set — lever handles, hinges, and accessories.",
  },
];

/** Auth-off / demo projection for local portal UX. */
export function getPortalFixtureView(token?: string): PortalViewModel {
  return {
    access: accessFromDemoToken(token),
    project: { ...PORTAL_PROJECT },
    phases: PORTAL_PHASES.map((p) => ({ ...p })),
    milestones: PORTAL_MILESTONES.map((m) => ({ ...m })),
    materials: PORTAL_MATERIALS.map((m) => ({ ...m })),
  };
}

/** Snake_case API shape for BFF auth-off short-circuit if needed. */
export function getPortalFixtureApi(token?: string): PortalProjectionApi {
  const view = getPortalFixtureView(token);
  return {
    access: view.access,
    buffer_days: view.project.bufferDays,
    project: {
      name: view.project.name,
      client_name: view.project.clientName,
      designer: view.project.designer,
      project_code: view.project.projectId,
      start_date: view.project.startDate,
      end_date: view.project.endDate,
      overall_progress: view.project.overallProgress,
      last_friday_update: view.project.lastFridayUpdate,
      completed_date: view.project.completedDate,
    },
    phases: view.phases.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      progress: p.progress,
      start_date: p.startDate,
      end_date: p.endDate,
      description: p.description,
    })),
    milestones: view.milestones.map((m) => ({
      id: m.id,
      name: m.name,
      date: m.date,
      status: m.status,
      notes: m.notes ?? null,
    })),
    materials: view.materials.map((m) => ({
      id: m.id,
      category: m.category,
      item: m.item,
      status: m.status,
      description: m.description,
      approved_date: m.approvedDate ?? null,
    })),
  };
}
