import { mapProjectToOverviewView } from "@/lib/projects/map-project-overview";
import type { ActiveProjectView } from "@/types/project-hub";
import type { Project, ProjectMember } from "@/types/projects";

/** Maps live Project API data to hub workspace ActiveProjectView. */
export function mapProjectToActiveView(
  project: Project,
  options: {
    members?: ProjectMember[];
    tasks?: { status: string }[];
  } = {},
): ActiveProjectView {
  const overview = mapProjectToOverviewView(project, options);
  const activeMembers = (options.members ?? []).filter((m) => m.status === "ACTIVE");

  return {
    id: overview.id,
    name: overview.name,
    clientId: 0,
    clientName: overview.clientName,
    phase: overview.phase,
    phaseIndex: overview.phaseIndex,
    status: overview.status,
    progress: overview.progress,
    nextDeadline: overview.nextDeadline,
    teamIds: activeMembers.map((_, i) => i + 1),
    startDate: overview.startDate,
    endDate: overview.endDate,
    location: overview.location,
    distanceKm: overview.distanceKm ?? 0,
    projectType: overview.projectType,
    tasksTotal: overview.tasksTotal,
    tasksDone: overview.tasksDone,
    daysActive: overview.daysActive,
    description: overview.description,
    activity: overview.activity,
  };
}
