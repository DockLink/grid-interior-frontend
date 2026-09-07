import { getUserInitials, getUserListPrimaryLabel, normalizeUserFields } from "@/lib/user/display";
import type { ProjectMember } from "@/types/projects";
import type { HubTeamMember } from "@/types/project-hub";

const MEMBER_COLORS = [
  "#0E7C86",
  "#7C3AED",
  "#D97706",
  "#1B2A4A",
  "#BE185D",
  "#0284C7",
  "#3FA66B",
  "#F26D6D",
];

export function mapProjectMembersToHubTeam(members: ProjectMember[]): HubTeamMember[] {
  return members
    .filter((m) => m.status === "ACTIVE")
    .map((m, index) => {
      const user = m.assignee;
      const normalized = normalizeUserFields({
        email: user?.email ?? "",
        first_name: user?.first_name,
        last_name: user?.last_name,
        firstName: user?.firstName,
        lastName: user?.lastName,
      });
      const name = user
        ? getUserListPrimaryLabel({ ...normalized, email: user.email ?? "" })
        : "Team Member";
      return {
        id: index + 1,
        name,
        role: m.role ?? "Member",
        initials: getUserInitials({ ...normalized, email: user?.email ?? "" }),
        color: MEMBER_COLORS[index % MEMBER_COLORS.length]!,
      };
    });
}

export function hubTeamByUserId(
  members: ProjectMember[],
): Map<string, HubTeamMember> {
  const hub = mapProjectMembersToHubTeam(members);
  const active = members.filter((m) => m.status === "ACTIVE");
  const map = new Map<string, HubTeamMember>();
  active.forEach((m, i) => {
    const team = hub[i];
    if (team) map.set(m.user_id, team);
  });
  return map;
}
