"use client";

import { useState } from "react";

import { MaterialIcon } from "./material-icon";

export function StatTile({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="min-w-[140px] flex-1 rounded-[14px] bg-white px-5 py-[18px] transition-all duration-200"
      style={{ boxShadow: hover ? "var(--neu-card-hover)" : "var(--neu-card)" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="mb-2.5 flex items-start justify-between">
        <div
          className="flex size-9 items-center justify-center rounded-[10px]"
          style={{ background: `${color}15` }}
        >
          <MaterialIcon name={icon} outlined size={20} style={{ color }} />
        </div>
      </div>
      <div className="mb-0.5 text-[22px] font-bold text-[var(--figma-navy)]">{value}</div>
      <div className="text-xs text-[var(--figma-gray500)]">{label}</div>
      {sub && (
        <div className="mt-0.5 text-[11px] font-medium" style={{ color }}>
          {sub}
        </div>
      )}
    </div>
  );
}
