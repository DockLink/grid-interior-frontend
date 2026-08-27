"use client";

import { useMemo, useSyncExternalStore } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  SectionCard,
  WorkspaceBreadcrumb,
} from "@/components/projects/hub/shared/workspace-ui";
import {
  cycleSiteSubstageStatus,
  formatSiteDayDate,
  getSiteSubstagesSnapshot,
  resolveSiteSubstages,
  SITE_TOTAL_DAYS,
  subscribeSiteSubstages,
} from "@/lib/projects/mock-execution";
import { cn } from "@/lib/utils";
import type { SiteSubStage, SiteSubStageStatus } from "@/types/execution";
import type { ActiveProjectView } from "@/types/project-hub";

const STATUS_CFG: Record<
  SiteSubStageStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  complete: {
    label: "Complete",
    color: "#3FA66B",
    bg: "#DCFCE7",
    icon: "check_circle",
  },
  "in-progress": {
    label: "In Progress",
    color: "#0E7C86",
    bg: "#CCFBF1",
    icon: "timelapse",
  },
  upcoming: {
    label: "Upcoming",
    color: "#9CA3AF",
    bg: "#F3F4F6",
    icon: "schedule",
  },
  blocked: {
    label: "Blocked",
    color: "#EF4444",
    bg: "#FEE2E2",
    icon: "lock",
  },
};

const BAR_COLORS = [
  "#1B2A4A",
  "#0E7C86",
  "#7C3AED",
  "#D97706",
  "#0891B2",
  "#BE185D",
  "#EF4444",
  "#8B5CF6",
  "#3FA66B",
  "#F59E0B",
  "#0284C7",
  "#64748B",
  "#0E7C86",
];

function useSiteSubstages(): SiteSubStage[] {
  return useSyncExternalStore(
    subscribeSiteSubstages,
    getSiteSubstagesSnapshot,
    getSiteSubstagesSnapshot,
  );
}

export function SiteSubstagesScreen({
  project,
  onBack,
}: {
  project: ActiveProjectView;
  onBack: () => void;
}) {
  const stages = useSiteSubstages();

  const resolved = useMemo(() => resolveSiteSubstages(stages), [stages]);

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <WorkspaceBreadcrumb
        items={["Projects", project.name, "Execution", "Site"]}
        onBack={onBack}
      />

      <div className="mb-6">
        <h1 className="m-0 mb-1 text-[24px] font-bold text-[var(--figma-navy)] sm:text-[28px]">
          Site Execution
        </h1>
        <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
          Sub-stages 6.1–6.13 · overlapping timelines · two mandatory deep cleans ·
          updates sync to Timeline Client View
        </p>
      </div>

      <SectionCard className="mb-5 overflow-x-auto px-4 py-4 sm:px-5">
        <div className="mb-3 flex items-center gap-2">
          <MaterialIcon
            name="view_timeline"
            outlined
            size={18}
            className="text-[var(--figma-teal)]"
          />
          <span className="text-sm font-semibold text-[var(--figma-navy)]">
            Parallel timeline
          </span>
          <span className="text-[11px] text-[var(--figma-gray400)]">
            Day 1 → Day {SITE_TOTAL_DAYS}
          </span>
        </div>
        <div className="min-w-[640px]">
          {resolved.map((s, i) => {
            const left = ((s.startDay - 1) / SITE_TOTAL_DAYS) * 100;
            const width = (s.durationDays / SITE_TOTAL_DAYS) * 100;
            const sc = STATUS_CFG[s.status];
            return (
              <div key={s.id} className="mb-1.5 flex items-center gap-2">
                <div className="w-[42px] shrink-0 text-[10px] font-bold text-[var(--figma-gray400)]">
                  {s.number}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-[var(--figma-gray100)]">
                  <div
                    className="absolute top-0 h-full rounded-md"
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 2)}%`,
                      background:
                        s.status === "blocked" ? "#FCA5A5" : BAR_COLORS[i],
                      opacity: s.status === "upcoming" ? 0.35 : 0.9,
                    }}
                    title={`${s.name} · days ${s.startDay}–${s.startDay + s.durationDays - 1}`}
                  />
                </div>
                <div
                  className="w-[88px] shrink-0 text-right text-[10px] font-medium"
                  style={{ color: sc.color }}
                >
                  {sc.label}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {resolved.map((s) => {
          const sc = STATUS_CFG[s.status];
          const locked = s.status === "blocked";
          return (
            <div
              key={s.id}
              className="flex flex-col rounded-2xl bg-white px-4 py-4 sm:px-5"
              style={{
                boxShadow: "var(--neu-card)",
                borderLeft: `3px solid ${s.checkpoint ? "#EF4444" : sc.color}`,
              }}
            >
              <div className="mb-3 flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => cycleSiteSubstageStatus(s.id)}
                  disabled={locked}
                  className={cn(
                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[11px] border-none",
                    locked ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                  style={{ background: sc.bg, color: sc.color }}
                  title={
                    locked
                      ? `Complete Deep Clean ${s.blockedBy} first`
                      : "Cycle status"
                  }
                >
                  <MaterialIcon
                    name={sc.icon}
                    outlined={s.status !== "complete"}
                    size={20}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wide text-[var(--figma-gray400)]">
                      {s.number}
                    </span>
                    {s.checkpoint && (
                      <span className="rounded-md bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-semibold text-[#EF4444]">
                        Checkpoint
                      </span>
                    )}
                  </div>
                  <h3 className="m-0 text-[14px] font-bold leading-snug text-[var(--figma-navy)]">
                    {s.name}
                  </h3>
                </div>
              </div>

              <p className="m-0 mb-3 flex-1 text-[12px] leading-relaxed text-[var(--figma-gray500)]">
                {s.detail}
              </p>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-[var(--figma-navy)]">
                  {formatSiteDayDate(s.startDay)}
                  <span className="ml-1.5 font-normal text-[var(--figma-gray400)]">
                    · {s.durationDays}d
                  </span>
                </div>
                <span
                  className="shrink-0 rounded-lg px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{ color: sc.color, background: sc.bg }}
                >
                  {sc.label}
                </span>
              </div>
              {locked && s.blockedBy ? (
                <div className="mt-2 text-[10px] text-[#EF4444]">
                  Blocked until {s.blockedBy} is complete
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
