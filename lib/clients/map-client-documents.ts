import type { ClientDocumentFile, ClientDocumentFolder } from "@/types/clients";
import type { ProjectFile, ProjectFolderTree } from "@/types/files";

const FOLDER_COLORS: Record<string, string> = {
  contracts: "var(--figma-navy)",
  "client approvals": "var(--figma-teal)",
  "mood boards": "#8B5CF6",
  "supplier quotes": "#D97706",
  "site photos": "#059669",
  drawings: "#0891B2",
};

function folderLabelFromPath(path: string): string {
  const segment = path.replace(/^\/+/, "").split("/").pop() ?? path;
  return segment
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function fileTypeLabel(mimeType: string, fileName: string): string {
  const mime = mimeType.toLowerCase();
  const ext = fileName.split(".").pop()?.toUpperCase() ?? "";
  if (mime.includes("pdf") || ext === "PDF") return "PDF";
  if (mime.includes("presentation") || ext === "PPTX" || ext === "PPT") return "PPT";
  if (mime.includes("word") || ext === "DOC" || ext === "DOCX") return "DOC";
  if (mime.includes("dwg") || ext === "DWG") return "DWG";
  if (mime.startsWith("image/")) return "IMG";
  return ext || "FILE";
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
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function aggregateFolderCounts(
  trees: { tree: ProjectFolderTree | null }[],
): ClientDocumentFolder[] {
  const counts = new Map<string, number>();

  for (const { tree } of trees) {
    if (!tree?.fileCounts) continue;
    for (const [path, count] of Object.entries(tree.fileCounts)) {
      const label = folderLabelFromPath(path);
      counts.set(label, (counts.get(label) ?? 0) + count);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, count]) => ({
      label,
      count,
      color: FOLDER_COLORS[label.toLowerCase()] ?? "var(--figma-navy)",
      path: label.toLowerCase().replace(/\s+/g, "-"),
    }));
}

export function mapProjectFileToClientDocument(
  file: ProjectFile,
  projectName: string,
): ClientDocumentFile {
  return {
    id: file.id,
    name: file.fileName,
    type: fileTypeLabel(file.mimeType, file.fileName),
    date: formatDisplayDate(file.created_at),
    size: formatFileSize(file.fileSize),
    uploaderInitials: "?",
    projectId: file.projectId,
    projectName,
    mimeType: file.mimeType,
  };
}

export const CLIENT_DOC_TYPE_COLORS: Record<string, string> = {
  PDF: "var(--figma-alert)",
  PPT: "#D97706",
  DOC: "var(--figma-navy)",
  DWG: "var(--figma-teal)",
  IMG: "var(--figma-teal)",
  FILE: "var(--figma-navy)",
};
