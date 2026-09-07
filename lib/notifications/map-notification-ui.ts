import { NAV_ROUTES, projectTabRoute } from "@/types/navigation";
import type { AppNotification } from "@/types/notifications";

export type NotificationUIFilter = "all" | "hold" | "access" | "file";

export type NotificationUIRow = {
  id: string;
  key: string;
  filter: Exclude<NotificationUIFilter, "all">;
  title: string;
  body: string;
  bold: string;
  projectLabel: string;
  time: string;
  group: "Today" | "Yesterday" | "This Week" | "Earlier";
  icon: string;
  iconColor: string;
  iconBg: string;
  href: string;
  actionable: boolean;
  raw: AppNotification;
};

const FILTER_ICON: Record<
  Exclude<NotificationUIFilter, "all">,
  { icon: string; color: string; bg: string }
> = {
  hold: { icon: "pause_circle", color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  access: { icon: "person_add", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.08)" },
  file: { icon: "upload_file", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.08)" },
};

function notificationFilter(type: AppNotification["type"]): Exclude<NotificationUIFilter, "all"> {
  if (type === "hold_request") return "hold";
  if (type === "access_request") return "access";
  return "file";
}

function projectLabelFor(n: AppNotification): string {
  if (n.type === "access_request") return n.projectName;
  if (n.type === "file_version" || n.type === "share_link") return n.projectName;
  if (n.type === "hold_request" && n.projectId) return "Project";
  return "Studio";
}

function hrefFor(n: AppNotification): string {
  if (n.type === "hold_request") {
    return n.projectId ? projectTabRoute(n.projectId, "hold-requests") : NAV_ROUTES.holdRequests;
  }
  if (n.type === "access_request") return NAV_ROUTES.accessRequests;
  if (n.type === "file_version" || n.type === "share_link") {
    return projectTabRoute(n.projectId, "files");
  }
  return NAV_ROUTES.notifications;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeGroup(iso: string): NotificationUIRow["group"] {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Earlier";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfWeek) return "This Week";
  return "Earlier";
}

export function mapAppNotificationToRow(n: AppNotification): NotificationUIRow {
  const filter = notificationFilter(n.type);
  const cfg = FILTER_ICON[filter];
  const bold = n.requesterName || n.title.split(" ")[0] || "Update";

  return {
    id: n.id,
    key: n.key,
    filter,
    title: n.title,
    body: n.body,
    bold,
    projectLabel: projectLabelFor(n),
    time: formatRelativeTime(n.createdAt),
    group: timeGroup(n.createdAt),
    icon: cfg.icon,
    iconColor: cfg.color,
    iconBg: cfg.bg,
    href: hrefFor(n),
    actionable: n.actionable,
    raw: n,
  };
}

export function matchesNotificationFilter(
  n: AppNotification,
  filter: NotificationUIFilter,
): boolean {
  if (filter === "all") return true;
  return notificationFilter(n.type) === filter;
}

export const NOTIFICATION_FILTER_TABS: { key: NotificationUIFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "hold", label: "Holds" },
  { key: "access", label: "Access" },
  { key: "file", label: "Files" },
];

export const NOTIFICATION_TIME_GROUPS: NotificationUIRow["group"][] = [
  "Today",
  "Yesterday",
  "This Week",
  "Earlier",
];
