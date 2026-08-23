"use client";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import type { PaidTab } from "@/types/consultation";

const TABS: { id: PaidTab; label: string; icon: string }[] = [
  { id: "questionnaire", label: "Questionnaire", icon: "quiz" },
  { id: "site", label: "Site Visit & Measurements", icon: "straighten" },
  { id: "inventory", label: "Inventory List", icon: "inventory_2" },
  { id: "notes", label: "Notes & Thread", icon: "forum" },
  { id: "audio", label: "Audio", icon: "mic" },
];

export function PaidTabNav({ tab, setTab }: { tab: PaidTab; setTab: (t: PaidTab) => void }) {
  return (
    <div className="mb-7 flex gap-1 overflow-x-auto border-b border-[var(--figma-border)] pb-3">
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex shrink-0 cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-[22px] border-none px-4 py-2 text-[13px] transition-all duration-150"
            style={{
              background: active ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))" : "transparent",
              color: active ? "#fff" : "var(--figma-gray500)",
              fontWeight: active ? 600 : 400,
              boxShadow: active ? "var(--neu-raised)" : "none",
            }}
          >
            <MaterialIcon name={t.icon} outlined={!active} size={15} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
