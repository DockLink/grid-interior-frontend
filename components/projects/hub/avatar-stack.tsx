"use client";

import { getUserInitials, getUserListPrimaryLabel } from "@/lib/user/display";
import type { ProjectMember } from "@/types/projects";

const MEMBER_COLORS = ["#0E7C86", "#7C3AED", "#0891B2", "#D97706", "#1B2A4A", "#BE185D"];

function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i)) % MEMBER_COLORS.length;
  }
  return MEMBER_COLORS[hash] ?? MEMBER_COLORS[0];
}

function memberDisplay(member: ProjectMember) {
  const user = member.assignee;
  if (!user) {
    return { initials: "?", name: "Member", color: MEMBER_COLORS[0] };
  }
  return {
    initials: getUserInitials({ ...user, email: user.email ?? "" }),
    name: getUserListPrimaryLabel({ ...user, email: user.email ?? "" }),
    color: colorForUser(member.user_id),
  };
}

export function AvatarStack({
  members,
  max = 4,
}: {
  members?: ProjectMember[];
  max?: number;
}) {
  const active = (members ?? []).filter((m) => m.status === "ACTIVE");
  const shown = active.slice(0, max);
  const extra = active.length - max;

  if (shown.length === 0) return null;

  return (
    <div className="flex items-center">
      {shown.map((member, i) => {
        const display = memberDisplay(member);
        return (
          <div
            key={member.user_id}
            title={display.name}
            className="relative flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
            style={{
              background: display.color,
              marginLeft: i === 0 ? 0 : -8,
              zIndex: shown.length - i,
            }}
          >
            {display.initials}
          </div>
        );
      })}
      {extra > 0 && (
        <div
          className="relative flex size-7 items-center justify-center rounded-full border-2 border-white bg-[var(--figma-gray200)] text-[10px] font-bold text-[var(--figma-gray500)]"
          style={{ marginLeft: -8 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
