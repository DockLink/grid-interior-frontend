"use client";

import { RoleDashboard } from "@/components/dashboard/studio/role-dashboard";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function LeadDashboard() {
  const data = useDashboardData("lead");

  return (
    <RoleDashboard
      stats={data.stats}
      attention={data.attention}
      attentionTitle="Needs Your Attention"
      activityTitle="Recent File Activity"
      projects={data.projects}
      projectsTitle="Your Projects"
      todaysTasks={data.todaysTasks}
      fileActivity={data.fileActivity}
      isLoading={data.isLoading}
      showActions
      onAttentionAction={data.handleAttentionAction}
    />
  );
}
