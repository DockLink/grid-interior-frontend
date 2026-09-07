"use client";

import { RoleDashboard } from "@/components/dashboard/studio/role-dashboard";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function AdminDashboard() {
  const data = useDashboardData("admin");

  return (
    <RoleDashboard
      stats={data.stats}
      attention={data.attention}
      projects={data.projects}
      todaysTasks={data.todaysTasks}
      fileActivity={data.fileActivity}
      isLoading={data.isLoading}
      showActions
      onAttentionAction={data.handleAttentionAction}
    />
  );
}
