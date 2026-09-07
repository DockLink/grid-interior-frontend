"use client";

import { RoleDashboard } from "@/components/dashboard/studio/role-dashboard";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function SuperAdminDashboard() {
  const data = useDashboardData("superadmin");

  return (
    <RoleDashboard
      stats={data.stats}
      attention={data.attention}
      attentionTitle="Needs Your Attention"
      projects={data.projects}
      projectsTitle="Projects Overview"
      todaysTasks={data.todaysTasks}
      fileActivity={data.fileActivity}
      isLoading={data.isLoading}
      showActions
      onAttentionAction={data.handleAttentionAction}
    />
  );
}
