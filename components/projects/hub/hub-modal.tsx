"use client";

import type { ReactNode } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";

export const hubInputClass =
  "hub-input-focus w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-2.5 text-[13px] text-[var(--figma-navy)] outline-none transition-all duration-150 neu-inset placeholder:text-[var(--figma-gray400)]";

export const hubSelectClass =
  "hub-input-focus w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-2.5 text-[13px] text-[var(--figma-navy)] outline-none transition-all duration-150 neu-inset disabled:cursor-not-allowed disabled:opacity-50";

export const hubLabelClass = "text-[13px] font-medium text-[var(--figma-navy)]";

export const hubHintClass = "text-[11px] text-[var(--figma-gray500)]";

export const hubSectionLabelClass =
  "text-[11px] font-semibold tracking-wide text-[var(--figma-gray500)] uppercase";

export function HubModal({
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 600,
  icon,
  className,
}: {
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
  icon?: string;
  className?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto p-5 pt-8 backdrop-blur-[3px]"
      style={{ background: "rgba(27,42,74,0.20)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn("hub-modal-in w-full rounded-[20px] bg-white px-8 py-7", className)}
        style={{ maxWidth, boxShadow: "var(--neu-modal)" }}
        role="dialog"
        aria-modal
        aria-labelledby="hub-modal-title"
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(14,124,134,0.10)] text-[var(--figma-teal)]">
                <MaterialIcon name={icon} outlined size={18} />
              </span>
            )}
            <div className="min-w-0">
              <h2
                id="hub-modal-title"
                className="m-0 mb-1 text-xl font-bold text-[var(--figma-navy)]"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="m-0 text-[13px] text-[var(--figma-gray500)]">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
            aria-label="Close"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="max-h-[min(68vh,640px)] overflow-y-auto">{children}</div>

        {footer && (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--figma-border)] pt-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function HubField({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className={hubLabelClass}>{label}</label>
      {children}
      {hint && <p className={hubHintClass}>{hint}</p>}
    </div>
  );
}
