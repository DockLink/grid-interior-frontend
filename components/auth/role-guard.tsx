"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/users";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const session = useAuthStore((state) => state.session);
  const user = session?.user;

  if (!user) {
    return null; // Not logged in
  }

  // Check if user has any of the allowed roles
  const hasAccess = allowedRoles.some((role) => user.roles.includes(role));

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
