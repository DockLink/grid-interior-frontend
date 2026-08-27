"use client";

import { useRef, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import type { CommLogAttachment, CommLogAttachmentKind } from "@/lib/clients/mock-clients";
import { cn } from "@/lib/utils";

const ACCEPT =
  ".pdf,.doc,.docx,image/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const KIND_META: Record<CommLogAttachmentKind, { icon: string; color: string; bg: string; label: string }> = {
  pdf: { icon: "picture_as_pdf", color: "var(--figma-alert)", bg: "rgba(220,38,38,0.10)", label: "PDF" },
  word: { icon: "description", color: "var(--figma-navy)", bg: "rgba(27,42,74,0.09)", label: "Word" },
  image: { icon: "image", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)", label: "Image" },
  audio: { icon: "audio_file", color: "#7C3AED", bg: "rgba(124,58,237,0.10)", label: "Audio" },
};

export function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function detectAttachmentKind(file: File): CommLogAttachmentKind | null {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return "word";
  }
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)) return "image";
  if (mime.startsWith("audio/") || /\.(mp3|wav|m4a|ogg|webm|aac|flac)$/.test(name)) return "audio";
  return null;
}

function mimeForKind(kind: CommLogAttachmentKind): string {
  if (kind === "pdf") return "application/pdf";
  if (kind === "word") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (kind === "image") return "image/*";
  return "audio/*";
}

export function createAttachmentFromFile(file: File): CommLogAttachment | null {
  const kind = detectAttachmentKind(file);
  if (!kind) return null;
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    name: file.name,
    size: file.size,
    kind,
    mimeType: file.type || mimeForKind(kind),
    url: URL.createObjectURL(file),
  };
}

export function revokeAttachmentUrls(attachments: CommLogAttachment[]) {
  for (const attachment of attachments) {
    if (attachment.url?.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.url);
    }
  }
}

export function formatCommLogDate(isoDate: string) {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function currentCommLogTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function CommLogAttachmentPicker({
  files,
  onChange,
}: {
  files: CommLogAttachment[];
  onChange: (files: CommLogAttachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (incoming.length === 0) return;

    const added: CommLogAttachment[] = [];
    const rejected: string[] = [];

    for (const file of incoming) {
      const attachment = createAttachmentFromFile(file);
      if (attachment) {
        added.push(attachment);
      } else {
        rejected.push(file.name);
      }
    }

    if (added.length > 0) {
      onChange([...files, ...added]);
    }
    setError(
      rejected.length > 0
        ? `Unsupported file type: ${rejected.join(", ")}. Use PDF, Word, image, or audio.`
        : null,
    );
  };

  const removeFile = (id: string) => {
    const next = files.filter((file) => file.id !== id);
    const removed = files.find((file) => file.id === id);
    if (removed) revokeAttachmentUrls([removed]);
    onChange(next);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[var(--figma-navy)]">Attachments</label>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-[12px] border-2 border-dashed px-4 py-5 transition-all duration-200 neu-inset",
          dragOver
            ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.04)]"
            : "border-[var(--figma-border)] bg-[var(--figma-gray50)]",
        )}
      >
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-[10px] transition-colors duration-200",
            dragOver ? "bg-[rgba(14,124,134,0.12)]" : "bg-[var(--figma-gray100)]",
          )}
        >
          <MaterialIcon
            name="upload_file"
            outlined
            size={22}
            className={dragOver ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
          />
        </div>
        <div className="text-center">
          <div className="mb-0.5 text-[13px] font-semibold text-[var(--figma-navy)]">Upload files</div>
          <div className="text-[11px] text-[var(--figma-gray500)]">
            Drag & drop or click to browse · PDF, Word, image, audio
          </div>
        </div>
      </div>
      {error ? <p className="m-0 text-[11px] text-[var(--figma-alert)]">{error}</p> : null}
      <CommLogAttachmentChips attachments={files} onRemove={removeFile} />
    </div>
  );
}

export function CommLogAttachmentChips({
  attachments,
  onRemove,
}: {
  attachments: CommLogAttachment[];
  onRemove?: (id: string) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <ul className="m-0 mt-1 flex list-none flex-col gap-2 p-0">
      {attachments.map((file) => (
        <CommLogAttachmentChip key={file.id} file={file} onRemove={onRemove} />
      ))}
    </ul>
  );
}

function CommLogAttachmentChip({
  file,
  onRemove,
}: {
  file: CommLogAttachment;
  onRemove?: (id: string) => void;
}) {
  const meta = KIND_META[file.kind];
  const canOpen = Boolean(file.url);

  const openFile = () => {
    if (!file.url) return;
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  return (
    <li className="rounded-[10px] border border-[var(--figma-border)] bg-white px-2.5 py-2 neu-card">
      <div className="flex items-center gap-2.5">
        {file.kind === "image" && file.url ? (
          // Blob URLs from local picks cannot use next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt=""
            className="size-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-md"
            style={{ background: meta.bg }}
          >
            <MaterialIcon name={meta.icon} outlined size={18} style={{ color: meta.color }} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {canOpen ? (
            <button
              type="button"
              onClick={openFile}
              className="block w-full truncate border-none bg-transparent p-0 text-left text-[12px] font-medium text-[var(--figma-navy)] underline-offset-2 hover:underline"
            >
              {file.name}
            </button>
          ) : (
            <div className="truncate text-[12px] font-medium text-[var(--figma-navy)]">{file.name}</div>
          )}
          <div className="text-[11px] text-[var(--figma-gray400)]">
            {meta.label} · {formatAttachmentSize(file.size)}
          </div>
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="flex size-7 shrink-0 items-center justify-center rounded-md border-none bg-transparent"
            aria-label={`Remove ${file.name}`}
          >
            <MaterialIcon name="close" outlined size={16} className="text-[var(--figma-gray400)]" />
          </button>
        ) : null}
      </div>
      {file.kind === "audio" && file.url ? (
        <audio controls src={file.url} className="mt-2 h-8 w-full" />
      ) : null}
    </li>
  );
}
