import type { DocFile } from "@/lib/files/mock-documents";
import type { ProjectFile } from "@/types/files";

export interface GlobalRecentFile extends ProjectFile {
  projectName: string;
}

function hashStringToNumber(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function mimeToDocType(mimeType: string, fileName: string): DocFile["type"] {
  const mime = mimeType.toLowerCase();
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (mime.includes("pdf") || ext === "pdf") return "pdf";
  if (mime.includes("dwg") || ext === "dwg") return "dwg";
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    return "img";
  }
  if (
    mime.includes("sheet") ||
    mime.includes("excel") ||
    ["xls", "xlsx", "csv"].includes(ext)
  ) {
    return "xls";
  }
  if (mime.startsWith("audio/") || ["mp3", "wav", "m4a"].includes(ext)) return "audio";
  return "pdf";
}

function folderFromPath(folderPath: string, folderCategory: string): string {
  const segment = folderPath.replace(/^\/+/, "").split("/")[0]?.toLowerCase() ?? "";
  if (segment.includes("drawing")) return "drawings";
  if (segment.includes("design")) return "designs";
  if (segment.includes("admin")) return "admin";
  if (segment.includes("approv")) return "approved";
  return folderCategory.toLowerCase() || segment || "admin";
}

function formatFileSize(size: string): string {
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) return size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDisplayDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function mapProjectFileToDocFile(file: GlobalRecentFile): DocFile {
  return {
    id: hashStringToNumber(file.id),
    name: file.fileName,
    type: mimeToDocType(file.mimeType, file.fileName),
    size: formatFileSize(file.fileSize),
    date: formatDisplayDate(file.created_at),
    folder: folderFromPath(file.folderPath, file.folderCategory),
    projectId: file.projectId,
    uploader: { initials: "?", color: "#0891B2" },
  };
}
