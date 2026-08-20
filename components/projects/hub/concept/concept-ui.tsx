"use client";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";
import type { ConceptStage } from "@/types/concept";

export function StageTabToggle({
  stage,
  setStage,
}: {
  stage: ConceptStage;
  setStage: (s: ConceptStage) => void;
}) {
  return (
    <div
      className="relative inline-flex gap-[3px] rounded-[28px] p-1 neu-inset"
      style={{ background: "var(--figma-gray100)" }}
    >
      <div
        className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-[22px] transition-[left] duration-[260ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] gi-gradient-cta"
        style={{
          left: stage === "render" ? "calc(50%)" : "4px",
          boxShadow: "var(--neu-raised)",
        }}
      />
      {(["nonrender", "render"] as ConceptStage[]).map((s) => {
        const active = stage === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => setStage(s)}
            className={cn(
              "relative z-[1] flex flex-1 cursor-pointer items-center gap-[7px] whitespace-nowrap border-none bg-transparent px-[22px] py-[9px] text-[13px] transition-colors duration-200",
              active ? "font-bold text-white" : "font-normal text-[var(--figma-gray400)]",
            )}
          >
            <MaterialIcon
              name={s === "nonrender" ? "photo_library" : "view_in_ar"}
              outlined={!active}
              size={16}
            />
            {s === "nonrender" ? "Non-Render" : "Render"}
          </button>
        );
      })}
    </div>
  );
}
