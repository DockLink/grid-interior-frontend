import type { TaskableHoldRequestStatus } from "@/types/hold-requests";

const STATUS_LABEL: Record<TaskableHoldRequestStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  APPROVED_MODIFIED: "Approved (modified)",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const STATUS_STYLE: Record<TaskableHoldRequestStatus, { bg: string; color: string }> = {
  PENDING: { bg: "rgba(212,169,106,0.14)", color: "#C9894A" },
  APPROVED: { bg: "rgba(52,199,89,0.12)", color: "#248A3D" },
  APPROVED_MODIFIED: { bg: "rgba(52,199,89,0.12)", color: "#248A3D" },
  DECLINED: { bg: "rgba(255,59,48,0.10)", color: "#9B1C1C" },
  CANCELLED: { bg: "rgba(60,60,67,0.08)", color: "#6C6C70" },
  EXPIRED: { bg: "rgba(60,60,67,0.08)", color: "#6C6C70" },
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

export function holdRequestStatusLabel(status: TaskableHoldRequestStatus): string {
  return STATUS_LABEL[status] ?? status;
}

export function holdRequestStatusStyle(status: TaskableHoldRequestStatus) {
  return STATUS_STYLE[status] ?? { bg: "rgba(60,60,67,0.08)", color: "#6C6C70" };
}

/** Format a hold calendar day from the YYYY-MM-DD prefix (no local/UTC day shift). */
export function formatHoldDate(dateStr: string): string {
  const match = DATE_ONLY.exec(dateStr.trim());
  if (!match) return "—";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Serialize a calendar day for hold request APIs.
 * Uses UTC day boundaries so the ISO date prefix matches the picked day
 * (avoids local-midnight → previous-UTC-day shifts in UTC+ timezones).
 */
export function toHoldRequestDateIso(dateOnly: string, endOfDay = false): string {
  const match = DATE_ONLY.exec(dateOnly.trim());
  if (!match) {
    const fallback = new Date(dateOnly);
    if (Number.isNaN(fallback.getTime())) return dateOnly;
    return fallback.toISOString();
  }
  const day = `${match[1]}-${match[2]}-${match[3]}`;
  return endOfDay ? `${day}T23:59:59.999Z` : `${day}T00:00:00.000Z`;
}
