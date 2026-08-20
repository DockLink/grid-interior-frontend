"use client";

import { useState, type ReactNode } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/lib/clients/mock-clients";

const STATUS_CFG: Record<ClientStatus, { color: string; bg: string }> = {
  Active: { color: "var(--figma-navy)", bg: "rgba(27,42,74,0.09)" },
  Lead: { color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)" },
  Past: { color: "var(--figma-gray500)", bg: "var(--figma-gray100)" },
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span className="size-1.5 rounded-full" style={{ background: cfg.color }} />
      {status}
    </span>
  );
}

export function ClientAvatar({
  initials,
  color,
  size = 36,
  className,
}: {
  initials: string;
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold text-white", className)}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.33,
        boxShadow: size >= 60 ? "var(--neu-card)" : undefined,
      }}
    >
      {initials}
    </div>
  );
}

export function ProjectCountBadge({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-xs text-[var(--figma-gray400)]">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(27,42,74,0.08)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--figma-navy)]">
      <MaterialIcon name="folder_open" outlined size={12} />
      {count}
    </span>
  );
}

export function FilterDropdown({
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "min-w-[140px] cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2 pl-3.5 pr-8 text-[13px] outline-none neu-inset",
          value === "All" ? "text-[var(--figma-gray500)]" : "text-[var(--figma-navy)]",
        )}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <MaterialIcon
        name="expand_more"
        outlined
        size={16}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
      />
    </div>
  );
}

export function NeuPagination({
  page,
  total,
  perPage,
  onChange,
}: {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex size-8 items-center justify-center rounded-full border border-[var(--figma-border)] bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <MaterialIcon name="chevron_left" outlined size={16} className="text-[var(--figma-gray500)]" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border-none text-[13px] transition-all duration-150",
            p === page
              ? "gi-gradient-cta font-semibold"
              : "bg-white font-normal text-[var(--figma-gray500)]",
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="flex size-8 items-center justify-center rounded-full border border-[var(--figma-border)] bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <MaterialIcon name="chevron_right" outlined size={16} className="text-[var(--figma-gray500)]" />
      </button>
    </div>
  );
}

export function GradientButton({
  children,
  onClick,
  icon,
  className,
  size = "md",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: string;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white transition-all duration-150 gi-gradient-cta",
        size === "sm" ? "px-4 py-2 text-[13px]" : "px-6 py-2.5 text-sm",
        disabled && "cursor-default opacity-60",
        className,
      )}
      style={{
        boxShadow: pressed ? "var(--neu-inset)" : hov ? "var(--neu-raised-hover)" : "var(--neu-raised)",
        transform: pressed ? "scale(0.98)" : hov ? "scale(1.02)" : "scale(1)",
      }}
    >
      {icon ? <MaterialIcon name={icon} outlined size={size === "sm" ? 15 : 18} /> : null}
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[var(--figma-teal)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--figma-teal)] neu-raised transition-all duration-150 hover:shadow-[var(--neu-raised-hover)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function NeuSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "flex h-10 max-w-[340px] flex-1 items-center gap-2 rounded-xl border-[1.5px] bg-white px-3.5 transition-all duration-150",
        focused
          ? "border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_2px_var(--figma-teal)]"
          : "border-[var(--figma-border)] neu-inset",
        className,
      )}
    >
      <MaterialIcon
        name="search"
        outlined
        size={18}
        className={cn("shrink-0 transition-colors", focused ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]")}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full border-none bg-transparent text-[13px] text-[var(--figma-navy)] outline-none"
      />
      {value ? (
        <button type="button" onClick={() => onChange("")} className="flex border-none bg-transparent p-0">
          <MaterialIcon name="close" outlined size={15} className="text-[var(--figma-gray400)]" />
        </button>
      ) : null}
    </div>
  );
}
