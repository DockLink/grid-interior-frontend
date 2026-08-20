"use client";

import { useState } from "react";
import { DemoCaption } from "@/components/demo/demo-caption";
import {
  GANTT_PHASES,
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

type TimelineView = "gantt" | "milestones" | "client" | "materials";

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

// ── TAB BAR ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "gantt" as TimelineView, label: "Timeline", icon: "timeline" },
  {
    id: "milestones" as TimelineView,
    label: "Milestones",
    icon: "flag",
  },
  {
    id: "client" as TimelineView,
    label: "Client View",
    icon: "person_outline",
  },
  {
    id: "materials" as TimelineView,
    label: "Materials",
    icon: "inventory_2",
  },
];

function TabBar({
  view,
  setView,
}: {
  view: TimelineView;
  setView: (v: TimelineView) => void;
}) {
  return (
    <div
      style={{
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 40px",
        display: "flex",
        gap: 2,
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "13px 18px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              borderBottom: active
                ? `2.5px solid ${T.teal}`
                : "2.5px solid transparent",
              color: active ? T.teal : T.gray500,
              fontWeight: active ? 700 : 400,
              fontSize: 13,
              transition: "all 150ms",
              marginBottom: -1,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 16 }}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ── GANTT CHART ───────────────────────────────────────────────────────────────
function GanttChart() {
  const [zoom, setZoom] = useState<"month" | "week">("month");
  const [tooltip, setTooltip] = useState<GanttPhase | null>(null);

  // Current week indicator — assume we're at week 9 (in Design Development)
  const CURRENT_WEEK = 9;

  // Compute week labels — 30 weeks starting May 2026
  const weekLabels: { week: number; label: string }[] = [];
  for (let w = 0; w < TOTAL_WEEKS; w++) {
    const d = new Date("2026-05-15");
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
            <span>{PROJECT_NAME}</span>
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
              {PROJECT_START} → {PROJECT_END}
            </span>
          </div>
          <DemoCaption className="mt-1" />
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
          <GradBtn label="Export PDF" icon="picture_as_pdf" small />
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
            value: `${GANTT_PHASES.filter((p) => p.status === "completed").length}/${GANTT_PHASES.length}`,
            icon: "layers",
            color: T.teal,
          },
          {
            label: "Current Phase",
            value: GANTT_PHASES.find((p) => p.status === "active")?.name ?? "—",
            icon: "pending",
            color: "#8B5CF6",
          },
          {
            label: "Milestones Done",
            value: `${MILESTONES.filter((m) => m.status === "completed").length}/${MILESTONES.length}`,
            icon: "flag",
            color: T.success,
          },
          {
            label: "Overdue",
            value: `${MILESTONES.filter((m) => m.status === "overdue").length}`,
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
              ? Array.from({ length: Math.ceil(TOTAL_WEEKS / 4) }).map(
                  (_, i) => {
                    const d = new Date("2026-05-15");
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
              : Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
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
                left: `${(CURRENT_WEEK / TOTAL_WEEKS) * 100}%`,
                width: 2,
                background: T.teal,
                zIndex: 5,
              }}
            />
          </div>
        </div>

        {/* Phase rows */}
        {GANTT_PHASES.map((phase, idx) => (
          <div
            key={phase.id}
            style={{
              display: "flex",
              minWidth: 900,
              borderBottom:
                idx < GANTT_PHASES.length - 1
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
              {Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${(i / TOTAL_WEEKS) * 100}%`,
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
                  left: `${(CURRENT_WEEK / TOTAL_WEEKS) * 100}%`,
                  width: 2,
                  background: `${T.teal}99`,
                  zIndex: 3,
                }}
              />

              {/* Phase bar */}
              <div
                style={{
                  position: "absolute",
                  left: `${(phase.startWeek / TOTAL_WEEKS) * 100}%`,
                  width: `${(phase.durationWeeks / TOTAL_WEEKS) * 100}%`,
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
            {PROJECT_NAME} · Key project checkpoints
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <GradBtn label="Add Milestone" icon="add" small />
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

        {MILESTONES.map((m) => {
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
    </div>
  );
}

// ── CLIENT VIEW ───────────────────────────────────────────────────────────────
function ClientView() {
  // Simplified phase stepper for client consumption
  const phases = GANTT_PHASES;
  const activeIdx = phases.findIndex((p) => p.status === "active");

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
            Simplified view · For sharing with {PROJECT_NAME} client
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <GradBtn label="Share with Client" icon="share" small />
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
            38%
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
              width: "38%",
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
          <span>{PROJECT_START}</span>
          <span>{PROJECT_END}</span>
        </div>
      </div>

      {/* Phase stepper */}
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
            fontSize: 13,
            fontWeight: 700,
            color: T.navy,
            marginBottom: 18,
          }}
        >
          Project Phases
        </div>
        {phases.map((phase, idx) => {
          const isCurrent = phase.status === "active";
          const isDone = phase.status === "completed";
          return (
            <div
              key={phase.id}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                marginBottom: idx < phases.length - 1 ? 0 : 0,
              }}
            >
              {/* Connector */}
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
                    boxShadow: (isDone || isCurrent) ? S.raised : "none",
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
                      background: isDone
                        ? T.success
                        : T.border,
                      margin: "3px 0",
                    }}
                  />
                )}
              </div>

              {/* Content */}
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
                    marginBottom: isCurrent ? 8 : 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 700 : 600,
                      color: isCurrent ? T.navy : isDone ? T.success : T.gray500,
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
                {isCurrent && (
                  <div
                    style={{ marginBottom: 20 }}
                  >
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
                      style={{ fontSize: 10, color: T.gray400, marginTop: 3, display: "block" }}
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
    </div>
  );
}

// ── MATERIALS TRACKER ─────────────────────────────────────────────────────────
function MaterialsView() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | MaterialItem["status"]
  >("all");
  const [categoryOpen, setCategoryOpen] = useState<string | null>(null);

  const categories = [
    ...new Set(MATERIAL_ITEMS.map((m) => m.category)),
  ];

  const filtered = MATERIAL_ITEMS.filter(
    (m) => statusFilter === "all" || m.status === statusFilter
  );

  const grouped = categories.map((cat) => ({
    category: cat,
    items: filtered.filter((m) => m.category === cat),
  })).filter((g) => g.items.length > 0);

  const totalValue = MATERIAL_ITEMS.reduce(
    (sum, m) =>
      sum + parseInt(m.value.replace(/[^0-9]/g, ""), 10),
    0
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
            {PROJECT_NAME} · Total value: AED {totalValue.toLocaleString()}
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <GradBtn label="Add Item" icon="add" small />
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
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function ProjectTimelineTab() {
  const [view, setView] = useState<TimelineView>("gantt");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        fontFamily: "inherit",
      }}
    >
      <TabBar view={view} setView={setView} />
      <div style={{ flex: 1 }}>
        {view === "gantt" && <GanttChart />}
        {view === "milestones" && <MilestonesView />}
        {view === "client" && <ClientView />}
        {view === "materials" && <MaterialsView />}
      </div>
    </div>
  );
}
