const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Local calendar day as YYYY-MM-DD. Never uses UTC conversion. */
export function toCalendarDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calendar day for an API value.
 * Date-only strings are kept as-is. Timestamps use the local calendar day.
 */
export function calendarDateFromApi(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  const dateOnly = DATE_ONLY.exec(trimmed.slice(0, 10));
  if (dateOnly && trimmed.length === 10) return trimmed.slice(0, 10);
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";
  return toCalendarDateIso(parsed);
}

/** Local midnight for a calendar day. */
export function parseCalendarDate(value: string): Date {
  const day = calendarDateFromApi(value);
  const match = DATE_ONLY.exec(day);
  if (!match) return new Date(Number.NaN);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Weekdays strictly after `startIso`, up to and including `endIso`. */
export function workingDaysBetween(startIso: string, endIso: string): number {
  const start = parseCalendarDate(startIso);
  const end = parseCalendarDate(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

/** Move forward by working days. Zero days returns the start day unchanged. */
export function addWorkingDays(iso: string, days: number): string {
  const base = parseCalendarDate(iso);
  if (Number.isNaN(base.getTime())) return calendarDateFromApi(iso);
  let remaining = Math.max(0, Math.round(days));
  if (remaining === 0) return toCalendarDateIso(base);
  while (remaining > 0) {
    base.setDate(base.getDate() + 1);
    const day = base.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return toCalendarDateIso(base);
}
