"use client";

import { useState } from "react";
import { DemoCaption } from "@/components/demo/demo-caption";
import { UserManagementPage } from "@/components/user-management/user-management-page";
import { ProjectAssignmentsPanel } from "@/components/user-management/project-assignments-panel";
import { TeamPage } from "@/components/team/team-page";
import { GlobalHoldRequestsPage } from "@/components/hold-requests/global-hold-requests-page";
import AccessRequestsPage from "@/app/(dashboard)/access-requests/page";

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
  cardHover:
    "10px 10px 24px rgba(163,177,198,0.50), -8px -8px 18px rgba(255,255,255,0.98)",
  inset:
    "inset 3px 3px 8px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.90)",
  modal:
    "16px 16px 40px rgba(163,177,198,0.45), -10px -10px 28px rgba(255,255,255,0.95)",
  dropdown:
    "12px 12px 30px rgba(163,177,198,0.40), -8px -8px 20px rgba(255,255,255,0.95)",
};

type AdminView = "users" | "assignments" | "settings" | "team" | "holds" | "access";

// ── Shared primitives ─────────────────────────────────────────────────────────
function GradBtn({
  label,
  icon,
  onClick,
  small = false,
  wide = false,
}: {
  label: string;
  icon?: string;
  onClick?: () => void;
  small?: boolean;
  wide?: boolean;
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
        justifyContent: "center",
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
        width: wide ? "100%" : "auto",
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

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        border: "none",
        background: checked
          ? `linear-gradient(90deg, ${T.navy}, ${T.teal})`
          : T.gray200,
        cursor: "pointer",
        position: "relative",
        transition: "background 200ms",
        boxShadow: S.inset,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: T.white,
          boxShadow: S.raised,
          transition: "left 200ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </button>
  );
}

function InsetInput({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  error = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: T.gray700,
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        type={type}
        placeholder={placeholder}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: focused
            ? `2px solid ${error ? T.alert : T.teal}`
            : `1.5px solid ${error ? T.alert : T.border}`,
          background: T.gray50,
          boxShadow: S.inset,
          fontFamily: "inherit",
          fontSize: 13,
          color: T.navy,
          outline: "none",
          transition: "border 150ms",
        }}
      />
      {error && (
        <span style={{ fontSize: 11, color: T.alert }}>{error}</span>
      )}
    </div>
  );
}

// ── ADMIN TAB BAR ─────────────────────────────────────────────────────────────
const ADMIN_TABS: {
  id: AdminView;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "users",
    label: "User Management",
    icon: "manage_accounts",
    desc: "Manage users, roles & access",
  },
  {
    id: "assignments",
    label: "Project Assignments",
    icon: "assignment_ind",
    desc: "Assign team to projects",
  },
  {
    id: "settings",
    label: "System Settings",
    icon: "settings",
    desc: "Branding, config & data",
  },
  {
    id: "team",
    label: "Team Directory",
    icon: "groups",
    desc: "Company directory",
  },
  {
    id: "holds",
    label: "Hold Requests",
    icon: "pause_circle",
    desc: "Manage timeline pauses",
  },
  {
    id: "access",
    label: "Access Requests",
    icon: "how_to_reg",
    desc: "Project access approvals",
  },
];

function AdminTabBar({
  view,
  setView,
}: {
  view: AdminView;
  setView: (v: AdminView) => void;
}) {
  return (
    <div
      style={{
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 40px",
        display: "flex",
        gap: 2,
      }}
    >
      {ADMIN_TABS.map((tab) => {
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 20px",
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
              whiteSpace: "nowrap",
            }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 17 }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ── SYSTEM SETTINGS ───────────────────────────────────────────────────────────
function SystemSettings() {
  const [companyName, setCompanyName] = useState("GRID Interior Design");
  const [timezone, setTimezone] = useState("Asia/Dubai");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [currency, setCurrency] = useState("AED");
  const [notifs, setNotifs] = useState({
    deadline: true,
    upload: true,
    assignment: true,
    mention: true,
  });
  const [saved, setSaved] = useState(false);
  const [showRecovered, setShowRecovered] = useState(false);

  const toggleNotif = (k: keyof typeof notifs) =>
    setNotifs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div style={{ padding: "28px 40px", paddingBottom: 80 }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: T.navy,
            margin: "0 0 4px",
          }}
        >
          System Settings
        </h1>
        <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
          Configure your GRID CRM workspace
        </p>
        <DemoCaption className="mt-1" />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 740,
        }}
      >
        {/* Company Branding */}
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
              fontSize: 14,
              fontWeight: 700,
              color: T.navy,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 17, color: T.teal }}
            >
              palette
            </span>
            Company Branding
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            {/* Logo dropzone */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.gray700,
                  marginBottom: 8,
                }}
              >
                Company Logo
              </div>
              <div
                style={{
                  width: 140,
                  height: 80,
                  borderRadius: 12,
                  border: `2px dashed ${T.border}`,
                  background: T.gray50,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: S.inset,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: `linear-gradient(135deg,${T.navy},${T.teal})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="material-icons-outlined"
                    style={{ fontSize: 20, color: T.white }}
                  >
                    grid_view
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: T.white,
                    boxShadow: S.raised,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="material-icons-outlined"
                    style={{ fontSize: 13, color: T.teal }}
                  >
                    edit
                  </span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <InsetInput
                label="Company Name"
                value={companyName}
                onChange={setCompanyName}
              />
            </div>
          </div>
        </div>

        {/* General Configuration */}
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
              fontSize: 14,
              fontWeight: 700,
              color: T.navy,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 17, color: T.teal }}
            >
              settings
            </span>
            General Configuration
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14,
            }}
          >
            {[
              {
                label: "Timezone",
                val: timezone,
                set: setTimezone,
                opts: [
                  "Asia/Dubai",
                  "Europe/London",
                  "America/New_York",
                  "Asia/Tokyo",
                ],
              },
              {
                label: "Date Format",
                val: dateFormat,
                set: setDateFormat,
                opts: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
              },
              {
                label: "Currency",
                val: currency,
                set: setCurrency,
                opts: ["AED", "USD", "EUR", "GBP", "SAR"],
              },
            ].map((f) => (
              <div key={f.label}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.gray700,
                    marginBottom: 5,
                  }}
                >
                  {f.label}
                </div>
                <select
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${T.border}`,
                    background: T.gray50,
                    fontFamily: "inherit",
                    fontSize: 13,
                    color: T.navy,
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: S.inset,
                  }}
                >
                  {f.opts.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
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
              fontSize: 14,
              fontWeight: 700,
              color: T.navy,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 17, color: T.teal }}
            >
              notifications
            </span>
            Notification Preferences
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(
              [
                {
                  key: "deadline" as const,
                  label: "Deadline Alerts",
                  desc: "Get notified when tasks or milestones are approaching or overdue",
                },
                {
                  key: "upload" as const,
                  label: "File Uploads",
                  desc: "Notifications when new files are added to any project",
                },
                {
                  key: "assignment" as const,
                  label: "Task Assignments",
                  desc: "Notify when a task is assigned to you",
                },
                {
                  key: "mention" as const,
                  label: "Mentions",
                  desc: "Notify when someone mentions you in a comment",
                },
              ] as const
            ).map((n, i, arr) => (
              <div
                key={n.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom:
                    i < arr.length - 1 ? `1px solid ${T.border}` : "none",
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
                    {n.label}
                  </div>
                  <div style={{ fontSize: 11, color: T.gray500 }}>
                    {n.desc}
                  </div>
                </div>
                <Toggle
                  checked={notifs[n.key]}
                  onChange={() => toggleNotif(n.key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Data & Privacy */}
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
              fontSize: 14,
              fontWeight: 700,
              color: T.navy,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 17, color: T.teal }}
            >
              security
            </span>
            Data &amp; Privacy
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "14px 16px",
              borderRadius: 10,
              background: `${T.teal}08`,
              border: `1.5px solid ${T.teal}22`,
              marginBottom: 14,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 17, color: T.teal, flexShrink: 0, marginTop: 1 }}
            >
              shield
            </span>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.navy,
                  marginBottom: 2,
                }}
              >
                Soft Delete Protection
              </div>
              <div
                style={{ fontSize: 11, color: T.gray500, lineHeight: 1.5 }}
              >
                All deletions in GRID CRM are soft deletes — records are hidden
                but never permanently removed. Super Admins can recover any
                deleted item.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowRecovered((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1.5px solid ${T.border}`,
              background: T.white,
              boxShadow: S.raised,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              color: T.navy,
              fontWeight: 500,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 16, color: T.teal }}
            >
              restore_from_trash
            </span>
            View Deleted Records
          </button>
          {showRecovered && (
            <div
              style={{
                marginTop: 12,
                borderRadius: 12,
                border: `1px solid ${T.border}`,
                background: T.gray50,
                padding: 12,
              }}
            >
              {[
                { type: "Client", name: "Carla Conti" },
                { type: "Supplier", name: "Cattaneo Illuminazione" },
                { type: "Project", name: "Conti Showroom" },
              ].map((row) => (
                <div
                  key={row.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 4px",
                    fontSize: 12,
                    color: T.navy,
                  }}
                >
                  <span>
                    <strong>{row.type}</strong> · {row.name}
                  </span>
                  <span style={{ color: T.teal, fontWeight: 600 }}>Restore</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: T.white,
          borderTop: `1px solid ${T.border}`,
          padding: "12px 0 20px",
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 14,
          zIndex: 50,
          boxShadow: "0 -4px 20px rgba(27,42,74,0.08)",
        }}
      >
        {saved && (
          <span
            style={{
              fontSize: 13,
              color: T.success,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 15 }}
            >
              check_circle
            </span>
            Settings saved successfully
          </span>
        )}
        <GradBtn
          label="Save Settings"
          icon="save"
          small
          onClick={() => setSaved(true)}
        />
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function AdminWorkspace() {
  const [view, setView] = useState<AdminView>("users");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        fontFamily: "inherit",
      }}
    >
      <AdminTabBar view={view} setView={setView} />
      <div style={{ flex: 1 }}>
        {view === "users" && (
          <div style={{ padding: "28px 40px" }}>
            <UserManagementPage />
          </div>
        )}
        {view === "assignments" && <ProjectAssignmentsPanel />}
        {view === "settings" && <SystemSettings />}
        {view === "team" && (
          <div style={{ padding: "28px 40px" }}>
            <TeamPage />
          </div>
        )}
        {view === "holds" && (
          <div style={{ padding: "28px 40px" }}>
            <GlobalHoldRequestsPage />
          </div>
        )}
        {view === "access" && (
          <div style={{ padding: "28px 40px" }}>
            <AccessRequestsPage />
          </div>
        )}
      </div>
    </div>
  );
}
