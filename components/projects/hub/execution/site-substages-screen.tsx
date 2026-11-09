"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useOptionalProjectContext } from "@/components/projects/project-context";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  SectionCard,
  WorkspaceBreadcrumb,
} from "@/components/projects/hub/shared/workspace-ui";
import { useSiteSubstages } from "@/hooks/use-execution";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { handleApiError } from "@/lib/api/handle-api-error";
import { calendarDateFromApi } from "@/lib/projects/calendar-date";
import {
  formatSiteDayDate,
  getSiteExecutionProgress,
  isoToSiteDay,
  resolveSiteSubstages,
  SITE_EXECUTION_START_ISO,
  siteDayToIso,
} from "@/lib/projects/mock-execution";
import { isSiteExecutionPhase } from "@/lib/timeline/map-client-view";
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

const EDITABLE_STATUSES: SiteSubStageStatus[] = [
  "upcoming",
  "in-progress",
  "complete",
];

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

type DragMode = "move" | "resize";

interface DragState {
  id: string;
  mode: DragMode;
  originX: number;
  originStartDay: number;
  originDuration: number;
  trackWidth: number;
}

function dayTicks(totalDays: number): number[] {
  const ticks: number[] = [];
  for (let d = 1; d <= totalDays; d += 7) ticks.push(d);
  if (ticks[ticks.length - 1] !== totalDays) ticks.push(totalDays);
  return ticks;
}

export function SiteSubstagesScreen({
  project,
  onBack,
}: {
  project: ActiveProjectView;
  onBack: () => void;
}) {
  const projectCtx = useOptionalProjectContext();
  const { tasks: stages } = useProjectTaskables(project.id, "STAGE", {
    limit: 100,
  });
  const {
    substages,
    totalDays,
    updateSubstage,
    isLoading,
    error,
    isMutating,
  } = useSiteSubstages(project.id);

  const resolved = useMemo(
    () => resolveSiteSubstages(substages),
    [substages],
  );

  const anchorIso = useMemo(() => {
    const siteStage = stages.find((t) => isSiteExecutionPhase(t.title));
    const fromStage = siteStage?.start_date
      ? calendarDateFromApi(siteStage.start_date)
      : "";
    if (fromStage) return fromStage;
    const fromProject = projectCtx?.project?.start_date
      ? calendarDateFromApi(projectCtx.project.start_date)
      : "";
    if (fromProject) return fromProject;
    return SITE_EXECUTION_START_ISO;
  }, [stages, projectCtx?.project?.start_date]);

  const progress = useMemo(
    () => getSiteExecutionProgress(resolved),
    [resolved],
  );

  const [drafts, setDrafts] = useState<
    Record<string, { startDay: number; durationDays: number }>
  >({});
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const trackRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  const displayOf = useCallback(
    (s: SiteSubStage) => {
      const draft = drafts[s.id];
      return {
        startDay: draft?.startDay ?? s.startDay,
        durationDays: draft?.durationDays ?? s.durationDays,
      };
    },
    [drafts],
  );

  const persist = useCallback(
    async (
      stage: SiteSubStage,
      payload: {
        status?: SiteSubStageStatus;
        start_day?: number;
        duration_days?: number;
      },
    ) => {
      if (stage.status === "blocked") return;
      try {
        await updateSubstage(stage.id, payload);
      } catch (err) {
        handleApiError(err, { toast: true });
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[stage.id];
          return next;
        });
      }
    },
    [updateSubstage],
  );

  const onStatusChange = (stage: SiteSubStage, status: SiteSubStageStatus) => {
    if (stage.status === "blocked" || status === "blocked") return;
    void persist(stage, { status });
  };

  const onStartDateChange = (stage: SiteSubStage, iso: string) => {
    if (!iso || stage.status === "blocked") return;
    const startDay = isoToSiteDay(iso, anchorIso);
    setDrafts((prev) => ({
      ...prev,
      [stage.id]: {
        startDay,
        durationDays: displayOf(stage).durationDays,
      },
    }));
    void persist(stage, { start_day: startDay }).then(() => {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[stage.id];
        return next;
      });
    });
  };

  const onDurationChange = (stage: SiteSubStage, raw: string) => {
    if (stage.status === "blocked") return;
    const durationDays = Math.max(1, Math.round(Number(raw)) || 1);
    setDrafts((prev) => ({
      ...prev,
      [stage.id]: {
        startDay: displayOf(stage).startDay,
        durationDays,
      },
    }));
  };

  const onDurationCommit = (stage: SiteSubStage) => {
    if (stage.status === "blocked") return;
    const durationDays = displayOf(stage).durationDays;
    void persist(stage, { duration_days: durationDays }).then(() => {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[stage.id];
        return next;
      });
    });
  };

  const beginDrag = (
    stage: SiteSubStage,
    mode: DragMode,
    e: ReactPointerEvent<HTMLElement>,
  ) => {
    if (stage.status === "blocked") return;
    const track = trackRefs.current[stage.id];
    if (!track) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const display = displayOf(stage);
    const next: DragState = {
      id: stage.id,
      mode,
      originX: e.clientX,
      originStartDay: display.startDay,
      originDuration: display.durationDays,
      trackWidth: track.getBoundingClientRect().width,
    };
    dragRef.current = next;
    setDrag(next);
  };

  const onPointerMove = (stage: SiteSubStage, e: ReactPointerEvent<HTMLElement>) => {
    const state = dragRef.current;
    if (!state || state.id !== stage.id || state.trackWidth <= 0) return;
    const deltaDays = Math.round(
      ((e.clientX - state.originX) / state.trackWidth) * totalDays,
    );
    if (state.mode === "move") {
      const startDay = Math.max(
        1,
        Math.min(totalDays, state.originStartDay + deltaDays),
      );
      setDrafts((prev) => ({
        ...prev,
        [stage.id]: {
          startDay,
          durationDays: state.originDuration,
        },
      }));
      return;
    }
    const durationDays = Math.max(1, state.originDuration + deltaDays);
    setDrafts((prev) => ({
      ...prev,
      [stage.id]: {
        startDay: state.originStartDay,
        durationDays,
      },
    }));
  };

  const endDrag = (stage: SiteSubStage) => {
    const state = dragRef.current;
    if (!state || state.id !== stage.id) return;
    const display = displayOf(stage);
    dragRef.current = null;
    setDrag(null);
    const payload =
      state.mode === "move"
        ? { start_day: display.startDay }
        : { duration_days: display.durationDays };
    void persist(stage, payload).then(() => {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[stage.id];
        return next;
      });
    });
  };

  const ticks = useMemo(() => dayTicks(totalDays), [totalDays]);

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <WorkspaceBreadcrumb
        items={["Projects", project.name, "Execution", "Site"]}
        onBack={onBack}
      />

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-[24px] font-bold text-[var(--figma-navy)] sm:text-[28px]">
            Site Execution
          </h1>
          <span
            className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
            style={{
              color: progress.status === "completed" ? "#3FA66B" : "#0E7C86",
              background:
                progress.status === "completed" ? "#DCFCE7" : "#CCFBF1",
            }}
          >
            {progress.progress}% complete
          </span>
        </div>
        <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
          Sub-stages 6.1–6.13 · overlapping timelines · two mandatory deep cleans ·
          updates sync to Timeline
          {isLoading ? " · loading…" : ""}
          {isMutating ? " · saving…" : ""}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--figma-gray100)]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress.progress}%`,
              background: "linear-gradient(90deg, #1B2A4A, #0E7C86)",
            }}
          />
        </div>
      </div>

      {error ? (
        <SectionCard className="mb-5 px-4 py-5 sm:px-5">
          <p className="m-0 text-[13px] text-[#EF4444]">
            Could not load site sub-stages. {error}
          </p>
        </SectionCard>
      ) : null}

      {!isLoading && !error && resolved.length === 0 ? (
        <SectionCard className="mb-5 px-4 py-5 sm:px-5">
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
            No site sub-stages yet. They seed automatically when the Execution site
            API is available for this project.
          </p>
        </SectionCard>
      ) : null}

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
            Day 1 → Day {totalDays} · drag to move · resize from right edge
          </span>
        </div>
        <div className="min-w-[640px]">
          <div className="mb-2 ml-[50px] mr-[96px] relative h-4">
            {ticks.map((d) => (
              <span
                key={d}
                className="absolute top-0 -translate-x-1/2 text-[9px] font-medium text-[var(--figma-gray400)]"
                style={{ left: `${((d - 1) / totalDays) * 100}%` }}
              >
                D{d}
              </span>
            ))}
          </div>
          {resolved.map((s, i) => {
            const display = displayOf(s);
            const left = ((display.startDay - 1) / totalDays) * 100;
            const width = (display.durationDays / totalDays) * 100;
            const sc = STATUS_CFG[s.status];
            const locked = s.status === "blocked";
            return (
              <div key={s.id} className="mb-1.5 flex items-center gap-2">
                <div className="w-[42px] shrink-0 text-[10px] font-bold text-[var(--figma-gray400)]">
                  {s.number}
                </div>
                <div
                  ref={(el) => {
                    trackRefs.current[s.id] = el;
                  }}
                  className="relative h-6 flex-1 overflow-hidden rounded-md bg-[var(--figma-gray100)]"
                >
                  <div
                    className={cn(
                      "absolute top-0 h-full rounded-md",
                      locked ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
                    )}
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 2)}%`,
                      background:
                        s.status === "blocked" ? "#FCA5A5" : BAR_COLORS[i],
                      opacity: s.status === "upcoming" ? 0.35 : 0.9,
                      touchAction: "none",
                    }}
                    title={`${s.name} · days ${display.startDay}–${display.startDay + display.durationDays - 1}`}
                    onPointerDown={(e) => beginDrag(s, "move", e)}
                    onPointerMove={(e) => onPointerMove(s, e)}
                    onPointerUp={() => endDrag(s)}
                    onPointerCancel={() => endDrag(s)}
                  >
                    {!locked ? (
                      <span
                        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize rounded-r-md bg-black/20"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          beginDrag(s, "resize", e);
                        }}
                      />
                    ) : null}
                  </div>
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
          const display = displayOf(s);
          const startIso = siteDayToIso(display.startDay, anchorIso);
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
                <div
                  className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[11px]"
                  style={{ background: sc.bg, color: sc.color }}
                  title={
                    locked
                      ? `Complete Deep Clean ${s.blockedBy} first`
                      : sc.label
                  }
                >
                  <MaterialIcon
                    name={sc.icon}
                    outlined={s.status !== "complete"}
                    size={20}
                  />
                </div>
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

              <div className="mb-3">
                <label className="mb-1 block text-[10px] font-medium text-[var(--figma-gray500)]">
                  Status
                </label>
                <select
                  value={locked ? "blocked" : s.status}
                  disabled={locked || isMutating}
                  onChange={(e) =>
                    onStatusChange(s, e.target.value as SiteSubStageStatus)
                  }
                  className="w-full cursor-pointer rounded-[9px] border border-[var(--figma-border)] bg-white px-2.5 py-2 text-[12px] font-semibold text-[var(--figma-navy)] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ color: sc.color }}
                  title={
                    locked
                      ? `Complete Deep Clean ${s.blockedBy} first`
                      : "Set status"
                  }
                >
                  {locked ? (
                    <option value="blocked">Blocked</option>
                  ) : (
                    EDITABLE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CFG[status].label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mt-auto flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1">
                  <label className="mb-1 block text-[10px] font-medium text-[var(--figma-gray500)]">
                    Start
                  </label>
                  <input
                    type="date"
                    value={startIso}
                    disabled={locked || isMutating}
                    onChange={(e) => onStartDateChange(s, e.target.value)}
                    className="w-full rounded-[9px] border border-[var(--figma-border)] bg-white px-2.5 py-2 text-[12px] font-semibold text-[var(--figma-navy)] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <div className="mt-1 text-[10px] text-[var(--figma-gray400)]">
                    {formatSiteDayDate(display.startDay, anchorIso)}
                  </div>
                </div>
                <div className="w-[72px] shrink-0">
                  <label className="mb-1 block text-[10px] font-medium text-[var(--figma-gray500)]">
                    Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={display.durationDays}
                    disabled={locked || isMutating}
                    onChange={(e) => onDurationChange(s, e.target.value)}
                    onBlur={() => onDurationCommit(s)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full rounded-[9px] border border-[var(--figma-border)] bg-white px-2.5 py-2 text-center text-[12px] font-bold text-[var(--figma-navy)] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
