import { pickNumber, pickString } from "@/lib/api/normalize";
import type {
  TaskableHoldRequest,
  TaskableHoldRequestStatus,
  TaskableHoldRequestTask,
  TaskableHoldRequestUser,
} from "@/types/hold-requests";

const HOLD_STATUSES: TaskableHoldRequestStatus[] = [
  "PENDING",
  "APPROVED",
  "APPROVED_MODIFIED",
  "DECLINED",
  "CANCELLED",
  "EXPIRED",
];

function mapUser(raw: unknown): TaskableHoldRequestUser | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const id = pickString(obj, "id");
  if (!id) return undefined;
  return {
    id,
    email: pickString(obj, "email"),
    firstName: pickString(obj, "firstName", "first_name"),
    lastName: pickString(obj, "lastName", "last_name"),
  };
}

function mapTask(raw: unknown): TaskableHoldRequestTask | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const id = pickString(obj, "id");
  if (!id) return undefined;
  return {
    id,
    title: pickString(obj, "title"),
    projectId: pickString(obj, "projectId", "project_id"),
    start_date: pickString(obj, "start_date", "startDate") ?? null,
    end_date: pickString(obj, "end_date", "endDate") ?? null,
  };
}

function mapStatus(raw: string | undefined): TaskableHoldRequestStatus {
  if (raw && (HOLD_STATUSES as string[]).includes(raw)) {
    return raw as TaskableHoldRequestStatus;
  }
  return "PENDING";
}

/** Normalizes snake_case or camelCase Nest payloads into TaskableHoldRequest. */
export function mapHoldRequest(raw: unknown): TaskableHoldRequest {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const holdHours = pickNumber(obj, "holdHoursGranted", "hold_hours_granted");

  return {
    id: pickString(obj, "id") ?? "",
    taskId: pickString(obj, "taskId", "task_id") ?? "",
    requestedById: pickString(obj, "requestedById", "requested_by_id") ?? "",
    reason: pickString(obj, "reason") ?? "",
    requestedStartDate:
      pickString(obj, "requestedStartDate", "requested_start_date") ?? "",
    requestedEndDate:
      pickString(obj, "requestedEndDate", "requested_end_date") ?? "",
    requestedNote:
      pickString(obj, "requestedNote", "requested_note") ?? null,
    status: mapStatus(pickString(obj, "status")),
    reviewedById: pickString(obj, "reviewedById", "reviewed_by_id") ?? null,
    approvedStartDate:
      pickString(obj, "approvedStartDate", "approved_start_date") ?? null,
    approvedEndDate:
      pickString(obj, "approvedEndDate", "approved_end_date") ?? null,
    adminNote: pickString(obj, "adminNote", "admin_note") ?? null,
    holdHoursGranted: holdHours,
    reviewedAt: pickString(obj, "reviewedAt", "reviewed_at") ?? null,
    appliedAt: pickString(obj, "appliedAt", "applied_at") ?? null,
    resumedAt: pickString(obj, "resumedAt", "resumed_at") ?? null,
    created_at: pickString(obj, "created_at", "createdAt"),
    updated_at: pickString(obj, "updated_at", "updatedAt"),
    requestedBy: mapUser(obj.requestedBy ?? obj.requested_by),
    reviewedBy: mapUser(obj.reviewedBy ?? obj.reviewed_by) ?? null,
    task: mapTask(obj.task),
  };
}

export function mapHoldRequestsList(raw: unknown): TaskableHoldRequest[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data;
  if (!Array.isArray(data)) return [];
  return data.map(mapHoldRequest);
}

/** Nest process endpoint expects snake_case body fields. */
export function toProcessHoldRequestBody(payload: {
  taskableHoldRequestId: string;
  action: "approve" | "reject" | "resume";
  reviewRemark?: string;
  approvedStartDate?: string;
  approvedEndDate?: string;
  resumeDate?: string;
}): Record<string, string> {
  const body: Record<string, string> = {
    taskable_hold_request_id: payload.taskableHoldRequestId,
    action: payload.action,
  };
  if (payload.reviewRemark) body.review_remark = payload.reviewRemark;
  if (payload.approvedStartDate) body.approved_start_date = payload.approvedStartDate;
  if (payload.approvedEndDate) body.approved_end_date = payload.approvedEndDate;
  if (payload.resumeDate) body.resume_date = payload.resumeDate;
  return body;
}
