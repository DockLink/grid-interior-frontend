"use client";

import { RoleDashboard } from "@/components/dashboard/studio/role-dashboard";
import {
  ATTENTION_DATA,
  PROJECTS_OVERVIEW_DATA,
  SUPER_ADMIN_STATS,
} from "@/components/dashboard/studio/demo-data";

export function SuperAdminDashboard() {
  return (
    <RoleDashboard
      stats={SUPER_ADMIN_STATS}
      attention={ATTENTION_DATA}
      projects={PROJECTS_OVERVIEW_DATA}
      attentionTitle="Needs Your Attention"
      projectsTitle="Projects Overview"
      showActions
    />
  );
}
