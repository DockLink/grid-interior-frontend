"use client";

import { ForbiddenScreen } from "@/components/auth/forbidden-screen";
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
    return <ForbiddenScreen />;
  }

  const hasAccess = allowedRoles.some((role) => user.roles.includes(role));

  if (!hasAccess) {
    return <ForbiddenScreen />;
  }

  return <>{children}</>;
}
