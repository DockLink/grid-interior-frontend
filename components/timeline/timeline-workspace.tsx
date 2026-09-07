"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { DemoCaption } from "@/components/demo/demo-caption";
import { MilestoneManagementModal } from "@/components/projects/milestone-management-modal";
import { AddMaterialItemDialog } from "@/components/timeline/add-material-item-dialog";
import { openTimelinePrintWindow } from "@/components/timeline/timeline-print";
import { useActiveProjectView } from "@/hooks/use-active-project-view";
import { useProjectLinks } from "@/hooks/use-project-links";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { useProjectTimeline } from "@/hooks/use-project-timeline";
import { useVendorTasks } from "@/hooks/use-vendor-tasks";
import { handleApiError } from "@/lib/api/handle-api-error";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  averagePhaseProgress,
  findSiteExecutionStage,
  isSiteExecutionPhase,
  mapClientKeyDates,
  mapSiteSubstageCards,
  siteProgressFromCards,
  type ClientKeyDateCard,
  type ClientSubStageCard,
} from "@/lib/timeline/map-client-view";
import {
  mapVendorTasksToMaterialItems,
  materialItemsHaveNumericValue,
  sumMaterialValues,
} from "@/lib/timeline/map-materials";
import {
  formatSiteDayDate,
  getClientKeyDatesFromSite,
  getSiteExecutionProgress,
  getSiteOverlapBarsFromSite,
  getSiteSubstagesSnapshot,
  resolveSiteSubstages,
  subscribeSiteSubstages,
} from "@/lib/projects/mock-execution";
import {
  CLIENT_GANTT_PHASES,
  MATERIAL_ITEMS,
  MILESTONES,
  PROJECT_END,
  PROJECT_NAME,
  PROJECT_START,
  TOTAL_WEEKS,
  type GanttPhase,
  type MaterialItem,
  type Milestone,
} from "@/lib/timeline/mock-timeline";
import {
  downloadMaterialsExcel,
  downloadMilestonesExcel,
  downloadTimelinePhasesExcel,
  slugForFilename,
} from "@/lib/timeline/timeline-export";
import type { SiteSubStageStatus } from "@/types/execution";

function useSiteSubstages() {
  return useSyncExternalStore(
    subscribeSiteSubstages,
    getSiteSubstagesSnapshot,
    getSiteSubstagesSnapshot,
  );
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  navy: "#1B2A4A",
  teal: "#0E7C86",
  tealLight: "#138f9b",
  alert: "#F26D6D",
  success: "#3FA66B",
  border: "#E5E7EB",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
};

const S = {
  raised:
    "6px 6px 14px rgba(163,177,198,0.45), -4px -4px 10px rgba(255,255,255,0.90)",
  raisedHover:
    "9px 9px 20px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.95)",
  card: "8px 8px 20px rgba(163,177,198,0.40), -6px -6px 14px rgba(255,255,255,0.95)",
  inset:
    "inset 3px 3px 8px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.90)",
  modal:
    "16px 16px 40px rgba(163,177,198,0.45), -10px -10px 28px rgba(255,255,255,0.95)",
};

export type TimelineView = "gantt" | "milestones" | "client" | "materials";

interface TimelineLiveData {
  phases: GanttPhase[];
  milestones: Milestone[];
  projectStartIso: string;
  projectEndIso: string;
  projectStartLabel: string;
  projectEndLabel: string;
  totalWeeks: number;
  currentWeek: number;
  updateStageDates: (
    stageId: string,
    startWeek: number,
    durationWeeks: number,
  ) => Promise<void>;
}

const TimelineProjectNameContext = createContext(PROJECT_NAME);
const TimelineLiveContext = createContext<TimelineLiveData | null>(null);

function useTimelineProjectName() {
  return useContext(TimelineProjectNameContext);
}

function useTimelineLive(): TimelineLiveData {
  const ctx = useContext(TimelineLiveContext);
  if (!ctx) {
    return {
      phases: [],
      milestones: MILESTONES,
      projectStartIso: "2026-05-15",
      projectEndIso: "2026-12-18",
      projectStartLabel: PROJECT_START,
      projectEndLabel: PROJECT_END,
      totalWeeks: TOTAL_WEEKS,
      currentWeek: 9,
      updateStageDates: async () => undefined,
    };
  }
  return ctx;
}

const STATUS_BADGE = {
  completed: { label: "Completed", color: "#3FA66B", bg: "#DCFCE7" },
  upcoming: { label: "Upcoming", color: "#6B7280", bg: "#F3F4F6" },
  overdue: { label: "Overdue", color: "#EF4444", bg: "#FEE2E2" },
};

const MATERIAL_STATUS = {
  approved: { label: "Approved", color: "#0E7C86", bg: "rgba(14,124,134,0.10)" },
  pending: { label: "Pending", color: "#D97706", bg: "#FEF3C7" },
  ordered: { label: "Ordered", color: "#3FA66B", bg: "#DCFCE7" },
  delivered: { label: "Delivered", color: "#6B7280", bg: "#F3F4F6" },
};

// ── Shared primitives ─────────────────────────────────────────────────────────
function GradBtn({
  label,
  icon,
  onClick,
  small = false,
}: {
  label: string;
  icon?: string;
  onClick?: () => void;
  small?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: small ? "8px 18px" : "11px 24px",
        borderRadius: 24,
        border: "none",
        background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
        color: T.white,
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: hov ? S.raisedHover : S.raised,
        transform: hov ? "scale(1.01)" : "scale(1)",
        transition: "all 150ms",
      }}
    >
      {icon && (
        <span
          className="material-icons-outlined"
          style={{ fontSize: small ? 14 : 16 }}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}

function Avatar({
  initials,
  color,
  size = 28,
  title = "",
}: {
  initials: string;
  color: string;
  size?: number;
  title?: string;
}) {
  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: S.raised,
      }}
    >
      <span style={{ fontSize: size * 0.36, fontWeight: 700, color: T.white }}>
        {initials}
      </span>
    </div>
  );
}

// ── GANTT CHART ───────────────────────────────────────────────────────────────
function GanttChart() {
  const projectName = useTimelineProjectName();
  const live = useTimelineLive();
  const authDisabled = isAuthDisabled();
  const [zoom, setZoom] = useState<"month" | "week">("month");
  const [tooltip, setTooltip] = useState<GanttPhase | null>(null);
  const [phases, setPhases] = useState<GanttPhase[]>(live.phases);
  const [fridaySent, setFridaySent] = useState<string | null>("15 Aug 2026");
  const [copied, setCopied] = useState(false);
  const siteStages = useSiteSubstages();
  const keyDates = getClientKeyDatesFromSite(siteStages);
  const overlapBars = getSiteOverlapBarsFromSite(resolveSiteSubstages(siteStages));

  const totalWeeks = Math.max(1, live.totalWeeks);
  const currentWeek = live.currentWeek;
  const projectStartIso = live.projectStartIso;
  const milestones = live.milestones;

  useEffect(() => {
    setPhases(live.phases);
  }, [live.phases]);

  const persistPhase = async (phase: GanttPhase) => {
    if (authDisabled || !phase.stageId) return;
    try {
      await live.updateStageDates(phase.stageId, phase.startWeek, phase.durationWeeks);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update stage dates");
      setPhases(live.phases);
    }
  };

  const nudge = (id: number, delta: number) => {
    setPhases((prev) => {
      const next = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              startWeek: Math.max(
                0,
                Math.min(totalWeeks - p.durationWeeks, p.startWeek + delta),
              ),
            }
          : p,
      );
      const updated = next.find((p) => p.id === id);
      if (updated) void persistPhase(updated);
      return next;
    });
  };

  const setDuration = (id: number, weeks: number) => {
    setPhases((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, durationWeeks: Math.max(1, weeks) } : p,
      );
      const updated = next.find((p) => p.id === id);
      if (updated) void persistPhase(updated);
      return next;
    });
  };

  const sendFriday = () => {
    const stamp = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    setFridaySent(stamp);
    void navigator.clipboard?.writeText(`${window.location.origin}/portal/marchetti-villa`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute week labels from live project start
  const weekLabels: { week: number; label: string }[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const d = new Date(`${projectStartIso}T00:00:00`);
    d.setDate(d.getDate() + w * 7);
    const label =
      zoom === "month"
        ? w % 4 === 0
          ? d.toLocaleDateString("en-US", { month: "short" })
          : ""
        : `W${w + 1}`;
    weekLabels.push({ week: w, label });
  }

  const displayed = zoom === "month" ? weekLabels.filter((_, i) => i % 4 === 0) : weekLabels;

  return (
    <div style={{ padding: "28px 40px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.navy,
              margin: "0 0 4px",
            }}
          >
            Project Timeline
          </h1>
          <div
            style={{
              fontSize: 12,
              color: T.gray500,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>{projectName}</span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                className="material-icons-outlined"
                style={{ fontSize: 13 }}
              >
                event
              </span>
              {live.projectStartLabel} → {live.projectEndLabel}
            </span>
          </div>
          {authDisabled && <DemoCaption className="mt-1" />}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Zoom toggle */}
          <div
            style={{
              display: "inline-flex",
              background: T.gray100,
              borderRadius: 22,
              padding: 3,
              boxShadow: S.inset,
              position: "relative",
            }}
          >
            {(["month", "week"] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: "6px 16px",
                  border: "none",
                  borderRadius: 18,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: zoom === z ? 700 : 400,
                  color: zoom === z ? T.white : T.gray400,
                  background:
                    zoom === z
                      ? `linear-gradient(135deg, ${T.navy}, ${T.teal})`
                      : "transparent",
                  boxShadow: zoom === z ? S.raised : "none",
                  transition: "all 200ms",
                }}
              >
                {z === "month" ? "Month" : "Week"}
              </button>
            ))}
          </div>
          <GradBtn
            label="Export PDF"
            icon="picture_as_pdf"
            small
            onClick={() => {
              const opened = openTimelinePrintWindow(phases, milestones, {
                projectName,
                projectStartLabel: live.projectStartLabel,
                projectEndLabel: live.projectEndLabel,
                projectStartIso,
              });
              if (!opened) {
                toast.error("Allow pop-ups to export the PDF");
                return;
              }
              toast.success("Print dialog opened — choose Save as PDF");
            }}
          />
          <GradBtn
            label="Export Excel"
            icon="table_view"
            small
            onClick={() => {
              downloadTimelinePhasesExcel(
                phases,
                `${slugForFilename(projectName)}-timeline.csv`,
                projectStartIso,
              );
              toast.success("Excel file downloaded");
            }}
          />
          <GradBtn
            label={copied ? "Link copied" : fridaySent ? `Friday update · ${fridaySent}` : "Send Friday update"}
            icon="send"
            small
            onClick={sendFriday}
          />
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "Phases Complete",
            value: `${phases.filter((p) => p.status === "completed").length}/${phases.length}`,
            icon: "layers",
            color: T.teal,
          },
          {
            label: "Current Phase",
            value: phases.find((p) => p.status === "active")?.name ?? "—",
            icon: "pending",
            color: "#8B5CF6",
          },
          {
            label: "Milestones Done",
            value: `${milestones.filter((m) => m.status === "completed").length}/${milestones.length}`,
            icon: "flag",
            color: T.success,
          },
          {
            label: "Overdue",
            value: `${milestones.filter((m) => m.status === "overdue").length}`,
            icon: "alarm",
            color: T.alert,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: "1 1 160px",
              background: T.white,
              borderRadius: 14,
              padding: "14px 16px",
              boxShadow: S.card,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: `${s.color}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: S.inset,
              }}
            >
              <span
                className="material-icons-outlined"
                style={{ fontSize: 19, color: s.color }}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: T.navy,
                  lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: T.gray500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Site execution key dates — synced with Execution workspace */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {keyDates.map((kd) => {
          const statusLabel =
            kd.status === "completed"
              ? "Completed"
              : kd.status === "active"
                ? "In progress"
                : "Upcoming";
          const statusColor =
            kd.status === "completed"
              ? T.success
              : kd.status === "active"
                ? T.teal
                : T.gray500;
          const statusBg =
            kd.status === "completed"
              ? "#DCFCE7"
              : kd.status === "active"
                ? `${T.teal}14`
                : T.gray100;
          return (
            <div
              key={kd.id}
              style={{
                background: T.white,
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: S.card,
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: `${T.teal}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: S.inset,
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{ fontSize: 20, color: T.teal }}
                >
                  {kd.icon}
                </span>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.gray500,
                    marginBottom: 4,
                  }}
                >
                  {kd.label}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: T.navy,
                    marginBottom: 6,
                  }}
                >
                  {kd.date}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 8,
                    color: statusColor,
                    background: statusBg,
                  }}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gantt chart */}
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          boxShadow: S.card,
          overflow: "auto",
        }}
      >
        {/* Week header */}
        <div style={{ display: "flex", minWidth: 900 }}>
          {/* Phase label column */}
          <div
            style={{
              width: 220,
              flexShrink: 0,
              padding: "10px 16px",
              background: T.gray50,
              borderBottom: `1px solid ${T.border}`,
              borderRight: `1px solid ${T.border}`,
              fontSize: 10,
              fontWeight: 700,
              color: T.gray500,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Phase
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              background: T.gray50,
              borderBottom: `1px solid ${T.border}`,
              position: "relative",
            }}
          >
            {zoom === "month"
              ? Array.from({ length: Math.ceil(totalWeeks / 4) }).map(
                  (_, i) => {
                    const d = new Date(`${projectStartIso}T00:00:00`);
                    d.setDate(d.getDate() + i * 28);
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 4,
                          borderRight: `1px solid ${T.border}`,
                          padding: "8px 8px",
                          fontSize: 10,
                          fontWeight: 600,
                          color: T.gray500,
                        }}
                      >
                        {d.toLocaleDateString("en-US", {
                          month: "short",
                          year: "2-digit",
                        })}
                      </div>
                    );
                  }
                )
              : Array.from({ length: totalWeeks }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderRight: `1px solid ${T.border}`,
                      padding: "8px 4px",
                      fontSize: 9,
                      fontWeight: 600,
                      color: T.gray500,
                      textAlign: "center",
                    }}
                  >
                    W{i + 1}
                  </div>
                ))}

            {/* Current week marker */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${(currentWeek / totalWeeks) * 100}%`,
                width: 2,
                background: T.teal,
                zIndex: 5,
              }}
            />
          </div>
        </div>

        {/* Phase rows */}
        {phases.length === 0 ? (
          <div
            style={{
              padding: "28px 16px",
              color: T.gray500,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            No stages yet. Add stages from the Tasks board to populate this timeline.
          </div>
        ) : null}
        {phases.map((phase, idx) => (
          <div
            key={phase.id}
            style={{
              display: "flex",
              minWidth: 900,
              borderBottom:
                idx < phases.length - 1
                  ? `1px solid ${T.border}`
                  : "none",
            }}
          >
            {/* Phase label */}
            <div
              style={{
                width: 220,
                flexShrink: 0,
                padding: "12px 16px",
                borderRight: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: phase.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${phase.color}66`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.navy,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {phase.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color:
                      phase.status === "active"
                        ? T.teal
                        : phase.status === "completed"
                        ? T.success
                        : T.gray400,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {phase.status === "active"
                    ? `${phase.progress}% done`
                    : phase.status}
                </div>
              </div>
              <Avatar
                initials={phase.lead.initials}
                color={phase.lead.color}
                size={22}
                title={phase.lead.name}
              />
              <input
                type="number"
                min={1}
                value={phase.durationWeeks}
                onChange={(e) => setDuration(phase.id, Number(e.target.value) || 1)}
                title="Duration (weeks)"
                style={{
                  width: 40,
                  padding: "2px 4px",
                  borderRadius: 6,
                  border: `1px solid ${T.border}`,
                  fontSize: 11,
                  fontFamily: "inherit",
                  textAlign: "center",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button
                  type="button"
                  onClick={() => nudge(phase.id, -1)}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}
                >
                  <span className="material-icons-outlined" style={{ fontSize: 14, color: T.gray400 }}>
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => nudge(phase.id, 1)}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}
                >
                  <span className="material-icons-outlined" style={{ fontSize: 14, color: T.gray400 }}>
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            {/* Bar area */}
            <div
              style={{
                flex: 1,
                position: "relative",
                padding: "10px 0",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onMouseEnter={() => setTooltip(phase)}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Grid lines */}
              {Array.from({ length: totalWeeks }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${(i / totalWeeks) * 100}%`,
                    width: 1,
                    background:
                      i % 4 === 0
                        ? "rgba(200,200,210,0.35)"
                        : "rgba(200,200,210,0.15)",
                  }}
                />
              ))}

              {/* Current week highlight */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${(currentWeek / totalWeeks) * 100}%`,
                  width: 2,
                  background: `${T.teal}99`,
                  zIndex: 3,
                }}
              />

              {/* Phase bar — drag to reschedule */}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(phase.id));
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={(e) => {
                  const row = e.currentTarget.parentElement;
                  if (!row) return;
                  const rect = row.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const week = Math.round(pct * totalWeeks);
                  setPhases((prev) => {
                    const next = prev.map((p) =>
                      p.id === phase.id
                        ? {
                            ...p,
                            startWeek: Math.max(
                              0,
                              Math.min(totalWeeks - p.durationWeeks, week),
                            ),
                          }
                        : p,
                    );
                    const updated = next.find((p) => p.id === phase.id);
                    if (updated) void persistPhase(updated);
                    return next;
                  });
                }}
                style={{
                  position: "absolute",
                  left: `${(phase.startWeek / totalWeeks) * 100}%`,
                  width: `${(phase.durationWeeks / totalWeeks) * 100}%`,
                  height: 28,
                  borderRadius: 14,
                  background:
                    phase.status === "completed"
                      ? `linear-gradient(135deg, ${T.success}99, #0E7C8699)`
                      : phase.status === "active"
                      ? `linear-gradient(135deg, ${phase.color}cc, ${phase.color}88)`
                      : phase.bg,
                  border: `1.5px solid ${phase.color}66`,
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  zIndex: 2,
                  boxShadow: phase.status === "active" ? `0 2px 8px ${phase.color}44` : "none",
                  transition: "all 150ms",
                }}
              >
                {/* Progress fill */}
                {phase.progress > 0 && phase.status !== "completed" && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${phase.progress}%`,
                      background: `${phase.color}55`,
                      borderRadius: "14px 0 0 14px",
                    }}
                  />
                )}
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    fontSize: 10,
                    fontWeight: 700,
                    color:
                      phase.status === "upcoming" ? phase.color : T.white,
                    padding: "0 10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {phase.name}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            padding: "12px 16px",
            borderTop: `1px solid ${T.border}`,
            fontSize: 11,
            fontWeight: 700,
            color: T.navy,
            minWidth: 900,
          }}
        >
          Execution sub-stages (overlapping) · synced from Site Execution
        </div>
        {overlapBars.map((bar) => (
          <div key={bar.id} style={{ display: "flex", minWidth: 900, borderBottom: `1px solid ${T.border}` }}>
            <div
              style={{
                width: 220,
                flexShrink: 0,
                padding: "8px 16px",
                borderRight: `1px solid ${T.border}`,
                fontSize: 11,
                color: T.gray500,
              }}
            >
              {bar.id} {bar.name}
            </div>
            <div style={{ flex: 1, position: "relative", height: 28 }}>
              <div
                style={{
                  position: "absolute",
                  left: `${(bar.startWeek / totalWeeks) * 100}%`,
                  width: `${(bar.durationWeeks / totalWeeks) * 100}%`,
                  top: 6,
                  height: 16,
                  borderRadius: 8,
                  background:
                    bar.status === "blocked" ? "#FCA5A5" : bar.color,
                  opacity:
                    bar.status === "upcoming"
                      ? 0.35
                      : bar.status === "complete"
                        ? 0.55
                        : 0.9,
                }}
                title={`${bar.name} · ${bar.status}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            background: T.navy,
            color: T.white,
            padding: "10px 18px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: S.modal,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: tooltip.color,
            }}
          />
          {tooltip.name} · {tooltip.durationWeeks}w ·{" "}
          {tooltip.status === "active"
            ? `${tooltip.progress}% complete`
            : tooltip.status}
        </div>
      )}
    </div>
  );
}

// ── MILESTONES ────────────────────────────────────────────────────────────────
function MilestonesView() {
  const params = useParams();
  const projectId = typeof params.projectId === "string" ? params.projectId : "";
  const projectName = useTimelineProjectName();
  const live = useTimelineLive();
  const authDisabled = isAuthDisabled();
  const queryClient = useQueryClient();
  const [showMilestoneManagement, setShowMilestoneManagement] = useState(false);
  const milestones = live.milestones;

  async function refreshMilestones() {
    await queryClient.invalidateQueries({
      queryKey: ["projects", "taskables", projectId, "MILESTONE"],
    });
  }

  return (
    <div style={{ padding: "28px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.navy,
              margin: "0 0 4px",
            }}
          >
            Milestones
          </h1>
          <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
            {projectName} · Key project checkpoints
          </p>
          {authDisabled && <DemoCaption className="mt-1" />}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <GradBtn
            label="Export Excel"
            icon="table_view"
            small
            onClick={() => {
              downloadMilestonesExcel(
                milestones,
                `${slugForFilename(projectName)}-milestones.csv`,
              );
              toast.success("Excel file downloaded");
            }}
          />
          <GradBtn
            label="Add Milestone"
            icon="add"
            small
            onClick={() => {
              if (authDisabled) {
                toast.message("Connect auth to add milestones");
                return;
              }
              setShowMilestoneManagement(true);
            }}
          />
        </div>
      </div>

      {/* Timeline vertical */}
      <div
        style={{
          position: "relative",
          paddingLeft: 36,
        }}
      >
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 10,
            bottom: 10,
            width: 2,
            background: T.border,
            borderRadius: 1,
          }}
        />

        {milestones.length === 0 ? (
          <div style={{ padding: "12px 0", color: T.gray500, fontSize: 13 }}>
            No milestones yet. Click Add Milestone to create one under a stage.
          </div>
        ) : null}

        {milestones.map((m) => {
          const cfg = STATUS_BADGE[m.status];
          return (
            <div
              key={m.id}
              style={{
                position: "relative",
                marginBottom: 20,
                display: "flex",
                gap: 18,
                alignItems: "flex-start",
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: -36 + 12 - 9,
                  top: 12,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background:
                    m.status === "completed"
                      ? T.success
                      : m.status === "overdue"
                      ? T.alert
                      : T.white,
                  border: `2px solid ${cfg.color}`,
                  boxShadow: S.raised,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                {m.status === "completed" && (
                  <span
                    className="material-icons"
                    style={{ fontSize: 11, color: T.white }}
                  >
                    check
                  </span>
                )}
                {m.status === "overdue" && (
                  <span
                    className="material-icons"
                    style={{ fontSize: 11, color: T.white }}
                  >
                    priority_high
                  </span>
                )}
              </div>

              {/* Card */}
              <div
                style={{
                  flex: 1,
                  background: T.white,
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow: S.card,
                  borderLeft: `3px solid ${cfg.color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: T.navy,
                    }}
                  >
                    {m.name}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 10px",
                      borderRadius: 10,
                      color: cfg.color,
                      background: cfg.bg,
                      flexShrink: 0,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    fontSize: 11,
                    color: T.gray500,
                    marginBottom: m.notes ? 10 : 0,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      className="material-icons-outlined"
                      style={{ fontSize: 13 }}
                    >
                      event
                    </span>
                    {m.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      className="material-icons-outlined"
                      style={{ fontSize: 13 }}
                    >
                      layers
                    </span>
                    {m.phase}
                  </span>
                </div>

                {m.notes && (
                  <div
                    style={{
                      fontSize: 12,
                      color: T.gray500,
                      lineHeight: 1.5,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: T.gray50,
                      boxShadow: S.inset,
                    }}
                  >
                    {m.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showMilestoneManagement && (
        <MilestoneManagementModal
          projectId={projectId}
          onClose={() => setShowMilestoneManagement(false)}
          onUpdated={() => void refreshMilestones()}
        />
      )}
    </div>
  );
}

// ── CLIENT VIEW ───────────────────────────────────────────────────────────────
const SITE_STATUS_UI: Record<
  SiteSubStageStatus,
  { label: string; color: string; bg: string }
> = {
  complete: { label: "Complete", color: "#3FA66B", bg: "#DCFCE7" },
  "in-progress": { label: "In Progress", color: "#0E7C86", bg: "#CCFBF1" },
  upcoming: { label: "Upcoming", color: "#9CA3AF", bg: "#F3F4F6" },
  blocked: { label: "Blocked", color: "#EF4444", bg: "#FEE2E2" },
};

function ClientView() {
  const params = useParams();
  const projectId = typeof params.projectId === "string" ? params.projectId : "";
  const projectName = useTimelineProjectName();
  const authDisabled = isAuthDisabled();
  const live = useTimelineLive();
  const { tasks: projectTasks, isLoading: tasksLoading } = useProjectTaskables(
    projectId,
    "TASK",
    { limit: 200 },
  );
  const siteStages = useSiteSubstages();
  const resolvedSite = resolveSiteSubstages(siteStages);
  const mockKeyDates = getClientKeyDatesFromSite(resolvedSite);
  const mockSiteProgress = getSiteExecutionProgress(resolvedSite);

  const mockPhases = CLIENT_GANTT_PHASES.map((p) =>
    p.name === "Site Execution"
      ? {
          ...p,
          progress: mockSiteProgress.progress,
          status: mockSiteProgress.status,
        }
      : p,
  );

  const mockSiteCards: ClientSubStageCard[] = resolvedSite.map((s) => ({
    id: s.id,
    number: s.number,
    name: s.name,
    detail: s.detail,
    status: s.status,
    dateLabel: formatSiteDayDate(s.startDay),
    checkpoint: s.checkpoint,
  }));

  const liveSiteStage = findSiteExecutionStage(live.phases);
  const liveSiteCards = liveSiteStage
    ? mapSiteSubstageCards(projectTasks, liveSiteStage.stageId ?? "")
    : [];
  const liveSiteProgress = siteProgressFromCards(liveSiteCards);
  const liveKeyDates = mapClientKeyDates({
    projectStartIso: live.projectStartIso,
    projectEndIso: live.projectEndIso,
    projectStartLabel: live.projectStartLabel,
    projectEndLabel: live.projectEndLabel,
    milestones: live.milestones,
  });

  const phases = authDisabled ? mockPhases : live.phases;
  const keyDates: ClientKeyDateCard[] = authDisabled ? mockKeyDates : liveKeyDates;
  const siteCards = authDisabled ? mockSiteCards : liveSiteCards;
  const siteProgress = authDisabled ? mockSiteProgress : liveSiteProgress;
  const overallProgress = authDisabled ? 38 : averagePhaseProgress(phases);
  const startLabel = authDisabled ? PROJECT_START : live.projectStartLabel;
  const endLabel = authDisabled ? PROJECT_END : live.projectEndLabel;
  const showSiteSection = authDisabled || Boolean(liveSiteStage);

  return (
    <div style={{ padding: "28px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.navy,
              margin: "0 0 4px",
            }}
          >
            Client-Facing Timeline
          </h1>
          <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
            Site Execution mirrors internal Execution updates · key dates and sub-stages stay in sync
          </p>
          {authDisabled && <DemoCaption className="mt-1" />}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <GradBtn
            label="Export Excel"
            icon="table_view"
            small
            onClick={() => {
              downloadTimelinePhasesExcel(
                phases,
                `${slugForFilename(projectName)}-client-timeline.csv`,
              );
              toast.success("Excel file downloaded");
            }}
          />
          <GradBtn
            label="Share with Client"
            icon="share"
            small
            onClick={() => {
              void navigator.clipboard?.writeText(
                `${window.location.origin}/portal/marchetti-villa`,
              );
            }}
          />
        </div>
      </div>

      {/* Site execution key dates — derived from Execution substages */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {keyDates.map((kd) => {
          const statusLabel =
            kd.status === "completed"
              ? "Completed"
              : kd.status === "active"
                ? "In progress"
                : "Upcoming";
          const statusColor =
            kd.status === "completed"
              ? T.success
              : kd.status === "active"
                ? T.teal
                : T.gray500;
          const statusBg =
            kd.status === "completed"
              ? "#DCFCE7"
              : kd.status === "active"
                ? `${T.teal}14`
                : T.gray100;
          return (
            <div
              key={kd.id}
              style={{
                background: T.white,
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: S.card,
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: `${T.teal}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: S.inset,
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{ fontSize: 20, color: T.teal }}
                >
                  {kd.icon}
                </span>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.gray500,
                    marginBottom: 4,
                  }}
                >
                  {kd.label}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: T.navy,
                    marginBottom: 6,
                  }}
                >
                  {kd.date}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 8,
                    color: statusColor,
                    background: statusBg,
                  }}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project progress bar */}
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "20px 24px",
          boxShadow: S.card,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>
            Overall Project Progress
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>
            {overallProgress}%
          </span>
        </div>
        <div
          style={{
            height: 10,
            borderRadius: 5,
            background: T.gray100,
            boxShadow: S.inset,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${overallProgress}%`,
              borderRadius: 5,
              background: `linear-gradient(90deg, ${T.navy}, ${T.teal})`,
              transition: "width 600ms ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: 11,
            color: T.gray400,
          }}
        >
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      </div>

      {/* Phase stepper */}
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "22px 24px",
          boxShadow: S.card,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.navy,
            marginBottom: 18,
          }}
        >
          Project Phases
        </div>
        {phases.length === 0 && (
          <div style={{ fontSize: 13, color: T.gray500 }}>
            No stages yet for this project.
          </div>
        )}
        {phases.map((phase, idx) => {
          const isCurrent = phase.status === "active";
          const isDone = phase.status === "completed";
          const isSite = isSiteExecutionPhase(phase.name);
          const showProgress = isCurrent || (isSite && phase.progress > 0);
          return (
            <div
              key={phase.id}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: isDone
                      ? T.success
                      : isCurrent
                        ? `linear-gradient(135deg, ${T.navy}, ${T.teal})`
                        : T.gray200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isDone || isCurrent ? S.raised : "none",
                  }}
                >
                  {isDone ? (
                    <span
                      className="material-icons"
                      style={{ fontSize: 16, color: T.white }}
                    >
                      check
                    </span>
                  ) : isCurrent ? (
                    <span
                      className="material-icons-outlined"
                      style={{ fontSize: 14, color: T.white }}
                    >
                      pending
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.gray400,
                      }}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>
                {idx < phases.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      height: 28,
                      background: isDone ? T.success : T.border,
                      margin: "3px 0",
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  paddingBottom: idx < phases.length - 1 ? 4 : 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: showProgress ? 8 : 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 700 : 600,
                      color: isCurrent
                        ? T.navy
                        : isDone
                          ? T.success
                          : T.gray500,
                    }}
                  >
                    {phase.name}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 8,
                        color: T.teal,
                        background: `${T.teal}14`,
                      }}
                    >
                      IN PROGRESS
                    </span>
                  )}
                </div>
                {showProgress && (
                  <div style={{ marginBottom: isSite ? 8 : 20 }}>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: T.gray100,
                        boxShadow: S.inset,
                        overflow: "hidden",
                        maxWidth: 300,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${phase.progress}%`,
                          background: `linear-gradient(90deg, ${T.navy}, ${T.teal})`,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: T.gray400,
                        marginTop: 3,
                        display: "block",
                      }}
                    >
                      {phase.progress}% complete
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showSiteSection && (
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "22px 24px",
          boxShadow: S.card,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>
              Site Execution · Sub-stages
            </div>
            <div style={{ fontSize: 11, color: T.gray500, marginTop: 2 }}>
              Live from project tasks · {siteProgress.progress}% site complete
            </div>
          </div>
        </div>
        {!authDisabled && tasksLoading ? (
          <div style={{ fontSize: 13, color: T.gray500 }}>Loading sub-stages…</div>
        ) : siteCards.length === 0 ? (
          <div style={{ fontSize: 13, color: T.gray500 }}>
            No tasks under the Site / Execution stage yet.
          </div>
        ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          {siteCards.map((s) => {
            const sc = SITE_STATUS_UI[s.status];
            return (
              <div
                key={s.id}
                style={{
                  background: T.gray50,
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow: S.inset,
                  borderLeft: `3px solid ${s.checkpoint ? T.alert : sc.color}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: sc.bg,
                      color: sc.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {s.number}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.navy,
                        lineHeight: 1.3,
                      }}
                    >
                      {s.name}
                    </div>
                    {s.checkpoint && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: T.alert,
                          marginTop: 2,
                          display: "inline-block",
                        }}
                      >
                        Checkpoint
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: T.gray500,
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {s.detail}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.navy,
                    }}
                  >
                    {s.dateLabel}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 8,
                      color: sc.color,
                      background: sc.bg,
                    }}
                  >
                    {sc.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
      )}
    </div>
  );
}

// ── MATERIALS TRACKER ─────────────────────────────────────────────────────────
function MaterialsView() {
  const params = useParams();
  const projectId = typeof params.projectId === "string" ? params.projectId : "";
  const projectName = useTimelineProjectName();
  const authDisabled = isAuthDisabled();
  const [statusFilter, setStatusFilter] = useState<
    "all" | MaterialItem["status"]
  >("all");
  const [categoryOpen, setCategoryOpen] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { tasks: vendorTasks, isLoading: vendorLoading, createTask, isCreating } =
    useVendorTasks({ project_id: projectId });
  const { links } = useProjectLinks(projectId);

  const liveItems = useMemo(
    () => mapVendorTasksToMaterialItems(vendorTasks, links),
    [vendorTasks, links],
  );
  const items = authDisabled ? MATERIAL_ITEMS : liveItems;

  const categories = [...new Set(items.map((m) => m.category))];
  const filtered = items.filter(
    (m) => statusFilter === "all" || m.status === statusFilter,
  );
  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: filtered.filter((m) => m.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const showValue = materialItemsHaveNumericValue(items);
  const totalValue = sumMaterialValues(items);
  const partyOptions = useMemo(
    () => [
      ...links.suppliers.map((s) => ({
        partyKind: "supplier" as const,
        partyId: s.id,
        label: s.name,
      })),
      ...links.subVendors.map((s) => ({
        partyKind: "subvendor" as const,
        partyId: s.id,
        label: s.name,
      })),
    ],
    [links],
  );

  return (
    <div style={{ padding: "28px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.navy,
              margin: "0 0 4px",
            }}
          >
            Materials & Procurement
          </h1>
          <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
            {showValue
              ? `${projectName} · Total value: AED ${totalValue.toLocaleString()}`
              : `${projectName} · ${items.length} item${items.length === 1 ? "" : "s"}`}
          </p>
          {authDisabled && <DemoCaption className="mt-1" />}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <GradBtn
            label="Export Excel"
            icon="table_view"
            small
            onClick={() => {
              downloadMaterialsExcel(
                filtered,
                `${slugForFilename(projectName)}-materials.csv`,
              );
              toast.success("Excel file downloaded");
            }}
          />
          <GradBtn
            label="Add Item"
            icon="add"
            small
            onClick={() => {
              if (authDisabled) {
                toast.message("Connect auth to add procurement items");
                return;
              }
              setAddOpen(true);
            }}
          />
        </div>
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "approved", "pending", "ordered", "delivered"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "6px 14px",
                borderRadius: 18,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
                fontWeight: statusFilter === s ? 700 : 400,
                background:
                  statusFilter === s
                    ? `linear-gradient(135deg, ${T.navy}, ${T.teal})`
                    : T.white,
                color:
                  statusFilter === s
                    ? T.white
                    : s === "all"
                    ? T.gray500
                    : MATERIAL_STATUS[s as Exclude<typeof s, "all">]?.color ?? T.gray500,
                boxShadow: statusFilter === s ? S.raised : S.inset,
                transition: "all 180ms",
                textTransform: "capitalize",
              }}
            >
              {s === "all"
                ? "All"
                : MATERIAL_STATUS[s as Exclude<typeof s, "all">].label}
            </button>
          )
        )}
      </div>

      {/* Grouped items */}
      {!authDisabled && vendorLoading ? (
        <div style={{ fontSize: 13, color: T.gray500 }}>Loading materials…</div>
      ) : grouped.length === 0 ? (
        <div
          style={{
            background: T.white,
            borderRadius: 16,
            padding: "28px 24px",
            boxShadow: S.card,
            fontSize: 13,
            color: T.gray500,
          }}
        >
          {items.length === 0
            ? "No procurement items yet. Add a vendor task or link a supplier on Suppliers & Clients."
            : "No items match this filter."}
        </div>
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {grouped.map((group) => {
          const open = categoryOpen === null || categoryOpen === group.category;
          return (
            <div
              key={group.category}
              style={{
                background: T.white,
                borderRadius: 16,
                boxShadow: S.card,
                overflow: "hidden",
              }}
            >
              {/* Category header */}
              <button
                onClick={() =>
                  setCategoryOpen(
                    categoryOpen === group.category ? null : group.category
                  )
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "13px 18px",
                  background: T.gray50,
                  border: "none",
                  borderBottom: open ? `1px solid ${T.border}` : "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{ fontSize: 18, color: T.teal }}
                >
                  category
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.navy,
                  }}
                >
                  {group.category}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "1px 8px",
                    borderRadius: 8,
                    background: `${T.teal}14`,
                    color: T.teal,
                  }}
                >
                  {group.items.length} items
                </span>
                <span
                  className="material-icons-outlined"
                  style={{
                    fontSize: 18,
                    color: T.gray400,
                    transform: open ? "rotate(180deg)" : "none",
                    transition: "transform 200ms",
                  }}
                >
                  expand_more
                </span>
              </button>

              {/* Items */}
              {open &&
                group.items.map((item, idx) => {
                  const mCfg = MATERIAL_STATUS[item.status];
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 140px 110px 120px 80px",
                        gap: 0,
                        padding: "13px 18px",
                        alignItems: "center",
                        borderBottom:
                          idx < group.items.length - 1
                            ? `1px solid ${T.border}`
                            : "none",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.navy,
                            marginBottom: 2,
                          }}
                        >
                          {item.item}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: 11, color: T.gray400 }}>
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: T.gray500, paddingRight: 8 }}>
                        {item.supplier}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 10,
                            color: mCfg.color,
                            background: mCfg.bg,
                          }}
                        >
                          {mCfg.label}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          color: T.gray500,
                        }}
                      >
                        <span
                          className="material-icons-outlined"
                          style={{ fontSize: 13 }}
                        >
                          local_shipping
                        </span>
                        {item.eta}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: T.navy,
                          textAlign: "right",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
      )}
      <AddMaterialItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        projectId={projectId}
        partyOptions={partyOptions}
        isSubmitting={isCreating}
        onSubmit={async (input) => {
          try {
            await createTask({
              party_kind: input.partyKind,
              party_id: input.partyId,
              project_id: projectId,
              title: input.title,
              description: input.notes,
              due_date: input.dueDate,
              status: "todo",
            });
            toast.success("Material item added");
            setAddOpen(false);
          } catch (err) {
            handleApiError(err, { toast: true });
          }
        }}
      />
    </div>
  );
}

function StatusReportPanel() {
  const { milestones } = useTimelineLive();
  const completed = milestones.filter((m) => m.status === "completed").length;
  const overdue = milestones.filter((m) => m.status === "overdue").length;
  const upcoming = milestones.filter((m) => m.status === "upcoming").length;
  const outstanding = overdue + upcoming;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        padding: "0 40px 16px",
      }}
    >
      {[
        { label: "Completed", value: completed, color: T.success },
        { label: "Outstanding", value: outstanding, color: T.teal },
        { label: "Overdue", value: overdue, color: T.alert },
        { label: "Upcoming", value: upcoming, color: T.navy },
      ].map((s) => (
        <div
          key={s.label}
          style={{
            flex: "1 1 140px",
            background: T.white,
            borderRadius: 12,
            padding: "12px 14px",
            boxShadow: S.card,
          }}
        >
          <div style={{ fontSize: 11, color: T.gray400 }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ProjectTimelineTab({ view }: { view: TimelineView }) {
  const params = useParams();
  const projectId = typeof params.projectId === "string" ? params.projectId : "";
  const authDisabled = isAuthDisabled();
  const { project, isLoading: projectLoading, error: projectError } =
    useActiveProjectView(projectId);
  const timeline = useProjectTimeline(projectId);

  const projectName = project?.name ?? PROJECT_NAME;
  const isLoading = projectLoading || timeline.isLoading;
  const error = projectError || timeline.error;

  const liveValue: TimelineLiveData = useMemo(
    () => ({
      phases: timeline.phases,
      milestones: timeline.milestones,
      projectStartIso: timeline.projectStartIso,
      projectEndIso: timeline.projectEndIso,
      projectStartLabel: timeline.projectStartLabel,
      projectEndLabel: timeline.projectEndLabel,
      totalWeeks: timeline.totalWeeks,
      currentWeek: timeline.currentWeek,
      updateStageDates: timeline.updateStageDates,
    }),
    [
      timeline.phases,
      timeline.milestones,
      timeline.projectStartIso,
      timeline.projectEndIso,
      timeline.projectStartLabel,
      timeline.projectEndLabel,
      timeline.totalWeeks,
      timeline.currentWeek,
      timeline.updateStageDates,
    ],
  );

  if (!authDisabled && isLoading) {
    return (
      <div style={{ padding: "24px", color: T.gray500, fontSize: 14 }}>
        Loading timeline…
      </div>
    );
  }

  if (!authDisabled && (error || !project)) {
    return (
      <div style={{ padding: "24px", color: T.alert, fontSize: 14 }}>
        {error ?? "Project not found"}
      </div>
    );
  }

  return (
    <TimelineProjectNameContext.Provider value={projectName}>
      <TimelineLiveContext.Provider value={liveValue}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            fontFamily: "inherit",
          }}
        >
          <div style={{ flex: 1 }}>
            {view === "gantt" && (
              <>
                <div style={{ paddingTop: 20 }}>
                  <StatusReportPanel />
                </div>
                <GanttChart />
              </>
            )}
            {view === "milestones" && <MilestonesView />}
            {view === "client" && <ClientView />}
            {view === "materials" && <MaterialsView />}
          </div>
        </div>
      </TimelineLiveContext.Provider>
    </TimelineProjectNameContext.Provider>
  );
}
