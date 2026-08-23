"use client";

import { TEAM_MEMBERS } from "@/lib/projects/mock-projects";

export function AvatarStack({ teamIds, max = 4 }: { teamIds: number[]; max?: number }) {
  const shown = teamIds.slice(0, max);
  const extra = teamIds.length - max;

  return (
    <div className="flex items-center">
      {shown.map((id, i) => {
        const member = TEAM_MEMBERS.find((t) => t.id === id);
        if (!member) return null;
        return (
          <div
            key={id}
            title={member.name}
            className="relative flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
            style={{
              background: member.color,
              marginLeft: i === 0 ? 0 : -8,
              zIndex: shown.length - i,
            }}
          >
            {member.initials}
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
