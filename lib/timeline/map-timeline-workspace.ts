import { calendarDateFromApi, parseCalendarDate, toCalendarDateIso } from "@/lib/projects/calendar-date";
import { resolveProjectEndDate } from "@/lib/projects/duration";
import { mapMilestoneToView, mapStageToView } from "@/lib/projects/map-stages";
import { STAGE_CHART_COLORS, deriveTimelineStatus } from "@/lib/projects/timeline";
import type { GanttPhase, Milestone } from "@/lib/timeline/mock-timeline";
import type { Project } from "@/types/projects";
import type { Task, TaskableStatus } from "@/types/tasks";

export interface TimelineLead {
  initials: string;
  color: string;
  name: string;
}

export interface TimelineWorkspaceView {
  phases: GanttPhase[];
  milestones: Milestone[];
  projectStartIso: string;
  projectEndIso: string;
  projectStartLabel: string;
  projectEndLabel: string;
  totalWeeks: number;
  currentWeek: number;
}

const DEFAULT_LEAD: TimelineLead = {
  initials: "—",
  color: "#9CA3AF",
  name: "Unassigned",
};

const PHASE_BG: Record<string, string> = {
  "#D4A96A": "rgba(212,169,106,0.12)",
  "#9B8FA8": "rgba(155,143,168,0.12)",
  "#5A8A7A": "rgba(90,138,122,0.12)",
  "#7A9E6A": "rgba(122,158,106,0.12)",
  "#6B8CAE": "rgba(107,140,174,0.12)",
  "#B87A6A": "rgba(184,122,106,0.12)",
};

function toDateOnly(iso: string): string {
  return calendarDateFromApi(iso);
}

function parseDay(iso: string): number {
  return parseCalendarDate(iso).getTime();
}

function daysBetween(startIso: string, endIso: string): number {
  return Math.round((parseDay(endIso) - parseDay(startIso)) / 86400000);
}

function weeksBetween(startIso: string, endIso: string): number {
  return Math.max(1, Math.ceil(daysBetween(startIso, endIso) / 7));
}

function weekOffset(projectStartIso: string, dateIso: string): number {
  const days = daysBetween(projectStartIso, dateIso);
  return Math.max(0, Math.floor(days / 7));
}

function formatLabel(iso: string): string {
  const d = parseCalendarDate(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function phaseStatusFromApi(
  startDate: string,
  endDate: string,
  apiStatus: TaskableStatus,
  now = new Date(),
): GanttPhase["status"] {
  if (apiStatus === "COMPLETED") return "completed";
  const end = calendarDateFromApi(endDate);
  const start = calendarDateFromApi(startDate);
  const today = toCalendarDateIso(now);
  if (
    apiStatus === "IN_PROGRESS" ||
    apiStatus === "IN_REVIEW" ||
    apiStatus === "REOPENED" ||
    (start <= today && end >= today) ||
    (end !== "" && end < today)
  ) {
    return "active";
  }
  return "upcoming";
}

function progressFromStatus(apiStatus: TaskableStatus): number {
  if (apiStatus === "COMPLETED") return 100;
  if (apiStatus === "IN_PROGRESS" || apiStatus === "IN_REVIEW" || apiStatus === "REOPENED") {
    return 50;
  }
  return 0;
}

function hexToBg(color: string): string {
  return PHASE_BG[color] ?? `${color}1F`;
}

/** Convert week offsets back to ISO dates relative to project start. */
export function weeksToIsoRange(
  projectStartIso: string,
  startWeek: number,
  durationWeeks: number,
): { startDateIso: string; endDateIso: string } {
  const start = new Date(`${toDateOnly(projectStartIso)}T00:00:00`);
  start.setDate(start.getDate() + Math.max(0, startWeek) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(1, durationWeeks) * 7);
  return {
    startDateIso: toCalendarDateIso(start),
    endDateIso: toCalendarDateIso(end),
  };
}

export function mapTimelineWorkspace(
  project: Project | null,
  stageTasks: Task[],
  milestoneTasks: Task[],
  options: {
    lead?: TimelineLead | null;
    now?: Date;
  } = {},
): TimelineWorkspaceView {
  const now = options.now ?? new Date();
  const lead = options.lead ?? DEFAULT_LEAD;

  const stages = [...stageTasks]
    .map((t) => mapStageToView(t, now))
    .sort((a, b) => a.order - b.order);

  const stageById = Object.fromEntries(stages.map((s) => [s.id, s]));
  const scheduledStages = stages.filter((s) => s.scheduled);

  const earliestStage = scheduledStages[0];
  const latestStageEnd = scheduledStages.reduce(
    (max, s) => (parseDay(s.endDate) > parseDay(max) ? s.endDate : max),
    earliestStage?.endDate ?? "",
  );

  const candidateStarts = [
    project?.start_date,
    ...scheduledStages.map((s) => s.startDate),
    ...milestoneTasks.map((m) => m.start_date),
  ].filter((d): d is string => !!d);

  const earliestStart = candidateStarts.length
    ? candidateStarts.reduce((min, d) => (parseDay(d) < parseDay(min) ? d : min))
    : toCalendarDateIso(now);

  const projectStartIso = toDateOnly(earliestStart);

  const latestMilestoneEnd = milestoneTasks.reduce((max, m) => {
    const d = m.end_date || m.start_date;
    return d && parseDay(d) > parseDay(max) ? d : max;
  }, "");

  const candidateEnds = [
    project ? resolveProjectEndDate(project) : null,
    latestStageEnd,
    latestMilestoneEnd,
  ].filter((d): d is string => !!d);

  const latestEnd = candidateEnds.length
    ? candidateEnds.reduce((max, d) => (parseDay(d) > parseDay(max) ? d : max))
    : null;

  const projectEndIso = toDateOnly(
    latestEnd ??
      (() => {
        const d = new Date(`${projectStartIso}T00:00:00`);
        d.setFullYear(d.getFullYear() + 1);
        return toCalendarDateIso(d);
      })(),
  );

  const totalWeeks = weeksBetween(projectStartIso, projectEndIso);
  const currentWeek = Math.min(
    totalWeeks,
    Math.max(0, weekOffset(projectStartIso, toCalendarDateIso(now))),
  );

  const phases: GanttPhase[] = stages.map((stage, index) => {
    const color = STAGE_CHART_COLORS[index % STAGE_CHART_COLORS.length]!;
    const linkedMilestone = milestoneTasks.find(
      (m) => m.parentTaskableId === stage.id,
    );
    const scheduled = stage.scheduled;
    const startWeek = scheduled ? weekOffset(projectStartIso, stage.startDate) : 0;
    const endWeek = scheduled
      ? Math.max(startWeek + 1, weekOffset(projectStartIso, stage.endDate))
      : startWeek + 1;
    const durationWeeks = Math.max(1, endWeek - startWeek);

    return {
      id: index + 1,
      stageId: stage.id,
      name: stage.name,
      color,
      bg: hexToBg(color),
      startWeek,
      durationWeeks,
      startDate: scheduled ? toDateOnly(stage.startDate) : "",
      endDate: scheduled ? toDateOnly(stage.endDate) : "",
      scheduled,
      progress: progressFromStatus(stage.status),
      milestone: linkedMilestone?.title,
      status: phaseStatusFromApi(stage.startDate, stage.endDate, stage.status, now),
      lead,
    };
  });

  const milestones: Milestone[] = [...milestoneTasks]
    .sort((a, b) => parseDay(a.start_date) - parseDay(b.start_date))
    .map((raw, index) => {
      const view = mapMilestoneToView(raw);
      const parentStage = raw.parentTaskableId
        ? stageById[raw.parentTaskableId]
        : undefined;
      const status = deriveTimelineStatus(view.startDate, view.endDate, view.status, now);
      const milestoneStatus: Milestone["status"] =
        status === "completed"
          ? "completed"
          : status === "overdue"
            ? "overdue"
            : "upcoming";

      return {
        id: index + 1,
        milestoneId: raw.id,
        name: view.name,
        date: formatLabel(view.endDate || view.startDate),
        status: milestoneStatus,
        phase: parentStage?.name ?? "Unassigned",
        notes: view.description,
      };
    });

  return {
    phases,
    milestones,
    projectStartIso,
    projectEndIso,
    projectStartLabel: formatLabel(projectStartIso),
    projectEndLabel: formatLabel(projectEndIso),
    totalWeeks,
    currentWeek,
  };
}
