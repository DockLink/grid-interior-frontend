"use client";

import { PHASE_CFG, PHASES } from "@/lib/projects/design-tokens";

import { MaterialIcon } from "./material-icon";

export function PhaseStepper({ currentPhaseIndex }: { currentPhaseIndex: number }) {
  const progressPct = Math.min(100, (currentPhaseIndex / (PHASES.length - 1)) * 100);

  return (
    <div className="neu-card mb-6 rounded-2xl bg-white px-7 py-5">
      <div className="relative flex items-center justify-between">
        <div
          className="absolute top-1/2 z-0 h-[3px] -translate-y-1/2 rounded-sm bg-[var(--figma-gray100)]"
          style={{ left: "4.2%", right: "4.2%" }}
        >
          <div
            className="h-full rounded-sm transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, var(--figma-teal), var(--figma-navy))",
            }}
          />
        </div>

        {PHASES.map((phase, idx) => {
          const cfg = PHASE_CFG[phase];
          const done = idx < currentPhaseIndex;
          const cur = idx === currentPhaseIndex;
          const fut = idx > currentPhaseIndex;

          return (
            <div key={phase} className="relative z-[1] flex flex-1 flex-col items-center gap-2.5">
              <div
                className="relative flex size-11 items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: done
                    ? "linear-gradient(135deg, #3FA66B, #34d068)"
                    : cur
                      ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))"
                      : "#fff",
                  border: fut ? "2px solid var(--figma-border)" : "none",
                  boxShadow: done || cur ? "var(--neu-raised)" : "var(--neu-inset)",
                }}
              >
                {done ? (
                  <MaterialIcon name="check" size={20} className="text-white" />
                ) : (
                  <MaterialIcon
                    name={cfg.icon}
                    outlined={!cur}
                    size={20}
                    className={cur ? "text-white" : "text-[var(--figma-gray200)]"}
                  />
                )}
                {cur && (
                  <div
                    className="hub-pulse-ring absolute rounded-full border-2 border-[var(--figma-teal)]"
                    style={{ inset: -4 }}
                  />
                )}
              </div>
              <div
                className="whitespace-nowrap text-center text-[11px]"
                style={{
                  fontWeight: cur ? 700 : done ? 500 : 400,
                  color: cur ? "var(--figma-navy)" : done ? "var(--figma-teal)" : "var(--figma-gray400)",
                }}
              >
                {cfg.short}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
