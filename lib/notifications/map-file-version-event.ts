import { pickNumber, pickString } from "@/lib/api/normalize";
import type { FileVersionEvent } from "@/types/notifications";

/** Normalizes snake_case or camelCase Nest file-version notification payloads. */
export function mapFileVersionEvent(raw: unknown): FileVersionEvent {
  const obj = (raw ?? {}) as Record<string, unknown>;
  return {
    id: pickString(obj, "id") ?? "",
    projectId: pickString(obj, "projectId", "project_id") ?? "",
    projectName: pickString(obj, "projectName", "project_name") ?? "Project",
    fileId: pickString(obj, "fileId", "file_id") ?? "",
    newFileName: pickString(obj, "newFileName", "new_file_name") ?? "",
    replacedFileName:
      pickString(obj, "replacedFileName", "replaced_file_name") ?? "",
    folderPath: pickString(obj, "folderPath", "folder_path") ?? "",
    version: pickNumber(obj, "version") ?? 1,
    uploadedByName:
      pickString(obj, "uploadedByName", "uploaded_by_name") ?? "A team member",
    createdAt:
      pickString(obj, "createdAt", "created_at") ?? new Date().toISOString(),
  };
}

export function mapFileVersionEventsList(raw: unknown): FileVersionEvent[] {
  if (Array.isArray(raw)) return raw.map(mapFileVersionEvent);
  if (!raw || typeof raw !== "object") return [];
  const data = (raw as Record<string, unknown>).data;
  if (!Array.isArray(data)) return [];
  return data.map(mapFileVersionEvent);
}
