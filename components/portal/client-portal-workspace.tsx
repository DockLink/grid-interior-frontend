"use client";

import { useState } from "react";
import {
  PORTAL_MATERIALS,
  PORTAL_MILESTONES,
  PORTAL_PHASES,
  PORTAL_PROJECT,
  type PortalMaterial,
  type PortalPhase,
} from "@/lib/portal/mock-portal";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  navy: "#1B2A4A",
  navyMid: "#243458",
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
};

type PortalView = "home" | "timeline" | "materials";

const MILESTONE_BADGE = {
  completed: { label: "Done", color: "#3FA66B", bg: "#DCFCE7" },
  upcoming: { label: "Upcoming", color: "#6B7280", bg: "#F3F4F6" },
  overdue: { label: "Needs attention", color: "#EF4444", bg: "#FEE2E2" },
};

const MATERIAL_STATUS = {
  approved: { label: "Approved", color: "#0E7C86", bg: "rgba(14,124,134,0.10)" },
  pending: {
    label: "Finalized",
    color: "#0E7C86",
    bg: "rgba(14,124,134,0.10)",
  },
  ordered: { label: "On Order", color: "#3FA66B", bg: "#DCFCE7" },
  delivered: { label: "Delivered", color: "#6B7280", bg: "#F3F4F6" },
};

// ── PORTAL HEADER ─────────────────────────────────────────────────────────────
function PortalHeader({
  view,
  setView,
}: {
  view: PortalView;
  setView: (v: PortalView) => void;
}) {
  return (
    <header
      style={{
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        flexShrink: 0,
        boxShadow: "0 4px 24px rgba(27,42,74,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: S.raised,
          }}
        >
          <span
            className="material-icons-outlined"
            style={{ fontSize: 18, color: T.white }}
          >
            grid_view
          </span>
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: T.white,
              letterSpacing: "0.04em",
            }}
          >
            GRID Interior
          </div>
          <div
            style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 1 }}
          >
            Client Portal
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 2 }}>
        {(
          [
            { id: "home" as PortalView, label: "Overview", icon: "home" },
            {
              id: "timeline" as PortalView,
              label: "Timeline",
              icon: "timeline",
            },
            {
              id: "materials" as PortalView,
              label: "Materials",
              icon: "inventory_2",
            },
          ] as const
        ).map((tab) => {
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: active ? "rgba(255,255,255,0.14)" : "transparent",
                color: active ? T.white : "rgba(255,255,255,0.55)",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              <span
                className="material-icons-outlined"
                style={{ fontSize: 15 }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Project badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          borderRadius: 20,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{ fontSize: 10, fontWeight: 800, color: T.white }}
          >
            GM
          </span>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.white }}>
            {PORTAL_PROJECT.clientName}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
            {PORTAL_PROJECT.projectId}
          </div>
        </div>
      </div>
    </header>
  );
}

// ── HOME VIEW ─────────────────────────────────────────────────────────────────
function PortalHome({ setView }: { setView: (v: PortalView) => void }) {
  const activePhase = PORTAL_PHASES.find((p) => p.status === "active");
  const nextMilestone = PORTAL_MILESTONES.find(
    (m) => m.status === "upcoming"
  );
  const needsAttention = PORTAL_MILESTONES.filter(
    (m) => m.status === "overdue" || m.status === "upcoming"
  ).slice(0, 3);
  const pendingMaterials = PORTAL_MATERIALS.filter(
    (m) => m.status === "pending"
  );

  return (
    <div style={{ padding: "40px 40px 60px" }}>
      {/* Welcome hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyMid} 50%, ${T.teal}88 100%)`,
          borderRadius: 24,
          padding: "36px 40px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(27,42,74,0.3)",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: `${T.teal}18`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: -80,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `${T.tealLight}10`,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Welcome back
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: T.white,
              margin: "0 0 6px",
              lineHeight: 1.2,
            }}
          >
            {PORTAL_PROJECT.clientName}
          </h1>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              marginBottom: 24,
            }}
          >
            {PORTAL_PROJECT.name}
          </div>

          {/* Progress bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              maxWidth: 500,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: "rgba(255,255,255,0.18)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${PORTAL_PROJECT.overallProgress}%`,
                  background: `linear-gradient(90deg, ${T.tealLight}, ${T.teal})`,
                  borderRadius: 4,
                  transition: "width 800ms ease",
                }}
              />
            </div>
            <span
              style={{ fontSize: 14, fontWeight: 800, color: T.white }}
            >
              {PORTAL_PROJECT.overallProgress}%
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              marginTop: 6,
            }}
          >
            Overall project progress · {PORTAL_PROJECT.startDate} –{" "}
            {PORTAL_PROJECT.endDate}
          </div>
        </div>
      </div>

      {/* Quick stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          {
            icon: "layers",
            label: "Current Phase",
            value: activePhase?.name ?? "—",
            sub: `${activePhase?.progress}% complete`,
            color: T.teal,
          },
          {
            icon: "flag",
            label: "Next Milestone",
            value: nextMilestone?.name ?? "—",
            sub: nextMilestone?.date,
            color: "#8B5CF6",
          },
          {
            icon: "inventory_2",
            label: "Your Approval Needed",
            value: `${pendingMaterials.length} items`,
            sub: "Tap Materials to review",
            color: "#D97706",
          },
          {
            icon: "person_outline",
            label: "Your Designer",
            value: PORTAL_PROJECT.designer,
            sub: "Available for questions",
            color: T.success,
          },
        ].map((s) => (
          <div
            key={s.label}
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
                style={{ fontSize: 20, color: s.color }}
              >
                {s.icon}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.gray400, marginBottom: 3 }}>
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.navy,
                  marginBottom: 2,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: T.gray500 }}>{s.sub}</div>
            </div>
          </div>
        ))}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div
            style={{ fontSize: 15, fontWeight: 700, color: T.navy }}
          >
            Project Journey
          </div>
          <button
            onClick={() => setView("timeline")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: T.teal,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "inherit",
            }}
          >
            Full Timeline
            <span className="material-icons-outlined" style={{ fontSize: 15 }}>
              arrow_forward
            </span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {PORTAL_PHASES.map((phase, idx) => {
            const isDone = phase.status === "completed";
            const isActive = phase.status === "active";
            return (
              <div
                key={phase.id}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 15,
                      left: 0,
                      right: "50%",
                      height: 2,
                      background: isDone || isActive ? T.teal : T.border,
                      zIndex: 0,
                    }}
                  />
                )}
                {idx < PORTAL_PHASES.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 15,
                      left: "50%",
                      right: 0,
                      height: 2,
                      background: isDone ? T.teal : T.border,
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Dot */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: isDone
                      ? T.teal
                      : isActive
                      ? T.white
                      : T.gray100,
                    border: isActive
                      ? `3px solid ${T.teal}`
                      : isDone
                      ? "none"
                      : `2px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: (isDone || isActive) ? S.raised : "none",
                    zIndex: 1,
                    position: "relative",
                    transition: "all 200ms",
                  }}
                >
                  {isDone && (
                    <span
                      className="material-icons"
                      style={{ fontSize: 15, color: T.white }}
                    >
                      check
                    </span>
                  )}
                  {isActive && (
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: T.teal,
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 9,
                    fontWeight: isActive ? 700 : 500,
                    color: isDone
                      ? T.teal
                      : isActive
                      ? T.navy
                      : T.gray400,
                    textAlign: "center",
                    lineHeight: 1.3,
                    padding: "0 4px",
                  }}
                >
                  {phase.name}
                </div>
                {isActive && (
                  <span
                    style={{
                      marginTop: 4,
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.teal,
                    }}
                  >
                    {phase.progress}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attention items */}
      {needsAttention.length > 0 && (
        <div
          style={{
            background: T.white,
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: S.card,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: T.navy,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 17, color: "#D97706" }}
            >
              notification_important
            </span>
            Requires Your Attention
          </div>
          {needsAttention.map((m, idx) => {
            const cfg = MILESTONE_BADGE[m.status];
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom:
                    idx < needsAttention.length - 1
                      ? `1px solid ${T.border}`
                      : "none",
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{
                    fontSize: 18,
                    color: cfg.color,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {m.status === "overdue" ? "alarm" : "flag"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.navy,
                      marginBottom: 2,
                    }}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.gray500,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "1px 8px",
                        borderRadius: 8,
                        color: cfg.color,
                        background: cfg.bg,
                      }}
                    >
                      {cfg.label}
                    </span>
                    {m.date}
                  </div>
                  {m.notes && (
                    <div
                      style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}
                    >
                      {m.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TIMELINE VIEW ─────────────────────────────────────────────────────────────
function PortalTimeline() {
  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 800 }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: T.navy,
          margin: "0 0 4px",
        }}
      >
        Your Project Timeline
      </h1>
      <p style={{ fontSize: 12, color: T.gray500, margin: "0 0 28px" }}>
        {PORTAL_PROJECT.name} · {PORTAL_PROJECT.startDate} –{" "}
        {PORTAL_PROJECT.endDate}
      </p>

      {/* Progress bar */}
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "20px 24px",
          boxShadow: S.card,
          marginBottom: 24,
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
            Overall Progress
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>
            {PORTAL_PROJECT.overallProgress}%
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
              width: `${PORTAL_PROJECT.overallProgress}%`,
              background: `linear-gradient(90deg, ${T.navy}, ${T.teal})`,
              borderRadius: 5,
              transition: "width 600ms ease",
            }}
          />
        </div>
      </div>

      {/* Phases */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: T.navy,
            marginBottom: 14,
          }}
        >
          Phases
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PORTAL_PHASES.map((phase) => {
            const isDone = phase.status === "completed";
            const isActive = phase.status === "active";
            return (
              <div
                key={phase.id}
                style={{
                  background: T.white,
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow: S.card,
                  borderLeft: `4px solid ${
                    isDone ? T.teal : isActive ? T.navy : T.border
                  }`,
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
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isDone
                            ? T.teal
                            : isActive
                            ? T.navy
                            : T.gray400,
                        }}
                      >
                        {phase.name}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
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
                    <div style={{ fontSize: 12, color: T.gray500 }}>
                      {phase.startDate} – {phase.endDate}
                    </div>
                  </div>
                  {isDone && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: T.teal,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: S.raised,
                      }}
                    >
                      <span
                        className="material-icons"
                        style={{ fontSize: 15, color: T.white }}
                      >
                        check
                      </span>
                    </div>
                  )}
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: T.gray500,
                    lineHeight: 1.5,
                    margin: "0 0 10px",
                  }}
                >
                  {phase.description}
                </p>

                {isActive && (
                  <div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: T.gray100,
                        boxShadow: S.inset,
                        overflow: "hidden",
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
                    <div
                      style={{
                        fontSize: 10,
                        color: T.teal,
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      {phase.progress}% complete
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: T.navy,
            marginBottom: 14,
          }}
        >
          Milestones
        </div>
        <div
          style={{
            background: T.white,
            borderRadius: 16,
            boxShadow: S.card,
            overflow: "hidden",
          }}
        >
          {PORTAL_MILESTONES.map((m, idx) => {
            const cfg = MILESTONE_BADGE[m.status];
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 18px",
                  borderBottom:
                    idx < PORTAL_MILESTONES.length - 1
                      ? `1px solid ${T.border}`
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background:
                      m.status === "completed"
                        ? T.teal
                        : m.status === "overdue"
                        ? "#EF4444"
                        : T.gray100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: m.status !== "upcoming" ? S.raised : "none",
                    marginTop: 1,
                  }}
                >
                  {m.status === "completed" && (
                    <span
                      className="material-icons"
                      style={{ fontSize: 13, color: T.white }}
                    >
                      check
                    </span>
                  )}
                  {m.status === "overdue" && (
                    <span
                      className="material-icons"
                      style={{ fontSize: 13, color: T.white }}
                    >
                      priority_high
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.navy,
                      }}
                    >
                      {m.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 8,
                        color: cfg.color,
                        background: cfg.bg,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.gray400,
                      marginBottom: m.notes ? 4 : 0,
                    }}
                  >
                    {m.date}
                  </div>
                  {m.notes && (
                    <div style={{ fontSize: 12, color: T.gray500 }}>
                      {m.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MATERIALS VIEW ─────────────────────────────────────────────────────────────
function PortalMaterials() {
  const categories = [
    ...new Set(PORTAL_MATERIALS.map((m) => m.category)),
  ];

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 860 }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: T.navy,
          margin: "0 0 4px",
        }}
      >
        Your Material Selections
      </h1>
      <p style={{ fontSize: 12, color: T.gray500, margin: "0 0 6px" }}>
        {PORTAL_PROJECT.name} · Selected finishes, furniture, and materials
      </p>

      {/* Attention banner removed — client view is read-only */}

      {categories.map((cat) => {
        const items = PORTAL_MATERIALS.filter((m) => m.category === cat);
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.gray500,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 10,
              }}
            >
              {cat}
            </div>
            <div
              style={{
                background: T.white,
                borderRadius: 16,
                boxShadow: S.card,
                overflow: "hidden",
              }}
            >
              {items.map((item, idx) => (
                <MaterialRow
                  key={item.id}
                  item={item}
                  isLast={idx === items.length - 1}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MaterialRow({
  item,
  isLast,
}: {
  item: PortalMaterial;
  isLast: boolean;
}) {
  const cfg = MATERIAL_STATUS[item.status];

  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: isLast ? "none" : `1px solid ${T.border}`,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      {/* Status icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: cfg.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: S.inset,
        }}
      >
        <span
          className="material-icons-outlined"
          style={{
            fontSize: 18,
            color: cfg.color,
          }}
        >
          {item.status === "approved"
            ? "verified"
            : item.status === "ordered"
            ? "local_shipping"
            : item.status === "delivered"
            ? "check_circle"
            : "pending_actions"}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.navy,
            marginBottom: 3,
          }}
        >
          {item.item}
        </div>
        <div style={{ fontSize: 12, color: T.gray500, marginBottom: 6 }}>
          {item.description}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 10px",
              borderRadius: 10,
              color: cfg.color,
              background: cfg.bg,
              transition: "all 200ms",
            }}
          >
            {cfg.label}
          </span>
          {item.approvedDate && (
            <span style={{ fontSize: 11, color: T.gray400 }}>
              Confirmed {item.approvedDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PORTAL FOOTER ─────────────────────────────────────────────────────────────
function PortalFooter() {
  return (
    <footer
      style={{
        background: T.gray50,
        borderTop: `1px solid ${T.border}`,
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="material-icons-outlined"
            style={{ fontSize: 15, color: T.white }}
          >
            grid_view
          </span>
        </div>
        <span style={{ fontSize: 12, color: T.gray500 }}>
          GRID Interior Design · {PORTAL_PROJECT.projectId}
        </span>
      </div>
      <div style={{ fontSize: 12, color: T.gray400 }}>
        Questions?{" "}
        <a
          href="mailto:hello@grid-interior.ae"
          style={{ color: T.teal, fontWeight: 600, textDecoration: "none" }}
        >
          hello@grid-interior.ae
        </a>
      </div>
    </footer>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function ClientPortalWorkspace({ token }: { token?: string }) {
  const [view, setView] = useState<PortalView>("home");
  const closed = token === "expired" || token === "closed";
  const buffer = token === "buffer";

  if (closed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F7FA",
          padding: 32,
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: T.white,
            borderRadius: 20,
            padding: 36,
            boxShadow: S.card,
            textAlign: "center",
          }}
        >
          <span className="material-icons-outlined" style={{ fontSize: 40, color: T.alert }}>
            lock
          </span>
          <h1 style={{ fontSize: 22, color: T.navy, margin: "12px 0 8px" }}>Portal closed</h1>
          <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>
            This project is complete. The client portal remained open for {PORTAL_PROJECT.bufferDays} days
            after handover and is now closed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#F5F7FA",
        fontFamily:
          "'Aptos', 'Calibri', 'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      <PortalHeader view={view} setView={setView} />
      {buffer && (
        <div
          style={{
            background: "#FEF3C7",
            color: "#92400E",
            fontSize: 12,
            fontWeight: 600,
            padding: "10px 40px",
          }}
        >
          Project complete — this portal stays open for {PORTAL_PROJECT.bufferDays} days, then closes.
        </div>
      )}
      <div
        style={{
          background: T.white,
          borderBottom: `1px solid ${T.border}`,
          padding: "8px 40px",
          fontSize: 12,
          color: T.gray500,
        }}
      >
        Last Friday update: {PORTAL_PROJECT.lastFridayUpdate} · Materials list is view-only
      </div>

      <main style={{ flex: 1 }}>
        {view === "home" && <PortalHome setView={setView} />}
        {view === "timeline" && <PortalTimeline />}
        {view === "materials" && <PortalMaterials />}
      </main>

      <PortalFooter />
    </div>
  );
}
