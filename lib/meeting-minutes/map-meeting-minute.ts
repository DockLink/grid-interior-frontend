import { pickString } from "@/lib/api/normalize";
import type {
  ActionItemStatus,
  MeetingActionItem,
  MeetingAudioFile,
  MeetingMinute,
  MeetingPdfFile,
} from "@/types/meeting-minutes";

function mapActionItem(raw: Record<string, unknown>): MeetingActionItem {
  const statusRaw = pickString(raw, "status") ?? "PENDING";
  const status: ActionItemStatus =
    statusRaw === "COMPLETED" ? "COMPLETED" : "PENDING";

  return {
    text: pickString(raw, "text") ?? "",
    assignee: pickString(raw, "assignee") ?? "",
    dueDate:
      pickString(raw, "dueDate", "due_date") ??
      new Date().toISOString().slice(0, 10),
    status,
  };
}

function mapAudioFile(raw: Record<string, unknown>): MeetingAudioFile {
  return {
    id: pickString(raw, "id") ?? "",
    url: pickString(raw, "url") ?? "",
  };
}

function mapPdfFile(raw: Record<string, unknown>): MeetingPdfFile {
  return {
    id: pickString(raw, "id") ?? "",
    url: pickString(raw, "url") ?? "",
  };
}

/** Normalizes snake_case or camelCase backend payloads into MeetingMinute. */
export function mapMeetingMinute(raw: unknown): MeetingMinute {
  const obj = (raw ?? {}) as Record<string, unknown>;

  const actionItemsRaw = obj.actionItems ?? obj.action_items;
  const actionItems = Array.isArray(actionItemsRaw)
    ? actionItemsRaw.map((item) => mapActionItem(item as Record<string, unknown>))
    : null;

  const audioRaw = obj.audio_files ?? obj.audioFiles;
  const audio_files = Array.isArray(audioRaw)
    ? audioRaw.map((item) => mapAudioFile(item as Record<string, unknown>))
    : undefined;

  const pdfRaw = obj.pdf_files ?? obj.pdfFiles;
  const pdf_files = Array.isArray(pdfRaw)
    ? pdfRaw.map((item) => mapPdfFile(item as Record<string, unknown>))
    : undefined;

  const attendeesRaw = obj.attendees;
  const attendees = Array.isArray(attendeesRaw)
    ? attendeesRaw.filter((a): a is string => typeof a === "string")
    : [];

  return {
    id: pickString(obj, "id") ?? "",
    projectId: pickString(obj, "projectId", "project_id") ?? "",
    title: pickString(obj, "title") ?? "Untitled",
    meetingDate:
      pickString(obj, "meetingDate", "meeting_date") ??
      new Date().toISOString().slice(0, 10),
    attendees,
    body: typeof obj.body === "string" ? obj.body : null,
    actionItems,
    audio_files,
    pdf_files,
    createdById: pickString(obj, "createdById", "created_by_id"),
    createdAt: pickString(obj, "createdAt", "created_at"),
    updatedAt: pickString(obj, "updatedAt", "updated_at"),
  };
}

export function mapMeetingMinutesList(raw: unknown): MeetingMinute[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data;
  if (!Array.isArray(data)) return [];
  return data.map(mapMeetingMinute);
}
