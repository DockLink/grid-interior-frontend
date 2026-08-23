"use client";

import { RoleDashboard } from "@/components/dashboard/studio/role-dashboard";
import {
  MEMBER_ATTENTION_DATA,
  MEMBER_STATS,
  PROJECTS_OVERVIEW_DATA,
} from "@/components/dashboard/studio/demo-data";

export function MemberDashboard() {
  return (
    <RoleDashboard
      stats={MEMBER_STATS}
      attention={MEMBER_ATTENTION_DATA}
      attentionTitle="My Focus"
      activityTitle="Recent File Activity"
      projects={PROJECTS_OVERVIEW_DATA.slice(0, 3)}
      projectsTitle="Assigned Projects"
      showActions={false}
    />
  );
}
