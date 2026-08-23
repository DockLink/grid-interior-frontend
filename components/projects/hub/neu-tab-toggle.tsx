"use client";

import { MaterialIcon } from "./material-icon";

export function NeuTabToggle<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; icon: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      className="inline-flex gap-0.5 rounded-[14px] p-1 neu-inset"
      style={{ background: "var(--figma-gray100)" }}
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 rounded-[10px] border-none px-[18px] py-2 text-[13px] transition-all duration-180"
            style={{
              background: active ? "#fff" : "transparent",
              color: active ? "var(--figma-navy)" : "var(--figma-gray500)",
              fontWeight: active ? 600 : 400,
              boxShadow: active ? "var(--neu-raised)" : "none",
            }}
          >
            <MaterialIcon
              name={tab.icon}
              outlined={!active}
              size={16}
              className={active ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
            />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
