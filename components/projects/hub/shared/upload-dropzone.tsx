"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  label,
  icon = "upload_file",
  onUpload,
  className,
}: {
  label: string;
  icon?: string;
  onUpload?: () => void;
  className?: string;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
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
        onUpload?.();
      }}
      onClick={onUpload}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onUpload?.();
        }
      }}
      className={cn(
        "mb-5 flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] border-2 border-dashed px-6 py-8 transition-all duration-200 neu-inset",
        dragOver ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.04)]" : "border-[var(--figma-border)] bg-[var(--figma-gray50)]",
        className,
      )}
    >
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
        <div className="text-[11px] text-[var(--figma-gray500)]">
          Drag & drop or click to browse · PNG, JPG, PDF, MP4
        </div>
      </div>
    </div>
  );
}
