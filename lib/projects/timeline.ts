import { calendarDateFromApi, parseCalendarDate, toCalendarDateIso } from "@/lib/projects/calendar-date";
import { resolveProjectEndDate } from "@/lib/projects/duration";
import type { ProjectMilestoneView, ProjectStageView } from "@/lib/projects/map-stages";
import type { Task, TaskableStatus } from "@/types/tasks";
import type { Project } from "@/types/projects";

export type TimelineItemStatus = "completed" | "active" | "upcoming" | "overdue";

export interface TimelineTaskItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TimelineItemStatus;
  apiStatus: TaskableStatus;
}

export interface TimelineMilestoneItem {
  id: string;
  title: string;
  description?: string;
  stageId: string;
  stageName: string;
  startDate: string;
  endDate: string;
  status: TimelineItemStatus;
  apiStatus: TaskableStatus;
  tasks?: TimelineTaskItem[];
}

export interface TimelineStageGroup {
  id: string;
  name: string;
  order: number;
  color: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  milestones: TimelineMilestoneItem[];
  /** Tasks attached directly to the stage (no milestone). */
  orphanTasks?: TimelineTaskItem[];
}

export const STAGE_CHART_COLORS = [
  "#D4A96A",
  "#9B8FA8",
  "#5A8A7A",
  "#7A9E6A",
  "#6B8CAE",
  "#B87A6A",
] as const;

export const PX_PER_DAY = 4;
export const GANTT_LEFT_COL = 220;

export function stageColor(index: number): string {
  return STAGE_CHART_COLORS[index % STAGE_CHART_COLORS.length];
}

export function toDateOnlyIso(date: Date): string {
  return toCalendarDateIso(date);
}

export function isoDurationBetween(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
  return `P${days}D`;
}

export function formatTimelineDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function deriveTimelineStatus(
  startDate: string,
  endDate: string,
  apiStatus: TaskableStatus,
  now = new Date()
): TimelineItemStatus {
  if (apiStatus === "COMPLETED") return "completed";
  const end = calendarDateFromApi(endDate);
  const start = calendarDateFromApi(startDate);
  const today = toCalendarDateIso(now);
  if (!end || !start) return "upcoming";
  if (end < today) return "overdue";
  if (start <= today && end >= today) return "active";
  return "upcoming";
}

export function daysRemainingLabel(
  endDate: string,
  status: TimelineItemStatus,
  now = new Date()
): { text: string; color: string } {
  if (status === "completed") return { text: "Done", color: "#2D6A4F" };
  const end = parseCalendarDate(calendarDateFromApi(endDate));
  const today = parseCalendarDate(toCalendarDateIso(now));
  const diff = Math.round((end.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d late`, color: "#9B1C1C" };
  if (diff === 0) return { text: "Due today", color: "#7B5E0A" };
  return { text: `${diff}d`, color: "#9C8573" };
}

export function dayOffset(chartStart: string, dateStr: string): number {
  const start = parseCalendarDate(chartStart).getTime();
  const target = parseCalendarDate(dateStr).getTime();
  return Math.round((target - start) / 86400000);
}

export function computeChartBounds(
  project: Project | null,
  stages: ProjectStageView[],
  milestones: ProjectMilestoneView[]
): { chartStart: string; chartEnd: string; today: string } {
  const dates: number[] = [];
  const now = new Date();

  const pushDay = (value: string | null | undefined) => {
    if (!value) return;
    const ms = parseCalendarDate(value).getTime();
    if (!Number.isNaN(ms)) dates.push(ms);
  };

  pushDay(project?.start_date);
  pushDay(project ? resolveProjectEndDate(project) : null);

  for (const s of stages) {
    pushDay(s.startDate);
    pushDay(s.endDate);
  }
  for (const m of milestones) {
    pushDay(m.startDate);
    pushDay(m.endDate);
  }

  if (dates.length === 0) {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(now);
    end.setMonth(end.getMonth() + 3);
    return {
      chartStart: toDateOnlyIso(start),
      chartEnd: toDateOnlyIso(end),
      today: toDateOnlyIso(now),
    };
  }

  const min = Math.min(...dates);
  const max = Math.max(...dates, now.getTime());
  const padStart = new Date(min);
  padStart.setDate(padStart.getDate() - 7);
  const padEnd = new Date(max);
  padEnd.setDate(padEnd.getDate() + 14);

  return {
    chartStart: toDateOnlyIso(padStart),
    chartEnd: toDateOnlyIso(padEnd),
    today: toDateOnlyIso(now),
  };
}

export function buildMonthMarkers(chartStart: string, chartEnd: string) {
  const start = new Date(chartStart + "T00:00:00");
  const end = new Date(chartEnd + "T00:00:00");
  const markers: { label: string; date: string }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const iso = toDateOnlyIso(cursor);
    markers.push({
      date: iso,
      label: cursor.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return markers;
}

function earliestDay(dates: string[]): string {
  return dates.reduce((min, day) => (day < min ? day : min));
}

function latestDay(dates: string[]): string {
  return dates.reduce((max, day) => (day > max ? day : max));
}

export function mapTaskToTimelineItem(t: Task): TimelineTaskItem {
  const startIso = calendarDateFromApi(t.start_date);
  const endIso = calendarDateFromApi(t.end_date ?? t.start_date) || startIso;
  return {
    id: t.id,
    title: t.title,
    startDate: startIso,
    endDate: endIso,
    apiStatus: t.status,
    status: deriveTimelineStatus(startIso, endIso, t.status),
  };
}

export function buildTimelineGroups(
  stages: ProjectStageView[],
  milestones: ProjectMilestoneView[],
  milestoneStageMap: Record<string, { stageId: string; stageName: string }>,
  rawMilestones: Task[],
  milestoneTasksMap: Record<string, TimelineTaskItem[]> = {},
  stageOrphanTasksMap: Record<string, TimelineTaskItem[]> = {}
): TimelineStageGroup[] {
  const statusById = Object.fromEntries(rawMilestones.map((m) => [m.id, m.status]));
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  const groups: TimelineStageGroup[] = sortedStages.map((stage, index) => ({
    id: stage.id,
    name: stage.name,
    order: stage.order,
    color: stageColor(index),
    startDate: stage.startDate,
    endDate: stage.endDate,
    isActive: stage.isActive,
    milestones: [],
    orphanTasks: stageOrphanTasksMap[stage.id] ?? [],
  }));

  const groupById = Object.fromEntries(groups.map((g) => [g.id, g]));
  const unassigned: TimelineMilestoneItem[] = [];

  for (const m of milestones) {
    const parent = milestoneStageMap[m.id];
    const apiStatus = statusById[m.id] ?? "ACTIVE";
    const tasks = milestoneTasksMap[m.id] ?? [];

    // Span the milestone bar across its tasks so changes (e.g. a task whose
    // end date was extended by an approved hold request) move the parent bar.
    const startCandidates = [calendarDateFromApi(m.startDate), ...tasks.map((t) => calendarDateFromApi(t.startDate))].filter(Boolean);
    const endCandidates = [calendarDateFromApi(m.endDate), ...tasks.map((t) => calendarDateFromApi(t.endDate))].filter(Boolean);
    const startDate = startCandidates.length > 0 ? earliestDay(startCandidates) : "";
    const endDate = endCandidates.length > 0 ? latestDay(endCandidates) : startDate;

    const item: TimelineMilestoneItem = {
      id: m.id,
      title: m.name,
      description: m.description,
      stageId: parent?.stageId ?? "",
      stageName: parent?.stageName ?? "Unassigned",
      startDate,
      endDate,
      status: deriveTimelineStatus(startDate, endDate, apiStatus),
      apiStatus,
      tasks,
    };

    if (parent && groupById[parent.stageId]) {
      groupById[parent.stageId].milestones.push(item);
    } else {
      unassigned.push(item);
    }
  }

  for (const g of groups) {
    g.milestones.sort((a, b) => a.startDate.localeCompare(b.startDate));

    // Tasks attached directly to the stage (no milestone) are rendered as their
    // own rows under the stage — no synthetic "Tasks (no milestone)" parent.
    const orphans = (g.orphanTasks ?? [])
      .slice()
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    g.orphanTasks = orphans;

    // Roll the stage bar up across every child (milestones + their tasks + orphan
    // tasks) so it always reflects the true span, even after a hold extends a task.
    const childStarts = [
      calendarDateFromApi(g.startDate),
      ...g.milestones.map((m) => calendarDateFromApi(m.startDate)),
      ...orphans.map((t) => calendarDateFromApi(t.startDate)),
    ].filter(Boolean);
    const childEnds = [
      calendarDateFromApi(g.endDate),
      ...g.milestones.map((m) => calendarDateFromApi(m.endDate)),
      ...orphans.map((t) => calendarDateFromApi(t.endDate)),
    ].filter(Boolean);
    if (childStarts.length > 0) {
      g.startDate = earliestDay(childStarts);
      g.endDate = latestDay(childEnds);
    }
  }

  if (unassigned.length > 0) {
    groups.push({
      id: "__unassigned__",
      name: "Unassigned milestones",
      order: 9999,
      color: "#9C8573",
      startDate: unassigned[0].startDate,
      endDate: unassigned[unassigned.length - 1].endDate,
      isActive: false,
      milestones: unassigned,
    });
  }

  return groups.filter((g) => g.id !== "__unassigned__" || g.milestones.length > 0);
}
