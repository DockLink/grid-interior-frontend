import { pickBoolean, pickNumber, pickString } from "@/lib/api/normalize";
import type { ProjectFile } from "@/types/files";

/** Normalizes snake_case or camelCase Nest file payloads into ProjectFile. */
export function mapProjectFile(raw: unknown): ProjectFile {
  const obj = (raw ?? {}) as Record<string, unknown>;
  return {
    id: pickString(obj, "id") ?? "",
    projectId: pickString(obj, "projectId", "project_id") ?? "",
    s3ObjectKey: pickString(obj, "s3ObjectKey", "s3_object_key") ?? "",
    folderCategory: pickString(obj, "folderCategory", "folder_category") ?? "",
    folderPath: pickString(obj, "folderPath", "folder_path") ?? "",
    fileName: pickString(obj, "fileName", "file_name") ?? "",
    fileSize: String(pickString(obj, "fileSize", "file_size") ?? pickNumber(obj, "fileSize", "file_size") ?? ""),
    mimeType: pickString(obj, "mimeType", "mime_type") ?? "",
    version: pickNumber(obj, "version") ?? 1,
    isSuperseded: pickBoolean(obj, "isSuperseded", "is_superseded") ?? false,
    uploadedById: pickString(obj, "uploadedById", "uploaded_by_id") ?? "",
    supersededById: pickString(obj, "supersededById", "superseded_by_id") ?? null,
    deletedAt: pickString(obj, "deletedAt", "deleted_at") ?? null,
    created_at: pickString(obj, "created_at", "createdAt") ?? new Date().toISOString(),
    updated_at: pickString(obj, "updated_at", "updatedAt") ?? new Date().toISOString(),
  };
}

export function mapProjectFilesList(raw: unknown): ProjectFile[] {
  if (Array.isArray(raw)) return raw.map(mapProjectFile);
  if (!raw || typeof raw !== "object") return [];
  const data = (raw as Record<string, unknown>).data;
  if (!Array.isArray(data)) return [];
  return data.map(mapProjectFile);
}
