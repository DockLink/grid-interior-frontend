"use client";

import { useMemo } from "react";

import { useAuth } from "@/hooks/use-auth";
import { usePanelDismiss } from "@/hooks/use-panel-dismiss";

/** Filter panel rows by ids dismissed via "All clear". */
export function useClearedPanelItems<T extends { id: string | number }>(
  items: T[],
  storageKey: string,
) {
  const { user } = useAuth();
  const key = `${storageKey}:${user?.id ?? "anon"}`;
  const { filterVisible, dismissAll } = usePanelDismiss(key);
  const visible = useMemo(() => filterVisible(items), [filterVisible, items]);
  return {
    visible,
    clearAll: () => dismissAll(visible.map((item) => item.id)),
  };
}

/** Clickable "All clear" when rows exist; status chip when the list is empty. */
export function AllClearControl({
  canClear,
  onClear,
  activeLabel,
  activeTone = "amber",
}: {
  canClear: boolean;
  onClear: () => void;
  activeLabel?: string;
  activeTone?: "amber" | "rose";
}) {
  const activeBg = activeTone === "rose" ? "#FDECEC" : "rgba(217,119,6,0.12)";
  const activeColor = activeTone === "rose" ? "#FF6B6B" : "#D97706";

  if (!canClear) {
    return (
      <span
        role="status"
        className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{ background: "#E7F9EE", color: "#2FBE6B" }}
      >
        All clear
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {activeLabel ? (
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: activeBg, color: activeColor }}
        >
          {activeLabel}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onClear}
        className="rounded-full border border-[#0FA8A0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0FA8A0] transition-colors hover:bg-[#E6F7F7]"
        title="Dismiss these items from the dashboard"
      >
        All clear
      </button>
    </div>
  );
}
