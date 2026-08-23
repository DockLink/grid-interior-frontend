"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  GradientBtn,
  OutlineBtn,
  SectionCard,
  WorkspaceBreadcrumb,
} from "@/components/projects/hub/shared/workspace-ui";
import { EXECUTION_STAGES } from "@/lib/projects/mock-execution";
import { cn } from "@/lib/utils";
import type { ExecutionStage, ExecutionStageStatus } from "@/types/execution";
import type { ActiveProjectView } from "@/types/project-hub";

const STATUS_CFG: Record<ExecutionStageStatus, { label: string; color: string; bg: string }> = {
  complete: { label: "Complete", color: "#3FA66B", bg: "#DCFCE7" },
  "in-progress": { label: "In Progress", color: "#0E7C86", bg: "#CCFBF1" },
  upcoming: { label: "Upcoming", color: "#9CA3AF", bg: "#F3F4F6" },
};

function StageCard({
  stage,
  onStatus,
  onOpenBoq,
  onOpenSite,
}: {
  stage: ExecutionStage;
  onStatus: (status: ExecutionStageStatus) => void;
  onOpenBoq: () => void;
  onOpenSite: () => void;
}) {
  const [hover, setHover] = useState(false);
  const sc = STATUS_CFG[stage.status];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-2xl bg-white px-5 py-5 transition-all duration-200"
      style={{
        boxShadow: hover ? "var(--neu-card-hover)" : "var(--neu-card)",
        borderLeft: `3px solid ${sc.color}`,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[11px] neu-inset"
            style={{ background: sc.bg }}
          >
            <MaterialIcon name={stage.icon} outlined size={20} style={{ color: sc.color }} />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-[var(--figma-gray400)]">
              STAGE {stage.id}
            </div>
            <h3 className="m-0 text-[15px] font-bold text-[var(--figma-navy)]">{stage.name}</h3>
          </div>
        </div>
        <span
          className="shrink-0 rounded-lg px-2.5 py-0.5 text-[10px] font-semibold"
          style={{ color: sc.color, background: sc.bg }}
        >
          {sc.label}
        </span>
      </div>
      <p className="m-0 mb-4 text-[13px] leading-relaxed text-[var(--figma-gray500)]">{stage.detail}</p>
      <div className="flex flex-wrap items-center gap-2">
        {(["upcoming", "in-progress", "complete"] as ExecutionStageStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatus(s)}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-150",
              stage.status === s ? "font-semibold" : "border-[var(--figma-border)] text-[var(--figma-gray400)]",
            )}
            style={
              stage.status === s
                ? { color: STATUS_CFG[s].color, background: STATUS_CFG[s].bg, borderColor: STATUS_CFG[s].color }
                : undefined
            }
          >
            {STATUS_CFG[s].label}
          </button>
        ))}
        {stage.id === 1 && (
          <button
            type="button"
            onClick={onOpenBoq}
            className="ml-auto cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[var(--figma-teal)]"
          >
            Open BOQ →
          </button>
        )}
        {stage.id === 6 && (
          <button
            type="button"
            onClick={onOpenSite}
            className="ml-auto cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[var(--figma-teal)]"
          >
            Open site sub-stages →
          </button>
        )}
      </div>
    </div>
  );
}

export function StagesScreen({
  project,
  onBack,
  onOpenBoq,
  onOpenSite,
}: {
  project: ActiveProjectView;
  onBack: () => void;
  onOpenBoq: () => void;
  onOpenSite: () => void;
}) {
  const [stages, setStages] = useState(EXECUTION_STAGES);
  const done = stages.filter((s) => s.status === "complete").length;

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <WorkspaceBreadcrumb items={["Projects", project.name, "Execution"]} onBack={onBack} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 mb-1 text-[24px] font-bold text-[var(--figma-navy)] sm:text-[28px]">
            Execution
          </h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
            Six-stage workflow · timelines may overlap · {done} of {stages.length} complete
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OutlineBtn label="BOQ Line Items" icon="receipt_long" onClick={onOpenBoq} />
          <GradientBtn label="Site Sub-Stages" icon="construction" onClick={onOpenSite} />
        </div>
      </div>

      <SectionCard className="mb-5 px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--figma-gray500)]">
          <span>Stage progress</span>
          <span className="font-semibold text-[var(--figma-navy)]">
            {Math.round((done / stages.length) * 100)}%
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-[var(--figma-gray100)]">
          {stages.map((s) => (
            <div
              key={s.id}
              className="h-full flex-1 border-r border-white last:border-r-0"
              style={{
                background:
                  s.status === "complete"
                    ? "#3FA66B"
                    : s.status === "in-progress"
                      ? "#0E7C86"
                      : "transparent",
              }}
            />
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            onStatus={(status) =>
              setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, status } : s)))
            }
            onOpenBoq={onOpenBoq}
            onOpenSite={onOpenSite}
          />
        ))}
      </div>
    </div>
  );
}
