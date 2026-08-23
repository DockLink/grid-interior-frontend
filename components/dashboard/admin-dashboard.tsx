"use client";

import { RoleDashboard } from "@/components/dashboard/studio/role-dashboard";
import {
  ADMIN_STATS,
  ATTENTION_DATA,
  PROJECTS_OVERVIEW_DATA,
} from "@/components/dashboard/studio/demo-data";

export function AdminDashboard() {
  return (
    <RoleDashboard
      stats={ADMIN_STATS}
      attention={ATTENTION_DATA}
      projects={PROJECTS_OVERVIEW_DATA}
      showActions
    />
  );
}
