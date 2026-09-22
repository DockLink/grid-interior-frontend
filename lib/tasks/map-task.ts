import { pickNumber, pickString } from "@/lib/api/normalize";
import type { Task, TaskablePriority, TaskableStatus, TaskableType } from "@/types/tasks";

const TASKABLE_STATUSES: TaskableStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "ON_HOLD",
  "COMPLETED",
  "REOPENED",
];

const TASKABLE_TYPES: TaskableType[] = ["MILESTONE", "STAGE", "TASK"];
const TASKABLE_PRIORITIES: TaskablePriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function mapStatus(raw: string | undefined): TaskableStatus {
  if (!raw) return "TODO";
  const normalized = raw.trim().toUpperCase().replace(/-/g, "_");
  if ((TASKABLE_STATUSES as string[]).includes(normalized)) {
    return normalized as TaskableStatus;
  }
  return "TODO";
}

function mapType(raw: string | undefined): TaskableType {
  if (raw && (TASKABLE_TYPES as string[]).includes(raw)) return raw as TaskableType;
  return "TASK";
}

function mapPriority(raw: string | undefined): TaskablePriority {
  if (raw && (TASKABLE_PRIORITIES as string[]).includes(raw)) return raw as TaskablePriority;
  return "MEDIUM";
}

/** Normalizes snake_case or camelCase Nest task payloads into Task. */
export function mapTask(raw: unknown): Task {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const childrenRaw = obj.subtasks ?? obj.children;
  const children = Array.isArray(childrenRaw) ? childrenRaw.map(mapTask) : undefined;

  return {
    id: pickString(obj, "id") ?? "",
    code: pickString(obj, "code") ?? "",
    title: pickString(obj, "title") ?? "",
    description: pickString(obj, "description") ?? null,
    start_date: pickString(obj, "start_date", "startDate") ?? new Date().toISOString(),
    duration: pickString(obj, "duration"),
    end_date: pickString(obj, "end_date", "endDate") ?? null,
    durationHours:
      pickNumber(obj, "durationHours", "duration_hours") ??
      pickString(obj, "durationHours", "duration_hours") ??
      null,
    status: mapStatus(pickString(obj, "status")),
    taskableType: mapType(pickString(obj, "taskableType", "taskable_type")),
    taskablePriority: mapPriority(pickString(obj, "taskablePriority", "taskable_priority")),
    order: pickNumber(obj, "order") ?? 0,
    depth: pickNumber(obj, "depth") ?? 0,
    projectId: pickString(obj, "projectId", "project_id") ?? "",
    parentTaskableId:
      pickString(obj, "parentTaskableId", "parent_taskable_id") ?? null,
    created_at: pickString(obj, "created_at", "createdAt"),
    updated_at: pickString(obj, "updated_at", "updatedAt"),
    subtasks: children,
    children,
  };
}

export function mapTasksList(raw: unknown): Task[] {
  if (Array.isArray(raw)) return raw.map(mapTask);
  if (!raw || typeof raw !== "object") return [];
  const data = (raw as Record<string, unknown>).data;
  if (!Array.isArray(data)) return [];
  return data.map(mapTask);
}
