"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { cn } from "@/lib/utils";

import { SectionCard, SectionTitle } from "./workspace-ui";

function addWorkingDays(iso: string, days: number): string {
  const base = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(base.getTime())) return iso;
  base.setDate(base.getDate() + Math.max(0, Math.round(days)));
  return base.toISOString().slice(0, 10);
}

function formatLabel(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TimelineWidget({
  phase,
  projectId,
  initialDays = "10",
  startDate = "28 Jul 2026",
  startDateIso = "2026-07-28",
  badgeVariant = "amber",
  onDaysChange,
}: {
  phase: string;
  projectId?: string;
  initialDays?: string;
  startDate?: string;
  startDateIso?: string;
  badgeVariant?: "amber" | "teal";
  onDaysChange?: (days: string) => void;
}) {
  const authDisabled = isAuthDisabled();
  const { tasks: stages, updateTaskableDates } = useProjectTaskables(
    projectId ?? "",
    "STAGE",
    { limit: 100 },
  );

  const matchedStage = useMemo(() => {
    if (!projectId || authDisabled) return null;
    const needle = phase.trim().toLowerCase();
    return (
      stages.find((s) => (s.title ?? "").trim().toLowerCase() === needle) ??
      stages.find((s) => (s.title ?? "").toLowerCase().includes(needle)) ??
      null
    );
  }, [projectId, authDisabled, stages, phase]);

  const liveStartIso = matchedStage?.start_date?.slice(0, 10) ?? startDateIso;
  const liveEndIso = matchedStage?.end_date?.slice(0, 10);
  const liveDays = useMemo(() => {
    if (!liveEndIso) return initialDays;
    const start = new Date(`${liveStartIso}T00:00:00`).getTime();
    const end = new Date(`${liveEndIso}T00:00:00`).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return initialDays;
    return String(Math.max(1, Math.round((end - start) / 86400000)));
  }, [liveStartIso, liveEndIso, initialDays]);

  const [days, setDays] = useState(liveDays);
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDays(liveDays);
  }, [liveDays]);

  const displayStart = matchedStage
    ? formatLabel(liveStartIso)
    : startDate;

  const calcDeadline = () => {
    const d = parseInt(days, 10) || 0;
    return formatLabel(addWorkingDays(liveStartIso, Math.round(d * 1.4)));
  };

  const badgeStyle =
    badgeVariant === "teal"
      ? { color: "var(--figma-teal)", background: "rgba(14,124,134,0.10)" }
      : { color: "#D97706", background: "#FEF3C7" };

  async function persistDays(nextDays: string) {
    onDaysChange?.(nextDays);
    if (!matchedStage?.id || authDisabled) return;
    const duration = parseInt(nextDays, 10) || 0;
    if (duration < 1) return;
    setSaving(true);
    try {
      const end = addWorkingDays(liveStartIso, duration);
      await updateTaskableDates(matchedStage.id, liveStartIso, end);
      toast.success(`${phase} timeline updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update timeline");
    } finally {
      setSaving(false);
    }
  }

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
              onBlur={() => {
                setFocused(false);
                void persistDays(days);
              }}
              min={1}
              className={cn(
                "w-[60px] rounded-[9px] bg-white px-2.5 py-2 text-center text-sm font-bold text-[var(--figma-navy)] outline-none transition-all duration-150",
                focused
                  ? "border-2 border-[var(--figma-teal)] hub-input-focus"
                  : "border-[1.5px] border-[var(--figma-border)] neu-inset",
              )}
            />
            <span className="text-xs text-[var(--figma-gray500)]">
              {saving ? "saving…" : "working days"}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-[var(--figma-gray500)]">
            Start date
          </label>
          <div className="flex items-center gap-1.5">
            <MaterialIcon name="event" outlined size={15} className="text-[var(--figma-gray400)]" />
            <span className="text-[13px] font-medium text-[var(--figma-navy)]">{displayStart}</span>
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
