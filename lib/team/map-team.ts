import type { StudioMember, StudioMemberRole } from "@/lib/team/mock-team";
import {
  getUserInitials,
  getUserListPrimaryLabel,
} from "@/lib/user/display";
import type { User, UserRole } from "@/types/users";

const MEMBER_COLORS = [
  "#0B2545",
  "#0FA8A0",
  "#2FBE6B",
  "#F59E0B",
  "#7C6CF0",
  "#FF6B6B",
  "#0E7C86",
  "#7C3AED",
  "#0891B2",
  "#D97706",
  "#BE185D",
];

const EXCLUDED_ROLES: UserRole[] = ["GUEST", "CLIENT_FULL_ACCESS"];

export function memberColorFromId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i)) % MEMBER_COLORS.length;
  }
  return MEMBER_COLORS[hash] ?? MEMBER_COLORS[0];
}

export function mapUserRoleToStudioRole(roles: UserRole[]): StudioMemberRole {
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) return "Admin";
  if (roles.includes("TEAM_LEAD")) return "Project Coordinator";
  return "Designer";
}

export function studioRoleToUserRole(role: StudioMemberRole): UserRole {
  if (role === "Admin") return "ADMIN";
  if (role === "Team Lead" || role === "Project Coordinator") return "TEAM_LEAD";
  return "MEMBER";
}

export function isStudioDirectoryUser(user: User): boolean {
  return !user.roles.some((r) => EXCLUDED_ROLES.includes(r));
}

export function mapUserToStudioMember(user: User): StudioMember {
  const role = mapUserRoleToStudioRole(user.roles);
  return {
    id: user.id,
    name: getUserListPrimaryLabel(user),
    email: user.email,
    role,
    initials: getUserInitials(user),
    color: memberColorFromId(user.id),
    title: role,
    projects: 0,
    openTasks: 0,
    status: user.status === "ACTIVE" ? "active" : "away",
  };
}

export function mapUsersToStudioMembers(users: User[]): StudioMember[] {
  return users.filter(isStudioDirectoryUser).map(mapUserToStudioMember);
}
