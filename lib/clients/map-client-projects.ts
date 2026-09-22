import type { ClientLinkedProject, ClientLinkedProjectStatus } from "@/types/clients";
import type { Project, ProjectCardView } from "@/types/projects";
import { resolveProjectProgress } from "@/lib/projects/project-progress";

function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mapStatus(project: Project): ClientLinkedProjectStatus {
  if (project.status === "INACTIVE") return "completed";
  const stage = (project.current_stage ?? "").toLowerCase();
  if (stage.includes("complete") || stage.includes("handover")) return "completed";
  if (stage.includes("hold")) return "on-hold";
  if (stage.includes("risk")) return "at-risk";
  return project.status === "ACTIVE" ? "active" : "on-track";
}

export function mapProjectToClientLinked(project: Project): ClientLinkedProject {
  return {
    id: project.id,
    name: project.name,
    code: project.code,
    phase: project.current_stage ?? "—",
    status: mapStatus(project),
    progress: resolveProjectProgress({
      apiCompletion: project.completion,
      currentStage: project.current_stage,
      projectStatus: project.status,
    }),
    startDate: formatMonthYear(project.start_date),
    dueDate: formatShortDate(project.updated_at),
    teamInitials: [],
  };
}

export function mapProjectCardToClientLinked(card: ProjectCardView): ClientLinkedProject {
  const status: ClientLinkedProjectStatus =
    card.status === "Inactive"
      ? "completed"
      : card.currentStage?.toLowerCase().includes("complete")
        ? "completed"
        : "active";

  return {
    id: card.id,
    name: card.name,
    code: card.number,
    phase: card.currentStage ?? "—",
    status,
    progress: resolveProjectProgress({
      apiCompletion: card.completion,
      currentStage: card.currentStage,
      projectStatus: card.status,
    }),
    startDate: card.startDate ?? "—",
    dueDate: card.updatedAt ?? "—",
    teamInitials: [],
  };
}

export const CLIENT_PROJECT_STATUS_CFG: Record<
  ClientLinkedProjectStatus,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.08)" },
  completed: { label: "Completed", color: "#3FA66B", bg: "#DCFCE7" },
  "on-hold": { label: "On Hold", color: "#D97706", bg: "#FEF3C7" },
  "on-track": { label: "On Track", color: "#3FA66B", bg: "rgba(63,166,107,0.10)" },
  "at-risk": { label: "At Risk", color: "#F5A623", bg: "rgba(245,166,35,0.10)" },
};
