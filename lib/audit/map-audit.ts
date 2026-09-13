import type { AuditLogEntry, UserActivityItem } from "@/types/audit";

function pickString(...vals: unknown[]): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function mapAuditEntryToActivity(entry: AuditLogEntry, index: number): UserActivityItem {
  const text =
    pickString(
      entry.message,
      entry.description,
      entry.action,
      entry.event,
      entry.resource,
    ) ?? "Activity recorded";
  const atIso = pickString(entry.created_at, entry.createdAt, entry.timestamp);
  return {
    id: pickString(entry.id) ?? `audit-${index}`,
    text,
    at: formatRelative(atIso),
  };
}

export function mapAuditListToActivity(raw: unknown): UserActivityItem[] {
  let entries: AuditLogEntry[] = [];
  if (Array.isArray(raw)) {
    entries = raw as AuditLogEntry[];
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) entries = obj.data as AuditLogEntry[];
    else if (Array.isArray(obj.items)) entries = obj.items as AuditLogEntry[];
  }
  return entries.map(mapAuditEntryToActivity);
}
