"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  AVAILABILITY_CFG,
  CATEGORY_CFG,
  type AvailabilityStatus,
} from "@/lib/suppliers/mock-suppliers";
import { cn } from "@/lib/utils";

export function CategoryBadge({ label }: { label: string }) {
  const cfg = CATEGORY_CFG[label] ?? {
    color: "var(--figma-gray500)",
    bg: "var(--figma-gray100)",
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-[11px] font-semibold whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {label}
    </span>
  );
}

export function AvailabilityDot({ status }: { status: AvailabilityStatus }) {
  const cfg = AVAILABILITY_CFG[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{
          background: cfg.color,
          boxShadow: `0 0 0 2px ${cfg.color}28`,
        }}
      />
      <span className="text-[12px] font-medium" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </span>
  );
}

export function FilterDropdown({
  value,
  options,
  onChange,
}: {
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
          "min-w-[160px] cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2 pr-8 pl-3.5 text-[13px] outline-none neu-inset",
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
        className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[var(--figma-gray400)]"
      />
    </div>
  );
}

export function StatusToggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!active);
      }}
      className={cn(
        "relative h-[22px] w-[42px] shrink-0 cursor-pointer rounded-[11px] border-none p-0 transition-all duration-[250ms]",
        active ? "gi-gradient-cta neu-raised" : "bg-[var(--figma-border)] neu-inset",
      )}
    >
      <span
        className="absolute top-0.5 block h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.20)] transition-[left] duration-[220ms]"
        style={{ left: active ? 22 : 2 }}
      />
    </button>
  );
}

export function GradientButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={cn(
        "gi-gradient-cta flex cursor-pointer items-center gap-2 rounded-full border-none px-6 py-[11px] text-[14px] font-semibold whitespace-nowrap text-white transition-all duration-150",
        disabled && "cursor-default opacity-60",
        className,
      )}
      style={{
        boxShadow: pressed
          ? "var(--neu-inset)"
          : hov
            ? "var(--neu-raised-hover)"
            : "var(--neu-raised)",
        transform: pressed ? "scale(0.98)" : hov ? "scale(1.02)" : "scale(1)",
      }}
    >
      {children}
    </button>
  );
}

export function StatusPill({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color, background: bg }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function InitialsAvatar({
  name,
  variant = "gradient",
  specialtyColor,
  rounded = "md",
}: {
  name: string;
  variant?: "gradient" | "solid";
  specialtyColor?: string;
  rounded?: "md" | "full";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center text-[11px] font-bold text-white",
        rounded === "full" ? "rounded-full" : "rounded-[9px]",
        variant === "gradient" && "gi-gradient-cta",
      )}
      style={{
        width: 36,
        height: 36,
        ...(variant === "solid" && specialtyColor
          ? { background: specialtyColor }
          : {}),
      }}
    >
      {initials}
    </div>
  );
}
