"use client";

import { useState } from "react";

import { MaterialIcon } from "./material-icon";

export function HubFilterSelect({
  value,
  onChange,
  options,
  icon,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  icon: string;
  label: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative shrink-0">
      <MaterialIcon
        name={icon}
        outlined
        size={15}
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
        style={{ color: focused ? "var(--figma-teal)" : "var(--figma-gray400)" }}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="hub-input-focus cursor-pointer appearance-none rounded-[10px] border bg-white py-2 pr-8 pl-[30px] text-[13px] text-[var(--figma-navy)] outline-none transition-all duration-150"
        style={{
          borderColor: focused ? "var(--figma-teal)" : "var(--figma-border)",
          borderWidth: focused ? 2 : 1.5,
          boxShadow: focused ? "var(--neu-inset), 0 0 0 3px rgba(14,124,134,0.08)" : "var(--neu-inset)",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "All" ? `${label}: All` : o}
          </option>
        ))}
      </select>
      <MaterialIcon
        name="expand_more"
        outlined
        size={15}
        className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[var(--figma-gray400)]"
      />
    </div>
  );
}

export function HubPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 border-t border-[var(--figma-border)] px-5 py-3.5">
      <PageBtn icon label="chevron_left" disabled={page === 1} onClick={() => onPageChange(page - 1)} />
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
        <PageBtn key={pg} label={String(pg)} active={pg === page} onClick={() => onPageChange(pg)} />
      ))}
      <PageBtn
        icon
        label="chevron_right"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </div>
  );
}

function PageBtn({
  label,
  active = false,
  disabled = false,
  onClick,
  icon = false,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex size-8 items-center justify-center rounded-lg border-none font-[inherit] transition-all duration-120"
      style={{
        background: active
          ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))"
          : hover && !disabled
            ? "var(--figma-gray100)"
            : "transparent",
        color: active ? "#fff" : disabled ? "var(--figma-gray200)" : "var(--figma-gray500)",
        cursor: disabled ? "default" : "pointer",
        fontWeight: active ? 700 : 400,
        fontSize: icon ? 0 : 13,
        boxShadow: active ? "var(--neu-raised)" : "none",
      }}
    >
      {icon ? <MaterialIcon name={label} outlined size={18} /> : label}
    </button>
  );
}
