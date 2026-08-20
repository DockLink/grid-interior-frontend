"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";

import { SectionCard, SectionTitle } from "./workspace-ui";

export function TimelineWidget({
  phase,
  initialDays = "10",
  startDate = "28 Jul 2026",
  startDateIso = "2026-07-28",
  badgeVariant = "amber",
}: {
  phase: string;
  initialDays?: string;
  startDate?: string;
  startDateIso?: string;
  badgeVariant?: "amber" | "teal";
}) {
  const [days, setDays] = useState(initialDays);
  const [focused, setFocused] = useState(false);

  const calcDeadline = () => {
    const d = parseInt(days, 10) || 0;
    const base = new Date(startDateIso);
    base.setDate(base.getDate() + Math.round(d * 1.4));
    return base.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const badgeStyle =
    badgeVariant === "teal"
      ? { color: "var(--figma-teal)", background: "rgba(14,124,134,0.10)" }
      : { color: "#D97706", background: "#FEF3C7" };

  return (
    <SectionCard className="px-5 py-[18px]">
      <SectionTitle icon="calendar_today" title="Timeline" />
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-[var(--figma-gray500)]">
            Duration
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              min={1}
              className={cn(
                "w-[60px] rounded-[9px] bg-white px-2.5 py-2 text-center text-sm font-bold text-[var(--figma-navy)] outline-none transition-all duration-150",
                focused
                  ? "border-2 border-[var(--figma-teal)] hub-input-focus"
                  : "border-[1.5px] border-[var(--figma-border)] neu-inset",
              )}
            />
            <span className="text-xs text-[var(--figma-gray500)]">working days</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-[var(--figma-gray500)]">
            Start date
          </label>
          <div className="flex items-center gap-1.5">
            <MaterialIcon name="event" outlined size={15} className="text-[var(--figma-gray400)]" />
            <span className="text-[13px] font-medium text-[var(--figma-navy)]">{startDate}</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-[var(--figma-gray500)]">
            Calculated deadline
          </label>
          <div className="flex items-center gap-[7px] rounded-[10px] border-[1.5px] border-[rgba(14,124,134,0.20)] bg-[rgba(14,124,134,0.07)] px-3.5 py-2">
            <MaterialIcon name="event_available" outlined size={15} className="text-[var(--figma-teal)]" />
            <span className="text-[13px] font-bold text-[var(--figma-teal)]">{calcDeadline()}</span>
          </div>
        </div>

        <div className="ml-auto">
          <span
            className="rounded-xl px-3 py-1 text-[11px] font-semibold"
            style={badgeStyle}
          >
            {phase} in progress
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
