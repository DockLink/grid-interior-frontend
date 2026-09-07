"use client";

import { RoleDashboard } from "@/components/dashboard/studio/role-dashboard";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function MemberDashboard() {
  const data = useDashboardData("member");

  return (
    <RoleDashboard
      stats={data.stats}
      attention={data.attention}
      attentionTitle="My Focus"
      activityTitle="Recent File Activity"
      projects={data.projects}
      projectsTitle="Assigned Projects"
      todaysTasks={data.todaysTasks}
      fileActivity={data.fileActivity}
      isLoading={data.isLoading}
      showActions={false}
    />
  );
}
