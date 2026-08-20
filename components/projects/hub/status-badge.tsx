"use client";

import { STATUS_CFG, type ProjectHealthStatus } from "@/lib/projects/design-tokens";

import { MaterialIcon } from "./material-icon";

export function StatusBadge({ status }: { status: ProjectHealthStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[20px] px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <MaterialIcon name={cfg.icon} size={12} />
      {status}
    </span>
  );
}
