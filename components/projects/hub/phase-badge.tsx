"use client";

import { PHASE_CFG, type ProjectPhase } from "@/lib/projects/design-tokens";

import { MaterialIcon } from "./material-icon";

export function PhaseBadge({ phase }: { phase: ProjectPhase }) {
  const cfg = PHASE_CFG[phase];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[20px] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <MaterialIcon name={cfg.icon} outlined size={12} />
      {cfg.short}
    </span>
  );
}
