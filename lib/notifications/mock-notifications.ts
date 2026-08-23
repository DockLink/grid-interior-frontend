export type HeaderNotificationType = "task" | "file" | "deadline";

export interface HeaderNotification {
  id: number;
  type: HeaderNotificationType;
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

export type NotificationType = "task" | "file" | "deadline" | "mention";
export type NotificationFilter = "all" | NotificationType;
export type NotificationGroup = "Today" | "Yesterday" | "This Week";

export interface MockNotification {
  id: number;
  type: NotificationType;
  text: string;
  bold: string;
  project: string;
  time: string;
  read: boolean;
  group: NotificationGroup;
}

export const MOCK_HEADER_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: 1,
    type: "deadline",
    message: "Overdue: Marchetti Residence procurement",
    detail: "Phase deadline passed 2 days ago",
    time: "2h ago",
    read: false,
  },
  {
    id: 2,
    type: "file",
    message: "New document uploaded",
    detail: "Bianchi Penthouse — Floor Plan v4.pdf",
    time: "4h ago",
    read: false,
  },
  {
    id: 3,
    type: "task",
    message: "Task assigned to you",
    detail: "Romano Gallery — Finalize material palette",
    time: "Yesterday",
    read: false,
  },
];

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 1, type: "task", text: 'Priya Nair marked "Layout drawings review" as In Progress', bold: "Layout drawings review", project: "Marchetti Villa", time: "12m ago", read: false, group: "Today" },
  { id: 2, type: "deadline", text: 'Task "Submit electrical drawings" is 2 days overdue', bold: "Submit electrical drawings", project: "Marchetti Villa", time: "1h ago", read: false, group: "Today" },
  { id: 3, type: "file", text: "Arun Patel uploaded 3 files to Site Photos", bold: "Site Photos", project: "Delgado Residence", time: "2h ago", read: false, group: "Today" },
  { id: 4, type: "mention", text: 'Rafael Ferreira mentioned you in a comment on "Concept Presentation"', bold: "Concept Presentation", project: "Marchetti Villa", time: "3h ago", read: false, group: "Today" },
  { id: 5, type: "task", text: 'Dania Sorour completed "Concept renders — Lobby"', bold: "Concept renders — Lobby", project: "Tanaka Penthouse", time: "4h ago", read: true, group: "Today" },
  { id: 6, type: "file", text: "New contract uploaded to Contracts folder", bold: "Contracts", project: "Al-Mansoori Suite", time: "5h ago", read: true, group: "Today" },
  { id: 7, type: "deadline", text: 'Milestone "Layout Approval" is due in 3 days', bold: "Layout Approval", project: "Marchetti Villa", time: "Yesterday", read: true, group: "Yesterday" },
  { id: 8, type: "task", text: 'Priya Nair assigned you "Director review — Detail Drawings"', bold: "Director review", project: "Delgado Residence", time: "Yesterday", read: true, group: "Yesterday" },
  { id: 9, type: "mention", text: 'Arun Patel mentioned you: "Please review the floor plan update"', bold: "review the floor plan", project: "Tanaka Penthouse", time: "Yesterday", read: true, group: "Yesterday" },
  { id: 10, type: "file", text: "BOQ spreadsheet updated in Supplier Quotes", bold: "Supplier Quotes", project: "Al-Mansoori Suite", time: "Yesterday", read: true, group: "Yesterday" },
  { id: 11, type: "task", text: 'Task "3D visualisation render" moved to In Progress', bold: "3D visualisation render", project: "Marchetti Villa", time: "Mon", read: true, group: "This Week" },
  { id: 12, type: "deadline", text: 'Milestone "Concept Sign-off" completed ✓', bold: "Concept Sign-off", project: "Tanaka Penthouse", time: "Mon", read: true, group: "This Week" },
  { id: 13, type: "file", text: "Dania Sorour uploaded Before/After set for Living Room", bold: "Before/After", project: "Delgado Residence", time: "Sun", read: true, group: "This Week" },
  { id: 14, type: "mention", text: "You were added to Tanaka Penthouse project", bold: "Tanaka Penthouse", project: "Tanaka Penthouse", time: "Sun", read: true, group: "This Week" },
];
