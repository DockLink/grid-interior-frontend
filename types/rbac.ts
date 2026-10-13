import type { UserRole } from "./users";

/** Higher index = higher privilege — used for primaryRole */
export const ROLE_PRIORITY: UserRole[] = [
  "CLIENT_FULL_ACCESS",
  "GUEST",
  "MEMBER",
  "SOCIAL_MEDIA_ADMIN",
  "DESIGNER",
  "PROJECT_COORDINATOR",
  "TEAM_LEAD",
  "ADMIN",
  "SUPER_ADMIN",
];

/** Future dashboard routes — not used yet */
export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  SUPER_ADMIN: "/dashboard/super-admin",
  ADMIN: "/dashboard/admin",
  TEAM_LEAD: "/dashboard/lead",
  MEMBER: "/dashboard/member",
  PROJECT_COORDINATOR: "/projects",
  DESIGNER: "/projects",
  SOCIAL_MEDIA_ADMIN: "/suppliers",
  GUEST: "/dashboard/guest",
  CLIENT_FULL_ACCESS: "/dashboard/guest",
};