"use client";

import { useState } from "react";

import { DemoCaption } from "@/components/demo/demo-caption";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  MOCK_NOTIFICATIONS,
  type MockNotification,
  type NotificationFilter,
} from "@/lib/notifications/mock-notifications";

const TYPE_CFG: Record<
  MockNotification["type"],
  { icon: string; color: string; bg: string; label: string }
> = {
  task: { icon: "task_alt", color: "var(--figma-navy)", bg: "rgba(27,42,74,0.07)", label: "Task Updates" },
  file: { icon: "upload_file", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.08)", label: "File Uploads" },
  deadline: { icon: "alarm", color: "var(--figma-alert)", bg: "#FEE2E2", label: "Deadline Alerts" },
  mention: { icon: "alternate_email", color: "var(--figma-navy)", bg: "rgba(27,42,74,0.06)", label: "Mentions" },
};

const FILTER_TABS: { key: NotificationFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "task", label: "Task Updates" },
  { key: "file", label: "File Uploads" },
  { key: "deadline", label: "Deadline Alerts" },
  { key: "mention", label: "Mentions" },
];

const PROJECT_COLORS: Record<string, string> = {
  "Marchetti Villa": "var(--figma-navy)",
  "Delgado Residence": "var(--figma-teal)",
  "Tanaka Penthouse": "#8B5CF6",
  "Al-Mansoori Suite": "#D97706",
};

function boldify(text: string, bold: string) {
  const idx = text.indexOf(bold);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-bold text-[var(--figma-navy)]">{bold}</strong>
      {text.slice(idx + bold.length)}
    </>
  );
}

function NotifRow({
  n,
  onMarkRead,
}: {
  n: MockNotification;
  onMarkRead: (id: number) => void;
}) {
  const cfg = TYPE_CFG[n.type];
  return (
    <button
      type="button"
      onClick={() => onMarkRead(n.id)}
      className={`flex w-full items-start gap-3.5 border-b border-[var(--figma-border)] px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[rgba(14,124,134,0.05)] ${
        n.read ? "bg-white" : "bg-[rgba(14,124,134,0.03)]"
      }`}
    >
      <div
        className={`mt-1.5 size-2 shrink-0 rounded-full ${
          n.read ? "bg-transparent" : "bg-[var(--figma-teal)] shadow-[0_0_6px_rgba(14,124,134,0.53)]"
        }`}
      />
      <div
        className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px]"
        style={{ background: cfg.bg, boxShadow: "var(--neu-inset)" }}
      >
        <MaterialIcon name={cfg.icon} size={19} style={{ color: cfg.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[13px] leading-snug text-[var(--figma-gray500)]">
          {boldify(n.text, n.bold)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-[7px] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
            style={{
              background: `${PROJECT_COLORS[n.project] ?? "var(--figma-gray500)"}14`,
              color: PROJECT_COLORS[n.project] ?? "var(--figma-gray500)",
            }}
          >
            {n.project}
          </span>
          <span className="text-[11px] text-[var(--figma-gray400)]">{n.time}</span>
        </div>
      </div>
      <MaterialIcon name="chevron_right" size={16} className="mt-2.5 shrink-0 text-[var(--figma-gray400)] opacity-0 group-hover:opacity-100" />
    </button>
  );
}

export function NotificationsScreen() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

  const filtered = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);
  const unreadCounts = {
    all: notifs.filter((n) => !n.read).length,
    task: notifs.filter((n) => !n.read && n.type === "task").length,
    file: notifs.filter((n) => !n.read && n.type === "file").length,
    deadline: notifs.filter((n) => !n.read && n.type === "deadline").length,
    mention: notifs.filter((n) => !n.read && n.type === "mention").length,
  };

  const groups = ["Today", "Yesterday", "This Week"] as const;

  return (
    <div className="-mx-4 px-4 md:-mx-8 md:px-10">
      <DemoCaption />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[var(--figma-navy)]">Notifications</h1>
          <p className="mt-0.5 text-xs text-[var(--figma-gray500)]">
            Stay up to date with your projects and tasks
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNotifs((p) => p.map((n) => ({ ...n, read: true })))}
          className="flex items-center gap-1.5 border-none bg-transparent text-[13px] font-semibold text-[var(--figma-teal)]"
        >
          <MaterialIcon name="done_all" size={15} />
          Mark all as read
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {FILTER_TABS.map((tab) => {
          const cnt = unreadCounts[tab.key];
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-[20px] px-4 py-2 text-xs transition-all ${
                active
                  ? "gi-gradient-cta font-bold text-white"
                  : "bg-[var(--figma-gray100)] font-normal text-[var(--figma-gray500)]"
              }`}
              style={active ? { boxShadow: "var(--neu-raised)" } : undefined}
            >
              {tab.label}
              {cnt > 0 ? (
                <span
                  className={`min-w-4 rounded-[10px] px-1.5 py-px text-center text-[10px] font-bold ${
                    active ? "bg-white/25 text-white" : "bg-[var(--figma-alert)] text-white"
                  }`}
                >
                  {cnt}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div
            className="flex size-[72px] items-center justify-center rounded-[18px] gi-gradient-cta"
            style={{ boxShadow: "var(--neu-card)" }}
          >
            <MaterialIcon name="notifications_none" size={34} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-[var(--figma-navy)]">You&apos;re all caught up!</h3>
          <p className="text-[13px] text-[var(--figma-gray500)]">No notifications in this category.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: "var(--neu-card)" }}>
          {groups.map((grp) => {
            const rows = filtered.filter((n) => n.group === grp);
            if (rows.length === 0) return null;
            return (
              <div key={grp}>
                <div className="sticky top-0 z-[5] border-b border-[var(--figma-border)] bg-[var(--figma-gray50)] px-5 py-2.5">
                  <span className="text-[11px] font-bold tracking-[0.08em] text-[var(--figma-gray500)] uppercase">
                    {grp}
                  </span>
                </div>
                <div className="group">
                  {rows.map((n) => (
                    <NotifRow key={n.id} n={n} onMarkRead={(id) => setNotifs((p) => p.map((x) => (x.id === id ? { ...x, read: true } : x)))} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
