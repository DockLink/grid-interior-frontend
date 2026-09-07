"use client";

import { useCallback, useMemo } from "react";

import { useProjectContext } from "@/components/projects/project-context";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapProjectMembersToHubTeam } from "@/lib/projects/map-hub-members";
import { PROJECT_LEAD_ROLE } from "@/types/projects";
import {
  GANTT_PHASES,
  MILESTONES,
  PROJECT_END,
  PROJECT_START,
  TOTAL_WEEKS,
} from "@/lib/timeline/mock-timeline";
import {
  mapTimelineWorkspace,
  weeksToIsoRange,
  type TimelineLead,
  type TimelineWorkspaceView,
} from "@/lib/timeline/map-timeline-workspace";

const MOCK_VIEW: TimelineWorkspaceView = {
  phases: GANTT_PHASES,
  milestones: MILESTONES,
  projectStartIso: "2026-05-15",
  projectEndIso: "2026-12-18",
  projectStartLabel: PROJECT_START,
  projectEndLabel: PROJECT_END,
  totalWeeks: TOTAL_WEEKS,
  currentWeek: 9,
};

export function useProjectTimeline(projectId: string) {
  const authDisabled = isAuthDisabled();
  const { project: apiProject, isLoading: projectLoading, error: projectError } =
    useProjectContext();
  const { members, projectLeadUserId, isLoading: membersLoading } = useProjectMembers();

  const {
    tasks: stages,
    isLoading: stagesLoading,
    error: stagesError,
    refetch: refetchStages,
    updateTaskableDates,
  } = useProjectTaskables(projectId, "STAGE", { limit: 100 });

  const {
    tasks: milestones,
    isLoading: milestonesLoading,
    error: milestonesError,
    refetch: refetchMilestones,
  } = useProjectTaskables(projectId, "MILESTONE", { limit: 200 });

  const lead: TimelineLead | null = useMemo(() => {
    const hub = mapProjectMembersToHubTeam(members);
    const leadIndex = members.findIndex(
      (m) => m.status === "ACTIVE" && (m.user_id === projectLeadUserId || m.role === PROJECT_LEAD_ROLE),
    );
    const member = (leadIndex >= 0 ? hub[leadIndex] : hub[0]) ?? null;
    if (!member) return null;
    return {
      initials: member.initials || "—",
      color: member.color,
      name: member.name,
    };
  }, [members, projectLeadUserId]);

  const view = useMemo(() => {
    if (authDisabled) return MOCK_VIEW;
    return mapTimelineWorkspace(apiProject, stages, milestones, { lead });
  }, [authDisabled, apiProject, stages, milestones, lead]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchStages(), refetchMilestones()]);
  }, [refetchStages, refetchMilestones]);

  const updateStageDates = useCallback(
    async (stageId: string, startWeek: number, durationWeeks: number) => {
      const { startDateIso, endDateIso } = weeksToIsoRange(
        view.projectStartIso,
        startWeek,
        durationWeeks,
      );
      await updateTaskableDates(stageId, startDateIso, endDateIso);
      await refetch();
    },
    [view.projectStartIso, updateTaskableDates, refetch],
  );

  const isLoading =
    !authDisabled &&
    (projectLoading || membersLoading || stagesLoading || milestonesLoading);
  const error = authDisabled
    ? null
    : projectError || stagesError || milestonesError;

  return {
    ...view,
    isLoading,
    error,
    refetch,
    updateStageDates,
  };
}
