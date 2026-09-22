import { pickString } from "@/lib/api/normalize";
import type {
  AccessRequest,
  AccessRequestProject,
  AccessRequestStatus,
  AccessRequestUser,
  ProjectMemberRole,
} from "@/types/access-requests";

const ACCESS_STATUSES: AccessRequestStatus[] = ["PENDING", "APPROVED", "DECLINED"];
const GRANTED_ROLES: ProjectMemberRole[] = ["VIEWER", "MEMBER", "PRU"];

function mapStatus(raw: string | undefined): AccessRequestStatus {
  if (!raw) return "PENDING";
  const normalized = raw.trim().toUpperCase();
  if ((ACCESS_STATUSES as string[]).includes(normalized)) {
    return normalized as AccessRequestStatus;
  }
  return "PENDING";
}

function mapGrantedRole(raw: string | undefined): ProjectMemberRole | null {
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase();
  if ((GRANTED_ROLES as string[]).includes(normalized)) {
    return normalized as ProjectMemberRole;
  }
  return null;
}

function mapUser(raw: unknown): AccessRequestUser | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const id = pickString(obj, "id");
  if (!id) return undefined;
  return {
    id,
    email: pickString(obj, "email"),
    firstName: pickString(obj, "firstName", "first_name"),
    lastName: pickString(obj, "lastName", "last_name"),
    first_name: pickString(obj, "first_name", "firstName"),
    last_name: pickString(obj, "last_name", "lastName"),
  };
}

function mapProject(raw: unknown): AccessRequestProject | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const id = pickString(obj, "id");
  if (!id) return undefined;
  return {
    id,
    name: pickString(obj, "name") ?? "Project",
    code: pickString(obj, "code"),
  };
}

/** Normalizes snake_case or camelCase Nest payloads into AccessRequest. */
export function mapAccessRequest(raw: unknown): AccessRequest {
  const obj = (raw ?? {}) as Record<string, unknown>;
  return {
    id: pickString(obj, "id") ?? "",
    projectId: pickString(obj, "projectId", "project_id") ?? "",
    requestedById: pickString(obj, "requestedById", "requested_by_id") ?? "",
    requestNote: pickString(obj, "requestNote", "request_note") ?? null,
    status: mapStatus(pickString(obj, "status")),
    reviewedById: pickString(obj, "reviewedById", "reviewed_by_id") ?? null,
    grantedRole: mapGrantedRole(pickString(obj, "grantedRole", "granted_role")),
    reviewedAt: pickString(obj, "reviewedAt", "reviewed_at") ?? null,
    created_at:
      pickString(obj, "created_at", "createdAt") ?? new Date().toISOString(),
    updated_at:
      pickString(obj, "updated_at", "updatedAt") ?? new Date().toISOString(),
    project: mapProject(obj.project),
    requestedBy: mapUser(obj.requestedBy ?? obj.requested_by),
    reviewedBy: mapUser(obj.reviewedBy ?? obj.reviewed_by) ?? null,
  };
}

export function mapAccessRequestsList(raw: unknown): AccessRequest[] {
  if (Array.isArray(raw)) return raw.map(mapAccessRequest);
  if (!raw || typeof raw !== "object") return [];
  const data = (raw as Record<string, unknown>).data;
  if (!Array.isArray(data)) return [];
  return data.map(mapAccessRequest);
}

/** Nest review endpoint expects snake_case body fields. */
export function toReviewAccessRequestBody(payload: {
  accessRequestId: string;
  action: "approve" | "reject";
  grantedRole?: ProjectMemberRole;
}): Record<string, string> {
  const body: Record<string, string> = {
    access_request_id: payload.accessRequestId,
    action: payload.action,
  };
  if (payload.grantedRole) body.granted_role = payload.grantedRole;
  return body;
}
