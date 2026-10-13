"use client";

import { useAuthStore } from "@/stores/auth-store";

/**
 * Checks if the currently logged in user has access to a specific project based on their role and assignments.
 */
export function useProjectAccess(projectId: string) {
  const session = useAuthStore((state) => state.session);
  const user = session?.user;

  if (!user) return false;

  // Super Admin has full access to everything
  if (user.roles.includes("SUPER_ADMIN")) {
    return true;
  }

  // Social Media Admin has no access to projects/BOQ
  if (user.roles.includes("SOCIAL_MEDIA_ADMIN")) {
    return false;
  }

  // For Designer and Project Coordinator, check project assignment
  const isAssigned =
    user.assignedProjects?.some((p) => p.projectId === projectId) ?? false;
    
  return isAssigned;
}
