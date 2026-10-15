import { toCalendarDateIso } from "@/lib/projects/calendar-date";
import { addIsoDuration } from "@/lib/projects/duration";
import type { CreateTaskRequest } from "@/types/tasks";

type TaskDatePayload = Omit<CreateTaskRequest, "start_date"> & {
  start_date?: string;
  end_date?: string;
  duration?: string;
};

/**
 * Keep an explicit end date, or derive one from a duration.
 * A STAGE with neither is created without an end date.
 */
export function withTaskEndDate<T extends TaskDatePayload>(payload: T): T {
  const { duration, start_date, end_date, ...rest } = payload;
  const start = start_date || undefined;
  if (end_date) {
    return { ...rest, ...(start ? { start_date: start } : {}), end_date } as T;
  }
  if (duration && start) {
    const end = addIsoDuration(start, duration);
    return { ...rest, start_date: start, end_date: toCalendarDateIso(end) } as T;
  }
  if (rest.taskable_type === "STAGE") {
    return { ...rest, ...(start ? { start_date: start } : {}) } as T;
  }
  throw new Error("Task requires end_date or duration");
}
