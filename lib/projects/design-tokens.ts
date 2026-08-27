export type ProjectPhase =
  | "Consultation"
  | "Concept Design"
  | "Layout"
  | "3D Design"
  | "Detail Drawings"
  | "Execution";

export const PHASES: ProjectPhase[] = [
  "Consultation",
  "Concept Design",
  "Layout",
  "3D Design",
  "Detail Drawings",
  "Execution",
];

export const PHASE_CFG: Record<
  ProjectPhase,
  { icon: string; color: string; bg: string; short: string }
> = {
  Consultation: { icon: "chat", color: "#7C3AED", bg: "#EDE9FE", short: "Consult" },
  "Concept Design": { icon: "lightbulb", color: "#D97706", bg: "#FEF3C7", short: "Concept" },
  Layout: { icon: "grid_view", color: "#0284C7", bg: "#E0F2FE", short: "Layout" },
  "3D Design": { icon: "view_in_ar", color: "#0E7C86", bg: "#CCFBF1", short: "3D" },
  "Detail Drawings": { icon: "architecture", color: "#BE185D", bg: "#FCE7F3", short: "Details" },
  Execution: { icon: "construction", color: "#1B2A4A", bg: "#E2E8F0", short: "Execution" },
};

export type ProjectHealthStatus =
  | "On Track"
  | "At Risk"
  | "Overdue"
  | "Completed"
  | "In Progress";

export const STATUS_CFG: Record<
  ProjectHealthStatus,
  { color: string; bg: string; icon: string }
> = {
  "On Track": { color: "#3FA66B", bg: "#DCFCE7", icon: "check_circle" },
  "At Risk": { color: "#F26D6D", bg: "#FEE2E2", icon: "warning" },
  Overdue: { color: "#EF4444", bg: "#FEE2E2", icon: "error" },
  Completed: { color: "#3FA66B", bg: "#DCFCE7", icon: "done_all" },
  "In Progress": { color: "#1B2A4A", bg: "#E2E8F0", icon: "timelapse" },
};

export const PROJECT_TYPES = [
  "Full Renovation",
  "Partial Renovation",
  "New Fit-out",
  "Commercial Fit-out",
  "Hospitality",
  "Soft Furnishing Refresh",
] as const;

export type PhaseWorkspace =
  | "consultation"
  | "concept"
  | "detail"
  | "layout"
  | "threed"
  | "execution";

export const PHASE_WORKSPACES: {
  id: PhaseWorkspace;
  label: string;
  icon: string;
  desc: string;
  color: string;
  bg: string;
  status: string;
}[] = [
  {
    id: "consultation",
    label: "Consultation",
    icon: "record_voice_over",
    desc: "Client brief, questionnaire, site measurements, inventory",
    color: "#0E7C86",
    bg: "rgba(14,124,134,0.08)",
    status: "Completed",
  },
  {
    id: "concept",
    label: "Concept Design",
    icon: "palette",
    desc: "Area setup, up to 3 concept options, client finalized showcase",
    color: "#7C3AED",
    bg: "#EDE9FE",
    status: "In Progress",
  },
  {
    id: "detail",
    label: "Detail Drawings",
    icon: "architecture",
    desc: "Technical drawings hub, BOQ summary, director overview",
    color: "#0891B2",
    bg: "#CFFAFE",
    status: "Upcoming",
  },
  {
    id: "layout",
    label: "Layout",
    icon: "crop_free",
    desc: "Space layout drawings upload and client confirmation",
    color: "#D97706",
    bg: "#FEF3C7",
    status: "Upcoming",
  },
  {
    id: "threed",
    label: "3D Design",
    icon: "view_in_ar",
    desc: "3D visualisations and client approval confirmation",
    color: "#1B2A4A",
    bg: "rgba(27,42,74,0.06)",
    status: "Upcoming",
  },
  {
    id: "execution",
    label: "Execution",
    icon: "construction",
    desc: "BOQ line items, supplier quotes, site sub-stages 6.1–6.13",
    color: "#1B2A4A",
    bg: "#E2E8F0",
    status: "Upcoming",
  },
];

export const WS_STATUS_CFG: Record<string, { color: string; bg: string }> = {
  Completed: { color: "#3FA66B", bg: "#DCFCE7" },
  "In Progress": { color: "#0E7C86", bg: "rgba(14,124,134,0.08)" },
  Upcoming: { color: "#9CA3AF", bg: "#F3F4F6" },
};
