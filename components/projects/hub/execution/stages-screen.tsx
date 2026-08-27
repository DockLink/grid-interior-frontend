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

const END_ACCENT = { color: "#B45309", bg: "#FEF3C7" };

function StageCard({
  stage,
  onStatus,
  onOpenBoq,
  onOpenSite,
  disabled,
}: {
  stage: ExecutionStage;
  onStatus: (status: ExecutionStageStatus) => void;
  onOpenBoq: () => void;
  onOpenSite: () => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const sc = STATUS_CFG[stage.status];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "rounded-2xl bg-white px-5 py-5 transition-all duration-200",
        disabled && "opacity-55",
      )}
      style={{
        boxShadow: hover && !disabled ? "var(--neu-card-hover)" : "var(--neu-card)",
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
            disabled={disabled}
            onClick={() => onStatus(s)}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-150 disabled:cursor-not-allowed",
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
            disabled={disabled}
            onClick={onOpenBoq}
            className="ml-auto cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[var(--figma-teal)] disabled:cursor-not-allowed"
          >
            Open BOQ →
          </button>
        )}
        {stage.id === 6 && (
          <button
            type="button"
            disabled={disabled}
            onClick={onOpenSite}
            className="ml-auto cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[var(--figma-teal)] disabled:cursor-not-allowed"
          >
            Open site sub-stages →
          </button>
        )}
      </div>
    </div>
  );
}

function EndProjectCard({
  ended,
  onRequestEnd,
  onReopen,
}: {
  ended: boolean;
  onRequestEnd: () => void;
  onReopen: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-2xl bg-white px-5 py-5 transition-all duration-200"
      style={{
        boxShadow: hover ? "var(--neu-card-hover)" : "var(--neu-card)",
        borderLeft: `3px solid ${ended ? "#9CA3AF" : END_ACCENT.color}`,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[11px] neu-inset"
            style={{ background: ended ? "#F3F4F6" : END_ACCENT.bg }}
          >
            <MaterialIcon
              name={ended ? "check_circle" : "stop_circle"}
              outlined
              size={20}
              style={{ color: ended ? "#9CA3AF" : END_ACCENT.color }}
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-[var(--figma-gray400)]">
              OPTION
            </div>
            <h3 className="m-0 text-[15px] font-bold text-[var(--figma-navy)]">End Project</h3>
          </div>
        </div>
        <span
          className="shrink-0 rounded-lg px-2.5 py-0.5 text-[10px] font-semibold"
          style={{
            color: ended ? "#6B7280" : END_ACCENT.color,
            background: ended ? "#F3F4F6" : END_ACCENT.bg,
          }}
        >
          {ended ? "Ended" : "Available"}
        </span>
      </div>
      <p className="m-0 mb-4 text-[13px] leading-relaxed text-[var(--figma-gray500)]">
        After the BOQ is sent, the client may choose not to proceed with the deal. Use this to close
        the project at BOQ stage. If the deal is given, BOQ development remains a paid service.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {ended ? (
          <button
            type="button"
            onClick={onReopen}
            className="cursor-pointer rounded-full border border-[var(--figma-border)] px-3 py-1 text-[11px] font-medium text-[var(--figma-gray500)] transition-all duration-150 hover:border-[var(--figma-teal)] hover:text-[var(--figma-teal)]"
          >
            Reopen project
          </button>
        ) : (
          <button
            type="button"
            onClick={onRequestEnd}
            className="cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold transition-all duration-150"
            style={{
              color: END_ACCENT.color,
              background: END_ACCENT.bg,
              borderColor: END_ACCENT.color,
            }}
          >
            End project
          </button>
        )}
      </div>
    </div>
  );
}

function EndProjectConfirmModal({
  projectName,
  onCancel,
  onConfirm,
}: {
  projectName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-5 backdrop-blur-[3px]"
      style={{ background: "rgba(27,42,74,0.20)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full max-w-[440px] rounded-[20px] bg-white px-8 py-7"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-5 flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[11px]"
            style={{ background: END_ACCENT.bg }}
          >
            <MaterialIcon name="stop_circle" outlined size={22} style={{ color: END_ACCENT.color }} />
          </div>
          <div>
            <h2 className="m-0 mb-1 text-lg font-bold text-[var(--figma-navy)]">End project?</h2>
            <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">
              Close <span className="font-semibold text-[var(--figma-navy)]">{projectName}</span> after
              BOQ. Further execution stages will be paused. If a deal was given, BOQ development stays
              billable.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <OutlineBtn label="Cancel" onClick={onCancel} small />
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-3xl border-none px-4 py-[7px] text-xs font-semibold text-white transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #92400E, #B45309)" }}
          >
            <MaterialIcon name="stop_circle" outlined size={14} />
            End project
          </button>
        </div>
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
  const [projectEnded, setProjectEnded] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const done = stages.filter((s) => s.status === "complete").length;
  const boqStage = stages.find((s) => s.id === 1)!;
  const laterStages = stages.filter((s) => s.id !== 1);

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
            {projectEnded ? " · project ended after BOQ" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OutlineBtn label="BOQ Line Items" icon="receipt_long" onClick={onOpenBoq} />
          <GradientBtn
            label="Site Sub-Stages"
            icon="construction"
            onClick={onOpenSite}
            disabled={projectEnded}
          />
        </div>
      </div>

      {projectEnded && (
        <SectionCard className="mb-5 px-5 py-4" style={{ borderLeft: `3px solid ${END_ACCENT.color}` }}>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: END_ACCENT.bg }}
            >
              <MaterialIcon name="info" outlined size={18} style={{ color: END_ACCENT.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[13px] font-semibold text-[var(--figma-navy)]">
                Project ended after BOQ
              </p>
              <p className="m-0 mt-0.5 text-[12px] text-[var(--figma-gray500)]">
                Client did not proceed with the deal. BOQ development remains a paid service if a deal
                was given.
              </p>
            </div>
          </div>
        </SectionCard>
      )}

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
        <StageCard
          stage={boqStage}
          disabled={projectEnded}
          onStatus={(status) =>
            setStages((prev) => prev.map((s) => (s.id === boqStage.id ? { ...s, status } : s)))
          }
          onOpenBoq={onOpenBoq}
          onOpenSite={onOpenSite}
        />
        <EndProjectCard
          ended={projectEnded}
          onRequestEnd={() => setConfirmEnd(true)}
          onReopen={() => setProjectEnded(false)}
        />
        {laterStages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            disabled={projectEnded}
            onStatus={(status) =>
              setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, status } : s)))
            }
            onOpenBoq={onOpenBoq}
            onOpenSite={onOpenSite}
          />
        ))}
      </div>

      {confirmEnd && (
        <EndProjectConfirmModal
          projectName={project.name}
          onCancel={() => setConfirmEnd(false)}
          onConfirm={() => {
            setProjectEnded(true);
            setConfirmEnd(false);
            setStages((prev) =>
              prev.map((s) =>
                s.id === 1
                  ? s
                  : s.status === "complete"
                    ? s
                    : { ...s, status: "upcoming" as ExecutionStageStatus },
              ),
            );
          }}
        />
      )}
    </div>
  );
}
