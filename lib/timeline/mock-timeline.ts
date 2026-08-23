// Mock timeline data for Phase 4 Timeline Workspace
// Ported from Design System for GRID CRM/src/screens/timeline/TimelineWorkspace.tsx

export interface GanttPhase {
  id: number;
  name: string;
  color: string;
  bg: string;
  startWeek: number; // 0-indexed from project start
  durationWeeks: number;
  progress: number; // 0–100
  milestone?: string;
  status: "completed" | "active" | "upcoming";
  lead: { initials: string; color: string; name: string };
}

export interface Milestone {
  id: number;
  name: string;
  date: string;
  status: "completed" | "upcoming" | "overdue";
  phase: string;
  notes?: string;
}

export interface MaterialItem {
  id: number;
  category: string;
  item: string;
  supplier: string;
  status: "approved" | "pending" | "ordered" | "delivered";
  eta: string;
  value: string;
  notes?: string;
}

export const GANTT_PHASES: GanttPhase[] = [
  {
    id: 1,
    name: "Concept Design",
    color: "#0E7C86",
    bg: "rgba(14,124,134,0.12)",
    startWeek: 0,
    durationWeeks: 3,
    progress: 100,
    milestone: "Concept Approved",
    status: "completed",
    lead: { initials: "DS", color: "#D97706", name: "Dilani Silva" },
  },
  {
    id: 2,
    name: "Schematic Design",
    color: "#0891B2",
    bg: "rgba(8,145,178,0.12)",
    startWeek: 3,
    durationWeeks: 4,
    progress: 100,
    status: "completed",
    lead: { initials: "DS", color: "#D97706", name: "Dilani Silva" },
  },
  {
    id: 3,
    name: "Design Development",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.12)",
    startWeek: 7,
    durationWeeks: 5,
    progress: 60,
    status: "active",
    lead: { initials: "AP", color: "#0891B2", name: "Ashan Perera" },
  },
  {
    id: 4,
    name: "Technical Drawings",
    color: "#D97706",
    bg: "rgba(217,119,6,0.12)",
    startWeek: 12,
    durationWeeks: 4,
    progress: 0,
    status: "upcoming",
    lead: { initials: "AP", color: "#0891B2", name: "Ashan Perera" },
  },
  {
    id: 5,
    name: "Procurement & FF&E",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.12)",
    startWeek: 14,
    durationWeeks: 6,
    progress: 0,
    status: "upcoming",
    lead: { initials: "RF", color: "#059669", name: "Roshan Fernando" },
  },
  {
    id: 6,
    name: "Site Execution",
    color: "#059669",
    bg: "rgba(5,150,105,0.12)",
    startWeek: 20,
    durationWeeks: 8,
    progress: 0,
    status: "upcoming",
    lead: { initials: "AP", color: "#0891B2", name: "Ashan Perera" },
  },
  {
    id: 7,
    name: "Snag & Handover",
    color: "#1B2A4A",
    bg: "rgba(27,42,74,0.10)",
    startWeek: 28,
    durationWeeks: 2,
    progress: 0,
    status: "upcoming",
    lead: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
  },
];

export const MILESTONES: Milestone[] = [
  {
    id: 1,
    name: "Concept Approval",
    date: "14 Jun 2026",
    status: "completed",
    phase: "Concept Design",
    notes: "Client approved Concept 1 with minor feedback.",
  },
  {
    id: 2,
    name: "Schematic Freeze",
    date: "09 Jul 2026",
    status: "completed",
    phase: "Schematic Design",
    notes: "All layouts finalised and signed off.",
  },
  {
    id: 3,
    name: "Mid-Design Client Review",
    date: "28 Jul 2026",
    status: "overdue",
    phase: "Design Development",
    notes: "Presentation rescheduled to 01 Aug.",
  },
  {
    id: 4,
    name: "Design Development Complete",
    date: "14 Aug 2026",
    status: "upcoming",
    phase: "Design Development",
  },
  {
    id: 5,
    name: "Technical Drawings Issue",
    date: "01 Sep 2026",
    status: "upcoming",
    phase: "Technical Drawings",
  },
  {
    id: 6,
    name: "Procurement Lock",
    date: "20 Sep 2026",
    status: "upcoming",
    phase: "Procurement & FF&E",
  },
  {
    id: 7,
    name: "Site Handover (Final)",
    date: "18 Dec 2026",
    status: "upcoming",
    phase: "Snag & Handover",
  },
];

export const MATERIAL_ITEMS: MaterialItem[] = [
  {
    id: 1,
    category: "Stone & Marble",
    item: "Calacatta Viola Marble Slabs (Lobby Feature Wall)",
    supplier: "Al Madina Stone",
    status: "approved",
    eta: "05 Sep 2026",
    value: "AED 48,000",
    notes: "Custom cut to 1800×900mm panels",
  },
  {
    id: 2,
    category: "Stone & Marble",
    item: "Travertine Floor Tiles (Main Areas)",
    supplier: "Al Madina Stone",
    status: "ordered",
    eta: "22 Aug 2026",
    value: "AED 36,000",
  },
  {
    id: 3,
    category: "Furniture",
    item: "Custom Sofa — Living Area (B&B Italia reference)",
    supplier: "Modern Living Dubai",
    status: "pending",
    eta: "TBC",
    value: "AED 28,500",
    notes: "Awaiting client approval on fabric",
  },
  {
    id: 4,
    category: "Furniture",
    item: "Dining Table — 10-seater (custom walnut)",
    supplier: "Art of Furniture",
    status: "approved",
    eta: "15 Sep 2026",
    value: "AED 18,200",
  },
  {
    id: 5,
    category: "Lighting",
    item: "Lobby Chandelier (custom fabrication)",
    supplier: "Lumis Design UAE",
    status: "pending",
    eta: "TBC",
    value: "AED 55,000",
    notes: "Technical spec drawings pending",
  },
  {
    id: 6,
    category: "Lighting",
    item: "Bedroom Pendant Set × 4",
    supplier: "Flos UAE",
    status: "ordered",
    eta: "10 Sep 2026",
    value: "AED 12,800",
  },
  {
    id: 7,
    category: "Hardware & Finishes",
    item: "Brushed Brass Door Hardware Set",
    supplier: "Hafele UAE",
    status: "delivered",
    eta: "Delivered",
    value: "AED 9,400",
  },
  {
    id: 8,
    category: "Soft Furnishings",
    item: "Living Area Rug (custom, 4×6m)",
    supplier: "The Rug Quarter",
    status: "pending",
    eta: "TBC",
    value: "AED 22,000",
  },
];

export const TOTAL_WEEKS = 30;
export const PROJECT_START = "15 May 2026";
export const PROJECT_END = "18 Dec 2026";
export const PROJECT_NAME = "Marchetti Villa";

/** Independent client-facing timeline — not a filter of the internal Gantt. */
export const CLIENT_GANTT_PHASES: GanttPhase[] = [
  {
    id: 1,
    name: "Consultation",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.12)",
    startWeek: 0,
    durationWeeks: 2,
    progress: 100,
    milestone: "Brief confirmed",
    status: "completed",
    lead: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
  },
  {
    id: 2,
    name: "Concept",
    color: "#0E7C86",
    bg: "rgba(14,124,134,0.12)",
    startWeek: 2,
    durationWeeks: 4,
    progress: 100,
    milestone: "Concept approved",
    status: "completed",
    lead: { initials: "DS", color: "#D97706", name: "Dilani Silva" },
  },
  {
    id: 3,
    name: "Layout & 3D",
    color: "#0891B2",
    bg: "rgba(8,145,178,0.12)",
    startWeek: 6,
    durationWeeks: 5,
    progress: 40,
    milestone: "Client presentation",
    status: "active",
    lead: { initials: "AP", color: "#0891B2", name: "Ashan Perera" },
  },
  {
    id: 4,
    name: "Detail Drawings",
    color: "#BE185D",
    bg: "rgba(190,24,93,0.12)",
    startWeek: 11,
    durationWeeks: 3,
    progress: 0,
    status: "upcoming",
    lead: { initials: "CG", color: "#BE185D", name: "Chamari Gunasena" },
  },
  {
    id: 5,
    name: "Site Execution",
    color: "#059669",
    bg: "rgba(5,150,105,0.12)",
    startWeek: 14,
    durationWeeks: 12,
    progress: 0,
    status: "upcoming",
    lead: { initials: "RF", color: "#059669", name: "Roshan Fernando" },
  },
  {
    id: 6,
    name: "Handover",
    color: "#1B2A4A",
    bg: "rgba(27,42,74,0.10)",
    startWeek: 26,
    durationWeeks: 2,
    progress: 0,
    status: "upcoming",
    lead: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
  },
];

export interface OverlapBar {
  id: string;
  name: string;
  startWeek: number;
  durationWeeks: number;
  color: string;
}

export const EXECUTION_OVERLAP_BARS: OverlapBar[] = [
  { id: "6.4", name: "Electrical & Wiring", startWeek: 20, durationWeeks: 3, color: "#D97706" },
  { id: "6.5", name: "Walls / Doors / Windows", startWeek: 21, durationWeeks: 3, color: "#0891B2" },
  { id: "6.6", name: "Ceiling Works", startWeek: 21.5, durationWeeks: 2.5, color: "#0E7C86" },
  { id: "6.8", name: "Flooring", startWeek: 24, durationWeeks: 2, color: "#8B5CF6" },
];
