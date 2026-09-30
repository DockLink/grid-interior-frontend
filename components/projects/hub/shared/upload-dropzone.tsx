"use client";

import { useRef, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  label,
  icon = "upload_file",
  onUpload,
  onFiles,
  accept,
  multiple = true,
  className,
  hint = "Drag & drop or click to browse · PNG, JPG, PDF, MP4",
  disabled = false,
}: {
  label: string;
  icon?: string;
  onUpload?: () => void;
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (disabled) return;
    if (onFiles) {
      inputRef.current?.click();
      return;
    }
    onUpload?.();
  };

  const handleFiles = (list: FileList | null) => {
    if (disabled) return;
    const files = list ? Array.from(list) : [];
    if (files.length && onFiles) {
      onFiles(files);
      return;
    }
    onUpload?.();
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      className={cn(
        "mb-5 flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] border-2 border-dashed px-6 py-8 transition-all duration-200 neu-inset",
        dragOver
          ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.04)]"
          : "border-[var(--figma-border)] bg-[var(--figma-gray50)]",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-xl transition-colors duration-200",
          dragOver ? "bg-[rgba(14,124,134,0.12)]" : "bg-[var(--figma-gray100)]",
        )}
      >
        <MaterialIcon
          name={icon}
          outlined
          size={26}
          className={dragOver ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
        />
      </div>
      <div className="text-center">
        <div className="mb-0.5 text-[13px] font-semibold text-[var(--figma-navy)]">{label}</div>
        <div className="text-[11px] text-[var(--figma-gray500)]">{hint}</div>
      </div>
    </div>
  );
}
