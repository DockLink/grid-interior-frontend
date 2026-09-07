import { pickString } from "@/lib/api/normalize";
import type { Client, ClientApi, ClientsListMeta, ClientsListResponse, CommLogEntry,
  CommLogEntryApi,
  LeadPipelineResponse,
  LeadSource,
  PipelineCard,
  PreferredContact,
} from "@/types/clients";

const AVATAR_COLORS = [
  "#1B2A4A",
  "#0E7C86",
  "#3FA66B",
  "#243458",
  "#F5A623",
  "#7C3AED",
  "#BE185D",
  "#0284C7",
];

function hashColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length]!;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function formatContactDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function mapClientApiToView(raw: ClientApi | Record<string, unknown>): Client {
  const api = raw as ClientApi;
  const id = pickString(raw as Record<string, unknown>, "id") ?? "";
  const name = pickString(raw as Record<string, unknown>, "name") ?? "Unknown";
  const assignedTo =
    pickString(raw as Record<string, unknown>, "assigned_to", "assignedTo") ?? "Unassigned";

  return {
    id,
    initials: initialsFromName(name),
    color: hashColor(id || name),
    name,
    company:
      pickString(raw as Record<string, unknown>, "company") ?? "",
    phone: pickString(raw as Record<string, unknown>, "phone") ?? "",
    email: pickString(raw as Record<string, unknown>, "email") ?? "",
    address: pickString(raw as Record<string, unknown>, "address") ?? "",
    preferredContact:
      (pickString(raw as Record<string, unknown>, "preferred_contact", "preferredContact") as PreferredContact) ??
      "Email",
    status: (pickString(raw as Record<string, unknown>, "status") as Client["status"]) ?? "Lead",
    source: (pickString(raw as Record<string, unknown>, "source") as Client["source"]) ?? "Referral",
    stage: pickString(raw as Record<string, unknown>, "stage") as Client["stage"],
    linkedProjects:
      Number((raw as Record<string, unknown>).linked_projects ??
        (raw as Record<string, unknown>).linkedProjects ??
        0) || 0,
    activeProjects:
      Number((raw as Record<string, unknown>).active_projects ??
        (raw as Record<string, unknown>).activeProjects ??
        0) || 0,
    totalInvoiced:
      pickString(raw as Record<string, unknown>, "total_invoiced", "totalInvoiced") ?? "€ 0",
    lastContact: formatContactDate(
      pickString(raw as Record<string, unknown>, "last_contact", "lastContact"),
    ),
    followUpDate: pickString(raw as Record<string, unknown>, "follow_up_date", "followUpDate"),
    assignedTo,
    assignedInitials: initialsFromName(assignedTo),
    notes: pickString(raw as Record<string, unknown>, "notes") ?? undefined,
    projects: Array.isArray(api.projects) ? api.projects : undefined,
    deleted: Boolean((raw as Record<string, unknown>).deleted),
  };
}

export function mapCommLogApiToView(raw: CommLogEntryApi | Record<string, unknown>): CommLogEntry {
  const member =
    pickString(raw as Record<string, unknown>, "member") ?? "Team Member";
  const dateRaw = pickString(raw as Record<string, unknown>, "date") ?? "";
  return {
    id: pickString(raw as Record<string, unknown>, "id") ?? "",
    type: (pickString(raw as Record<string, unknown>, "type") as CommLogEntry["type"]) ?? "call",
    date: formatContactDate(dateRaw) === "—" ? dateRaw : formatContactDate(dateRaw),
    time: pickString(raw as Record<string, unknown>, "time") ?? "",
    member,
    initials: initialsFromName(member),
    note: pickString(raw as Record<string, unknown>, "note") ?? "",
    attachments: (raw as CommLogEntryApi).attachments,
  };
}

function mapPipelineCard(raw: Record<string, unknown>): PipelineCard {
  const assigned =
    pickString(raw, "assigned_to", "assignedTo", "initials") ?? "—";
  return {
    id: pickString(raw, "id") ?? "",
    client: pickString(raw, "client", "name") ?? "",
    company: pickString(raw, "company") ?? "",
    source: (pickString(raw, "source") as LeadSource) ?? "Referral",
    followUp: pickString(raw, "follow_up", "followUp") ?? "",
    initials: initialsFromName(assigned).slice(0, 2),
    overdue: Boolean(raw.overdue),
  };
}

export function mapLeadPipelineResponse(raw: unknown): LeadPipelineResponse {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const stages = ["new", "meeting", "proposal", "won", "lost"] as const;
  const out = {} as LeadPipelineResponse;
  for (const stage of stages) {
    const items = obj[stage];
    out[stage] = Array.isArray(items)
      ? items.map((item) => mapPipelineCard(item as Record<string, unknown>))
      : [];
  }
  return out;
}

export function mapClientsListResponse(raw: ClientsListResponse | {
  data?: unknown[];
  meta?: Partial<ClientsListMeta>;
}): { data: Client[]; meta: { total: number; page: number; limit: number; totalPages: number } } {
  const data = (raw.data ?? []).map((item) => mapClientApiToView(item as ClientApi));
  const meta = raw.meta ?? {};
  return {
    data,
    meta: {
      total: (meta.total as number) ?? data.length,
      page: (meta.page as number) ?? 1,
      limit: (meta.limit as number) ?? data.length,
      totalPages: (meta.totalPages as number) ?? 1,
    },
  };
}
