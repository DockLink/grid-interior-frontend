import {
  deriveTimelineStatus,
  STAGE_CHART_COLORS,
  toDateOnlyIso,
  type TimelineStageGroup,
} from "@/lib/projects/timeline";
import type { ProjectTaskView } from "@/lib/tasks/task-board";

function dateOnly(value: string | undefined): string {
  if (!value) return toDateOnlyIso(new Date());
  return value.slice(0, 10);
}

export function tasksToGanttGroups(tasks: ProjectTaskView[]): TimelineStageGroup[] {
  const byStage = new Map<string, ProjectTaskView[]>();
  for (const task of tasks) {
    const key = task.stageName?.trim() || "Unstaged";
    const list = byStage.get(key) ?? [];
    list.push(task);
    byStage.set(key, list);
  }

  return Array.from(byStage.entries()).map(([name, list], index) => {
    const dates = list.flatMap((t) => [dateOnly(t.startDate), dateOnly(t.dueDate)]);
    const startDate = dates.reduce((min, d) => (d < min ? d : min), dates[0] ?? toDateOnlyIso(new Date()));
    const endDate = dates.reduce((max, d) => (d > max ? d : max), dates[0] ?? toDateOnlyIso(new Date()));
    return {
      id: `gantt-stage-${index}-${name}`,
      name,
      order: index,
      color: STAGE_CHART_COLORS[index % STAGE_CHART_COLORS.length],
      startDate,
      endDate,
      isActive: true,
      milestones: [],
      orphanTasks: list.map((t) => ({
        id: t.id,
        title: t.title,
        startDate: dateOnly(t.startDate),
        endDate: dateOnly(t.dueDate),
        status: deriveTimelineStatus(dateOnly(t.startDate), dateOnly(t.dueDate), t.apiStatus),
        apiStatus: t.apiStatus,
      })),
    };
  });
}

export function ganttBoundsFromTasks(tasks: ProjectTaskView[]) {
  const now = new Date();
  const dates = tasks.flatMap((t) => [
    new Date(dateOnly(t.startDate)).getTime(),
    new Date(dateOnly(t.dueDate)).getTime(),
  ]).filter((n) => !Number.isNaN(n));

  if (dates.length === 0) {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(now);
    end.setMonth(end.getMonth() + 2);
    return {
      chartStart: toDateOnlyIso(start),
      chartEnd: toDateOnlyIso(end),
      today: toDateOnlyIso(now),
    };
  }

  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates, now.getTime()));
  min.setDate(min.getDate() - 7);
  max.setDate(max.getDate() + 14);
  return {
    chartStart: toDateOnlyIso(min),
    chartEnd: toDateOnlyIso(max),
    today: toDateOnlyIso(now),
  };
}
