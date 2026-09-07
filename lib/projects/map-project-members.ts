import { pickString } from "@/lib/api/normalize";
import type { ProjectMember, ProjectMemberProjectRole } from "@/types/projects";

const MEMBER_ROLES: ProjectMemberProjectRole[] = ["PRU", "MEMBER", "VIEWER"];

function mapRole(raw: string | undefined): ProjectMemberProjectRole | undefined {
  if (raw && (MEMBER_ROLES as string[]).includes(raw)) {
    return raw as ProjectMemberProjectRole;
  }
  return undefined;
}

function mapAssignee(raw: unknown): ProjectMember["assignee"] | undefined {
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

/** Normalizes snake_case or camelCase Nest member rows into ProjectMember. */
export function mapProjectMember(raw: unknown): ProjectMember {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const statusRaw = pickString(obj, "status") ?? "ACTIVE";
  return {
    project_id: pickString(obj, "project_id", "projectId") ?? "",
    user_id: pickString(obj, "user_id", "userId") ?? "",
    assigned_by: pickString(obj, "assigned_by", "assignedBy") ?? "",
    status: statusRaw === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    role: mapRole(pickString(obj, "role")),
    assignee: mapAssignee(obj.assignee),
  };
}

export function mapProjectMembersList(raw: unknown): ProjectMember[] {
  if (Array.isArray(raw)) return raw.map(mapProjectMember);
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const members = obj.members;
  if (Array.isArray(members)) return members.map(mapProjectMember);
  return [];
}
