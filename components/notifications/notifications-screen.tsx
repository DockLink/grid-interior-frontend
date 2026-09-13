"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useNotifications } from "@/hooks/use-notifications";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  mapAppNotificationToRow,
  matchesNotificationFilter,
  NOTIFICATION_FILTER_TABS,
  NOTIFICATION_TIME_GROUPS,
  type NotificationUIFilter,
  type NotificationUIRow,
} from "@/lib/notifications/map-notification-ui";
import type { AppNotification } from "@/types/notifications";

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
  row,
  read,
  onMarkRead,
  onNavigate,
  onApprove,
  onDecline,
}: {
  row: NotificationUIRow;
  read: boolean;
  onMarkRead: () => void;
  onNavigate: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
}) {
  return (
    <div
      className={`flex w-full items-start gap-3.5 border-b border-[var(--figma-border)] px-5 py-3.5 text-left last:border-b-0 ${
        read ? "bg-white" : "bg-[rgba(14,124,134,0.03)]"
      }`}
    >
      <button type="button" onClick={onNavigate} className="flex min-w-0 flex-1 items-start gap-3.5 text-left">
        <div
          className={`mt-1.5 size-2 shrink-0 rounded-full ${
            read ? "bg-transparent" : "bg-[var(--figma-teal)] shadow-[0_0_6px_rgba(14,124,134,0.53)]"
          }`}
        />
        <div
          className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: row.iconBg, boxShadow: "var(--neu-inset)" }}
        >
          <MaterialIcon name={row.icon} size={19} style={{ color: row.iconColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[13px] leading-snug text-[var(--figma-gray500)]">
            {boldify(row.body, row.bold)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[7px] bg-[rgba(27,42,74,0.06)] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-[var(--figma-navy)]">
              {row.projectLabel}
            </span>
            <span className="text-[11px] text-[var(--figma-gray400)]">{row.time}</span>
          </div>
        </div>
      </button>

      {row.actionable && onApprove && onDecline ? (
        <div className="flex shrink-0 flex-col gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              onMarkRead();
              onApprove();
            }}
            className="rounded-md bg-[#3D8B5E] px-2.5 py-1 text-[11px] font-semibold text-white"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => {
              onMarkRead();
              onDecline();
            }}
            className="rounded-md border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-600"
          >
            Decline
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            onMarkRead();
            onNavigate();
          }}
          className="mt-2 shrink-0 text-[11px] font-semibold text-[var(--figma-teal)]"
        >
          View
        </button>
      )}
    </div>
  );
}

export function NotificationsScreen() {
  const router = useRouter();
  const authDisabled = isAuthDisabled();
  const [filter, setFilter] = useState<NotificationUIFilter>("all");
  const {
    notifications,
    isLoading,
    markAllRead,
    markRead,
    isUnread,
    processHoldRequest,
    processAccessRequest,
    canReviewHolds,
    canReviewAccess,
  } = useNotifications();

  const rows = useMemo(
    () =>
      notifications
        .filter((n) => matchesNotificationFilter(n, filter))
        .map(mapAppNotificationToRow),
    [notifications, filter],
  );

  const unreadCounts = useMemo(() => {
    const counts: Record<NotificationUIFilter, number> = {
      all: 0,
      hold: 0,
      access: 0,
      file: 0,
      deadline: 0,
    };
    for (const n of notifications) {
      if (!isUnread(n.key)) continue;
      counts.all += 1;
      const row = mapAppNotificationToRow(n);
      counts[row.filter] += 1;
    }
    return counts;
  }, [notifications, isUnread]);

  async function handleHoldAction(n: AppNotification, action: "approve" | "reject") {
    if (n.type !== "hold_request") return;
    try {
      await processHoldRequest({
        taskableHoldRequestId: n.id,
        action,
      });
      toast.success(action === "approve" ? "Hold request approved" : "Hold request rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process hold request");
    }
  }

  async function handleAccessAction(n: AppNotification, action: "approve" | "reject") {
    if (n.type !== "access_request") return;
    try {
      await processAccessRequest({
        accessRequestId: n.id,
        action,
        grantedRole: action === "approve" ? "MEMBER" : undefined,
      });
      toast.success(action === "approve" ? "Access request approved" : "Access request rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process access request");
    }
  }

  return (
    <div className="-mx-4 px-4 md:-mx-8 md:px-10">
      {authDisabled && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          Live notifications require auth. Copy <code className="font-mono">.env.local.example</code> to{" "}
          <code className="font-mono">.env.local</code> and set{" "}
          <code className="font-mono">NEXT_PUBLIC_ENABLE_AUTH=true</code>.
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[var(--figma-navy)]">Notifications</h1>
          <p className="mt-0.5 text-xs text-[var(--figma-gray500)]">
            Stay up to date with holds, access requests, and file activity
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAllRead()}
          className="flex items-center gap-1.5 border-none bg-transparent text-[13px] font-semibold text-[var(--figma-teal)]"
        >
          <MaterialIcon name="done_all" size={15} />
          Mark all as read
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {NOTIFICATION_FILTER_TABS.map((tab) => {
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

      {isLoading ? (
        <p className="py-12 text-center text-sm text-[var(--figma-gray500)]">Loading notifications…</p>
      ) : rows.length === 0 ? (
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
          {NOTIFICATION_TIME_GROUPS.map((grp) => {
            const groupRows = rows.filter((n) => n.group === grp);
            if (groupRows.length === 0) return null;
            return (
              <div key={grp}>
                <div className="sticky top-0 z-[5] border-b border-[var(--figma-border)] bg-[var(--figma-gray50)] px-5 py-2.5">
                  <span className="text-[11px] font-bold tracking-[0.08em] text-[var(--figma-gray500)] uppercase">
                    {grp}
                  </span>
                </div>
                <div>
                  {groupRows.map((row) => (
                    <NotifRow
                      key={row.key}
                      row={row}
                      read={!isUnread(row.key)}
                      onMarkRead={() => markRead(row.key)}
                      onNavigate={() => router.push(row.href)}
                      onApprove={
                        row.actionable && row.raw.type === "hold_request" && canReviewHolds
                          ? () => void handleHoldAction(row.raw, "approve")
                          : row.actionable && row.raw.type === "access_request" && canReviewAccess
                            ? () => void handleAccessAction(row.raw, "approve")
                            : undefined
                      }
                      onDecline={
                        row.actionable && row.raw.type === "hold_request" && canReviewHolds
                          ? () => void handleHoldAction(row.raw, "reject")
                          : row.actionable && row.raw.type === "access_request" && canReviewAccess
                            ? () => void handleAccessAction(row.raw, "reject")
                            : undefined
                      }
                    />
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
