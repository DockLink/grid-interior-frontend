"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";
import type { ModeType } from "@/types/consultation";

export function SectionCard({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("mb-5 rounded-2xl bg-white px-6 py-[22px]", className)}
      style={{ boxShadow: "var(--neu-card)", ...style }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  icon,
  title,
  right,
}: {
  icon: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-[18px] flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <MaterialIcon name={icon} outlined size={18} className="text-[var(--figma-teal)]" />
        <span className="text-[15px] font-bold tracking-tight text-[var(--figma-navy)]">{title}</span>
      </div>
      {right}
    </div>
  );
}

export function NeuTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[13px] font-medium text-[var(--figma-navy)]">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "box-border w-full resize-y rounded-[10px] bg-white px-3.5 py-[11px] text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none transition-all duration-150",
          focused ? "border-2 border-[var(--figma-teal)] hub-input-focus" : "border-[1.5px] border-[var(--figma-border)] neu-inset",
        )}
      />
      <div className="text-right text-[11px] text-[var(--figma-gray400)]">{value.length} chars</div>
    </div>
  );
}

export function GradientBtn({
  label,
  icon,
  onClick,
  disabled = false,
  small = false,
}: {
  label: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [prs, setPrs] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
        setPrs(false);
      }}
      onMouseDown={() => setPrs(true)}
      onMouseUp={() => setPrs(false)}
      className={cn(
        "inline-flex items-center gap-[7px] rounded-3xl border-none font-semibold transition-all duration-150 ease-in-out",
        small ? "px-[18px] py-2 text-xs" : "px-[26px] py-[11px] text-sm",
        disabled ? "cursor-default bg-[var(--figma-gray100)] text-[var(--figma-gray400)]" : "gi-gradient-cta cursor-pointer text-white",
      )}
      style={{
        transform: prs ? "scale(0.98)" : hov && !disabled ? "scale(1.01)" : "scale(1)",
        boxShadow: disabled ? "none" : prs ? "var(--neu-inset)" : hov ? "var(--neu-raised-hover)" : undefined,
      }}
    >
      {icon && <MaterialIcon name={icon} outlined size={small ? 15 : 17} />}
      {label}
    </button>
  );
}

export function OutlineBtn({
  label,
  icon,
  onClick,
  color = "var(--figma-teal)",
  small = false,
}: {
  label: string;
  icon?: string;
  onClick?: () => void;
  color?: string;
  small?: boolean;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        "inline-flex cursor-pointer items-center gap-[7px] rounded-3xl border-[1.5px] font-semibold transition-all duration-150",
        small ? "px-4 py-[7px] text-xs" : "px-[22px] py-2.5 text-sm",
      )}
      style={{
        borderColor: color,
        color,
        background: hov ? `${color}08` : "#fff",
        boxShadow: "var(--neu-raised)",
      }}
    >
      {icon && <MaterialIcon name={icon} outlined size={small ? 15 : 17} />}
      {label}
    </button>
  );
}

export function ModeBadge({ mode }: { mode: ModeType }) {
  const isOnline = mode === "online";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-[3px] text-[11px] font-semibold"
      style={{
        color: isOnline ? "#0284C7" : "#D97706",
        background: isOnline ? "#E0F2FE" : "#FEF3C7",
      }}
    >
      <MaterialIcon name={isOnline ? "videocam" : "location_on"} outlined size={13} />
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

export function TaskBadge({ status }: { status: string }) {
  const cfg =
    status === "Done"
      ? { color: "#3FA66B", bg: "#DCFCE7" }
      : status === "In Progress"
        ? { color: "var(--figma-teal)", bg: "#CCFBF1" }
        : { color: "var(--figma-gray500)", bg: "var(--figma-gray100)" };

  return (
    <span
      className="rounded-[10px] px-2 py-0.5 text-[10px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {status}
    </span>
  );
}

export function ModePillToggle({ mode, setMode }: { mode: ModeType; setMode: (m: ModeType) => void }) {
  return (
    <div
      className="inline-flex gap-[3px] rounded-3xl p-1 neu-inset"
      style={{ background: "var(--figma-gray100)" }}
    >
      {(["online", "offline"] as ModeType[]).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-[20px] border-none px-4 py-[7px] text-xs transition-all duration-[180ms]",
              active ? "font-semibold text-[var(--figma-navy)]" : "font-normal text-[var(--figma-gray400)]",
            )}
            style={{
              background: active ? "#fff" : "transparent",
              boxShadow: active ? "var(--neu-raised)" : "none",
            }}
          >
            <MaterialIcon
              name={m === "online" ? "videocam" : "location_on"}
              outlined
              size={15}
              className={active ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
            />
            {m === "online" ? "Online" : "Offline"}
          </button>
        );
      })}
    </div>
  );
}

export function PillSwitch({
  on,
  setOn,
  label,
}: {
  on: boolean;
  setOn: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "text-xs transition-colors duration-150",
          on ? "font-semibold text-[var(--figma-navy)]" : "font-normal text-[var(--figma-gray400)]",
        )}
      >
        {label}
      </span>
      <div
        role="switch"
        aria-checked={on}
        tabIndex={0}
        onClick={() => setOn(!on)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOn(!on);
          }
        }}
        className="relative h-6 w-11 cursor-pointer rounded-xl transition-all duration-[250ms]"
        style={{
          background: on ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))" : "var(--figma-gray200)",
          boxShadow: on ? "var(--neu-raised)" : "var(--neu-inset)",
        }}
      >
        <div
          className="absolute top-[3px] size-[18px] rounded-full bg-white transition-[left] duration-[250ms]"
          style={{
            left: on ? 23 : 3,
            boxShadow: "2px 2px 6px rgba(163,177,198,0.5)",
          }}
        />
      </div>
    </div>
  );
}
