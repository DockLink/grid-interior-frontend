"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  addWorkingDays,
  calendarDateFromApi,
  parseCalendarDate,
  workingDaysBetween,
} from "@/lib/projects/calendar-date";
import { cn } from "@/lib/utils";

import { SectionCard, SectionTitle } from "./workspace-ui";

function formatLabel(iso: string): string {
  const d = parseCalendarDate(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function findStage(
  stages: { title?: string | null; id: string; start_date: string; end_date?: string | null }[],
  name: string,
) {
  const needle = name.trim().toLowerCase();
  if (!needle) return null;
  return (
    stages.find((s) => (s.title ?? "").trim().toLowerCase() === needle) ??
    stages.find((s) => (s.title ?? "").toLowerCase().includes(needle)) ??
    null
  );
}

export function TimelineWidget({
  phase,
  projectId,
  initialDays = "10",
  startDate,
  startDateIso,
  badgeVariant = "amber",
  onDaysChange,
  mode = "stage",
  anchorPhase,
}: {
  phase: string;
  projectId?: string;
  initialDays?: string;
  startDate?: string;
  startDateIso?: string;
  badgeVariant?: "amber" | "teal";
  onDaysChange?: (days: string) => void;
  /** "stage" reads and writes the matching phase. "duration" only edits a caller-owned day count. */
  mode?: "stage" | "duration";
  /** Stage used as the start-date anchor when mode is "duration". */
  anchorPhase?: string;
}) {
  const authDisabled = isAuthDisabled();
  const { tasks: stages, updateTaskableDates } = useProjectTaskables(
    projectId ?? "",
    "STAGE",
    { limit: 100 },
  );

  const matchedStage = useMemo(() => {
    if (!projectId || authDisabled || mode !== "stage") return null;
    return findStage(stages, phase);
  }, [projectId, authDisabled, stages, phase, mode]);

  const anchorStage = useMemo(() => {
    if (!projectId || authDisabled || mode !== "duration" || !anchorPhase) return null;
    return findStage(stages, anchorPhase);
  }, [projectId, authDisabled, stages, mode, anchorPhase]);

  const liveStartIso =
    mode === "duration"
      ? anchorStage?.start_date
        ? calendarDateFromApi(anchorStage.start_date)
        : ""
      : matchedStage?.start_date
        ? calendarDateFromApi(matchedStage.start_date)
        : startDateIso
          ? calendarDateFromApi(startDateIso)
          : "";

  const liveEndIso =
    mode === "stage" && matchedStage?.end_date
      ? calendarDateFromApi(matchedStage.end_date)
      : "";

  const liveDays = useMemo(() => {
    if (mode === "duration") return initialDays;
    if (!liveStartIso || !liveEndIso) return initialDays;
    return String(workingDaysBetween(liveStartIso, liveEndIso));
  }, [mode, liveStartIso, liveEndIso, initialDays]);

  const [draftDays, setDraftDays] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const days = draftDays ?? liveDays;

  const displayStart = liveStartIso
    ? formatLabel(liveStartIso)
    : startDate || "—";

  const typedDays = parseInt(days, 10);
  const daysEdited = days !== liveDays;
  const deadlineIso =
    daysEdited && liveStartIso && Number.isFinite(typedDays) && typedDays >= 1
      ? addWorkingDays(liveStartIso, typedDays)
      : liveEndIso;
  const displayDeadline =
    mode === "duration"
      ? liveStartIso && Number.isFinite(typedDays) && typedDays >= 1
        ? formatLabel(addWorkingDays(liveStartIso, typedDays))
        : "—"
      : deadlineIso
        ? formatLabel(deadlineIso)
        : "—";

  const badgeStyle =
    badgeVariant === "teal"
      ? { color: "var(--figma-teal)", background: "rgba(14,124,134,0.10)" }
      : { color: "#D97706", background: "#FEF3C7" };

  async function persistDays(nextDays: string) {
    const duration = parseInt(nextDays, 10);
    if (mode === "duration") {
      if (Number.isFinite(duration) && duration >= 0) onDaysChange?.(nextDays);
      setDraftDays(null);
      return;
    }
    if (!Number.isFinite(duration) || duration < 1 || !liveStartIso) {
      setDraftDays(null);
      return;
    }
    onDaysChange?.(nextDays);
    if (!matchedStage?.id || authDisabled) return;
    setSaving(true);
    try {
      const end = addWorkingDays(liveStartIso, duration);
      await updateTaskableDates(matchedStage.id, liveStartIso, end);
      setDraftDays(null);
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
              onChange={(e) => setDraftDays(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                void persistDays(days);
              }}
              min={0}
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
            <span className="text-[13px] font-bold text-[var(--figma-teal)]">{displayDeadline}</span>
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
