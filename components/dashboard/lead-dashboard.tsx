"use client";

import { RoleDashboard } from "@/components/dashboard/studio/role-dashboard";
import {
  LEAD_ATTENTION_DATA,
  LEAD_STATS,
  PROJECTS_OVERVIEW_DATA,
} from "@/components/dashboard/studio/demo-data";

export function LeadDashboard() {
  return (
    <RoleDashboard
      stats={LEAD_STATS}
      attention={LEAD_ATTENTION_DATA}
      attentionTitle="Needs Your Attention"
      activityTitle="Recent File Activity"
      projects={PROJECTS_OVERVIEW_DATA.slice(0, 3)}
      projectsTitle="Your Projects"
      showActions={false}
    />
  );
}
