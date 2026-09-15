import { PHASES, type ProjectPhase } from "@/lib/projects/design-tokens";
import type { CreateProjectStageInput } from "@/types/projects";
import type { ExecutionStageStatus } from "@/types/execution";
import type { Task, TaskableStatus } from "@/types/tasks";

function toDay(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00`);
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
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
    return phases.map((name, order) => ({
      name,
      start_date: startDate,
      end_date: endDate,
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
    const sliceEnd = new Date(sliceStart);
    if (order === phases.length - 1) {
      return {
        name,
        start_date: toIso(sliceStart),
        end_date: endDate,
        order,
        status,
      };
    }
    sliceEnd.setDate(sliceStart.getDate() + slice - 1);
    if (sliceEnd.getTime() > endMs) sliceEnd.setTime(endMs);
    return {
      name,
      start_date: toIso(sliceStart),
      end_date: toIso(sliceEnd),
      order,
      status,
    };
  });
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
