"use client";

import { useRef, useState, type ReactNode } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";

export {
  SectionCard,
  SectionTitle,
  GradientBtn,
  OutlineBtn,
} from "@/components/projects/hub/consultation/consultation-ui";

export function WorkspaceBreadcrumb({
  items,
  onBack,
}: {
  items: string[];
  onBack: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      data-allow-phase-nav
      onClick={onBack}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="mb-4 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] transition-colors duration-150"
      style={{ color: hover ? "var(--figma-teal)" : "var(--figma-gray500)" }}
    >
      <MaterialIcon name="arrow_back" outlined size={16} />
      {items.join(" / ")}
    </button>
  );
}

export function AreaTabs<T extends { id: number | string; name: string }>({
  areas,
  activeId,
  setActiveId,
}: {
  areas: T[];
  activeId: number | string;
  setActiveId: (id: number | string) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-1.5">
      {areas.map((area) => {
        const active = area.id === activeId;
        return (
          <button
            key={area.id}
            type="button"
            onClick={() => setActiveId(area.id)}
            className={cn(
              "cursor-pointer rounded-[20px] border-none px-[18px] py-[7px] text-[13px] transition-all duration-200",
              active ? "font-bold text-white gi-gradient-cta" : "font-normal text-[var(--figma-gray500)] bg-white",
            )}
            style={{ boxShadow: active ? "var(--neu-raised)" : "var(--neu-inset)" }}
          >
            {area.name}
          </button>
        );
      })}
    </div>
  );
}

export function UploadDropzone({
  label,
  onUpload,
  onFiles,
}: {
  label: string;
  onUpload?: () => void;
  onFiles?: (files: File[]) => void;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    const files = list ? Array.from(list) : [];
    if (files.length && onFiles) {
      onFiles(files);
      return;
    }
    onUpload?.();
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => {
        if (onFiles) {
          inputRef.current?.click();
          return;
        }
        onUpload?.();
      }}
      className={cn(
        "mb-5 flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] border-2 border-dashed px-6 py-7 transition-all duration-200 neu-inset",
        drag ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.04)]" : "border-[var(--figma-border)] bg-[var(--figma-gray50)]",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-xl",
          drag ? "bg-[rgba(14,124,134,0.12)]" : "bg-[var(--figma-gray100)]",
        )}
      >
        <MaterialIcon
          name="upload_file"
          outlined
          size={26}
          className={drag ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
        />
      </div>
      <div className="text-center">
        <div className="mb-0.5 text-[13px] font-semibold text-[var(--figma-navy)]">{label}</div>
        <div className="text-[11px] text-[var(--figma-gray500)]">
          Drag & drop or click · PDF, DWG, DXF, PNG, JPG
        </div>
      </div>
    </div>
  );
}

export function PhaseReadOnlyBanner() {
  return (
    <div
      className="mx-4 mb-4 flex items-start gap-3 rounded-[12px] border border-[var(--figma-border)] bg-[var(--figma-gray50)] px-4 py-3 sm:mx-10"
      role="status"
    >
      <MaterialIcon name="lock" outlined size={18} className="mt-0.5 shrink-0 text-[var(--figma-gray500)]" />
      <div>
        <div className="text-[13px] font-semibold text-[var(--figma-navy)]">
          This phase is completed and is read-only
        </div>
        <div className="mt-0.5 text-[12px] text-[var(--figma-gray500)]">
          You can review past work here, but editing is locked because the project has moved past this phase.
        </div>
      </div>
    </div>
  );
}

/** View-only wrapper for completed phases — keeps navigation, blocks interactions. */
export function PhaseLockedContent({
  locked,
  children,
  className,
}: {
  locked: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!locked) return <>{children}</>;
  return (
    <div className={className}>
      <PhaseReadOnlyBanner />
      <div
        className="pointer-events-none select-none opacity-80 [&_[data-allow-phase-nav]]:pointer-events-auto"
        aria-disabled="true"
      >
        {children}
      </div>
    </div>
  );
}
