import {
  calendarDateFromApi,
  parseCalendarDate,
  toCalendarDateIso,
} from "@/lib/projects/calendar-date";
import { PHASES, type ProjectPhase } from "@/lib/projects/design-tokens";
import type { CreateProjectStageInput } from "@/types/projects";
import type { ExecutionStageStatus } from "@/types/execution";
import type { Task, TaskableStatus } from "@/types/tasks";

function toDay(iso: string): Date {
  return parseCalendarDate(iso);
}

function stageStatusForOrder(
  order: number,
  startIndex: number,
): TaskableStatus | undefined {
  if (order < startIndex) return "COMPLETED";
  if (order === startIndex) return "IN_PROGRESS";
  return undefined;
}

/** Split project range evenly across the 6 design PHASES for create payload. */
export function buildSeededPhaseStages(
  startDate: string,
  endDate: string,
  phases: readonly ProjectPhase[] = PHASES,
  startPhase: ProjectPhase = "Consultation",
): CreateProjectStageInput[] {
  const startIndex = Math.max(0, phases.indexOf(startPhase));
  const start = toDay(startDate);
  const end = toDay(endDate);
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    const startDay = calendarDateFromApi(startDate);
    const endDay = calendarDateFromApi(endDate);
    return phases.map((name, order) => ({
      name,
      start_date: startDay,
      end_date: endDay,
      order,
      status: stageStatusForOrder(order, startIndex),
    }));
  }

  const totalDays = Math.max(phases.length, Math.round((endMs - startMs) / 86400000));
  const slice = Math.max(1, Math.floor(totalDays / phases.length));

  return phases.map((name, order) => {
    const status = stageStatusForOrder(order, startIndex);
    const sliceStart = new Date(start);
    sliceStart.setDate(start.getDate() + order * slice);
    if (sliceStart.getTime() > endMs) sliceStart.setTime(endMs);
    if (order === phases.length - 1) {
      return {
        name,
        start_date: toCalendarDateIso(sliceStart),
        end_date: calendarDateFromApi(endDate),
        order,
        status,
      };
    }
    const sliceEnd = new Date(sliceStart);
    sliceEnd.setDate(sliceStart.getDate() + slice - 1);
    if (sliceEnd.getTime() > endMs) sliceEnd.setTime(endMs);
    if (sliceEnd.getTime() < sliceStart.getTime()) sliceEnd.setTime(sliceStart.getTime());
    return {
      name,
      start_date: toCalendarDateIso(sliceStart),
      end_date: toCalendarDateIso(sliceEnd),
      order,
      status,
    };
  });
}

export type PhaseDateRange = { start: string; end: string };

/** Even split used to prefill the create form. User edits are sent as-is. */
export function defaultPhaseRanges(
  startDate: string,
  endDate: string,
  phases: readonly ProjectPhase[] = PHASES,
): Record<ProjectPhase, PhaseDateRange> {
  const stages = buildSeededPhaseStages(startDate, endDate, phases);
  const ranges = {} as Record<ProjectPhase, PhaseDateRange>;
  for (const stage of stages) {
    ranges[stage.name as ProjectPhase] = {
      start: stage.start_date ?? calendarDateFromApi(startDate),
      end: stage.end_date ?? calendarDateFromApi(endDate),
    };
  }
  return ranges;
}

export function emptyPhaseRanges(
  phases: readonly ProjectPhase[] = PHASES,
): Record<ProjectPhase, PhaseDateRange> {
  const ranges = {} as Record<ProjectPhase, PhaseDateRange>;
  for (const name of phases) ranges[name] = { start: "", end: "" };
  return ranges;
}

/** Latest phase end the user entered, or null when every end was left blank. */
export function latestPhaseEnd(
  ranges: Record<ProjectPhase, PhaseDateRange>,
  phases: readonly ProjectPhase[] = PHASES,
): string | null {
  let latest = "";
  for (const name of phases) {
    const end = ranges[name]?.end ?? "";
    if (end && end > latest) latest = end;
  }
  return latest || null;
}

export function stagesFromUserRanges(
  ranges: Record<ProjectPhase, PhaseDateRange>,
  startPhase: ProjectPhase,
  phases: readonly ProjectPhase[] = PHASES,
): CreateProjectStageInput[] {
  const startIndex = Math.max(0, phases.indexOf(startPhase));
  return phases.map((name, order) => {
    const range = ranges[name];
    return {
      name,
      ...(range?.start ? { start_date: range.start } : {}),
      ...(range?.end ? { end_date: range.end } : {}),
      order,
      status: stageStatusForOrder(order, startIndex),
    };
  });
}

/**
 * Checks only the phase dates the user entered.
 * A blank phase is allowed. An end date requires a start, and a later phase
 * cannot start before an earlier phase's end.
 */
export function validatePhaseSchedule(
  ranges: Record<ProjectPhase, PhaseDateRange>,
  phases: readonly ProjectPhase[] = PHASES,
): string | null {
  let lastEnd = "";
  let lastEndedPhase = "";
  for (const name of phases) {
    const start = ranges[name]?.start ?? "";
    const end = ranges[name]?.end ?? "";
    if (!start && !end) continue;
    if (end && !start) return `${name} needs a start date when an end date is set`;
    if (start && end && end < start) {
      return `${name} end date must be on or after its start date`;
    }
    if (start && lastEnd && start < lastEnd) {
      return `${name} must start on or after ${lastEndedPhase} ends`;
    }
    if (end) {
      lastEnd = end;
      lastEndedPhase = name;
    }
  }
  return null;
}

export function mapTaskableStatusToStageStatus(
  status: TaskableStatus | undefined,
  startDate?: string | null,
  endDate?: string | null,
  now = new Date(),
): ExecutionStageStatus {
  if (status === "COMPLETED") return "complete";
  if (status === "INACTIVE" || status === "ON_HOLD") return "upcoming";
  const start = startDate ? toDay(startDate) : null;
  const end = endDate ? toDay(endDate) : null;
  if (start && !Number.isNaN(start.getTime()) && now < start) return "upcoming";
  if (end && !Number.isNaN(end.getTime()) && now > end) return "in-progress";
  if (start && end && now >= start && now <= end) return "in-progress";
  if (status === "IN_PROGRESS" || status === "ACTIVE" || status === "IN_REVIEW" || status === "REOPENED") {
    return "in-progress";
  }
  return "upcoming";
}

export function findStageTaskable(tasks: Task[], phaseName: string): Task | undefined {
  const needle = phaseName.trim().toLowerCase();
  return (
    tasks.find((t) => (t.title ?? "").trim().toLowerCase() === needle) ??
    tasks.find((t) => (t.title ?? "").toLowerCase().includes(needle))
  );
}
