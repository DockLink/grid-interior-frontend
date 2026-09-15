"use client";

import { useMemo } from "react";

import { useProjectContext } from "@/components/projects/project-context";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  DEFAULT_DEMO_PROJECT_ID,
  getActiveProject,
  TEAM_MEMBERS,
} from "@/lib/projects/mock-projects";
import { mapProjectToActiveView } from "@/lib/projects/map-project-to-active-view";
import { mapProjectMembersToHubTeam } from "@/lib/projects/map-hub-members";
import type { ActiveProjectView, HubTeamMember } from "@/types/project-hub";

export function useActiveProjectView(projectId: string): {
  project: ActiveProjectView | null;
  teamMembers: HubTeamMember[];
  isLoading: boolean;
  error: string | null;
} {
  const { project: apiProject, isLoading: projectLoading, error: projectError } =
    useProjectContext();
  const { members, isLoading: membersLoading } = useProjectMembers();
  const { tasks, isLoading: tasksLoading } = useProjectTaskables(projectId, undefined, {
    limit: 200,
  });

  const authDisabled = isAuthDisabled();

  const mockProject = useMemo(() => {
    if (!authDisabled) return null;
    return getActiveProject(projectId) ?? getActiveProject(DEFAULT_DEMO_PROJECT_ID);
  }, [authDisabled, projectId]);

  const project = useMemo(() => {
    if (authDisabled && mockProject) return mockProject;
    if (!apiProject) return null;
    const stages = tasks
      .filter((t) => t.taskableType === "STAGE")
      .map((t) => ({ title: t.title, status: t.status }));
    return mapProjectToActiveView(apiProject, {
      members,
      tasks: tasks.map((t) => ({ status: t.status })),
      stages,
    });
  }, [authDisabled, mockProject, apiProject, members, tasks]);

  const teamMembers = useMemo(() => {
    if (authDisabled && mockProject) {
      return TEAM_MEMBERS.filter((m) => mockProject.teamIds.includes(m.id));
    }
    return mapProjectMembersToHubTeam(members);
  }, [authDisabled, mockProject, members]);

  const isLoading =
    !authDisabled && (projectLoading || membersLoading || tasksLoading);
  const error = authDisabled ? null : projectError;

  return { project, teamMembers, isLoading, error };
}
