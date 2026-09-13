import type { LayoutDrawingType } from "@/types/layout";
import type { ProjectFile } from "@/types/files";

export function formatFileSize(size: string | number | null | undefined): string {
  if (size == null || size === "") return "—";
  const n = typeof size === "number" ? size : Number(size);
  if (!Number.isFinite(n) || n <= 0) return typeof size === "string" ? size : "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatFileDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function drawingTypeFromFile(file: {
  fileName: string;
  mimeType?: string;
}): LayoutDrawingType {
  const name = file.fileName.toLowerCase();
  const mime = (file.mimeType ?? "").toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (
    name.endsWith(".dwg") ||
    name.endsWith(".dxf") ||
    mime.includes("dwg") ||
    mime.includes("autocad")
  ) {
    return "dwg";
  }
  return "img";
}

export function isImageProjectFile(file: ProjectFile): boolean {
  const mime = file.mimeType?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|avif|bmp|heic)$/i.test(file.fileName);
}

export function toVimeoEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const url = raw.trim();
  const idMatch =
    url.match(/vimeo\.com\/(?:video\/)?(\d+)/i) ??
    url.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (idMatch?.[1]) return `https://player.vimeo.com/video/${idMatch[1]}`;
  if (url.includes("player.vimeo.com")) return url;
  return null;
}
