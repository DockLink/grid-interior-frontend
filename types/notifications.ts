import type { AccessRequest, AccessRequestStatus } from "@/types/access-requests";
import type { TaskableHoldRequest, TaskableHoldRequestStatus } from "@/types/hold-requests";

export type NotificationType =
  | "hold_request"
  | "access_request"
  | "file_version"
  | "share_link"
  | "deadline_alert"
  | "follow_up_reminder";

export interface FileVersionEvent {
  id: string;
  projectId: string;
  projectName: string;
  fileId: string;
  newFileName: string;
  replacedFileName: string;
  folderPath: string;
  version: number;
  uploadedByName: string;
  createdAt: string;
}

export interface FileVersionsListResponse {
  data: FileVersionEvent[];
}

export interface ShareLinkEvent {
  id: string;
  projectId: string;
  projectName: string;
  fileId: string | null;
  fileName: string | null;
  createdByName: string;
  allowDownload: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface ShareLinksListResponse {
  data: ShareLinkEvent[];
}

interface BaseNotification {
  id: string;
  key: string;
  title: string;
  body: string;
  requesterName: string;
  createdAt: string;
  actionable: boolean;
}

export interface HoldAppNotification extends BaseNotification {
  type: "hold_request";
  status: TaskableHoldRequestStatus;
  taskTitle: string;
  taskId: string;
  projectId?: string;
  raw: TaskableHoldRequest;
}

export interface AccessAppNotification extends BaseNotification {
  type: "access_request";
  status: AccessRequestStatus;
  projectName: string;
  projectId: string;
  raw: AccessRequest;
}

export interface FileVersionAppNotification extends BaseNotification {
  type: "file_version";
  projectName: string;
  projectId: string;
  folderPath: string;
  newFileName: string;
  replacedFileName: string;
  raw: FileVersionEvent;
}

export interface ShareLinkAppNotification extends BaseNotification {
  type: "share_link";
  projectName: string;
  projectId: string;
  fileId: string | null;
  fileName: string | null;
  allowDownload: boolean;
  expiresAt: string | null;
  raw: ShareLinkEvent;
}

export interface FollowUpReminderNotification extends BaseNotification {
  type: "follow_up_reminder";
  clientId: string;
  clientName: string;
  company: string | null;
  followUpDate: string;
  overdue: boolean;
}

export interface DeadlineAppNotification extends BaseNotification {
  type: "deadline_alert";
  urgency: "overdue" | "due_soon";
  taskTitle: string;
  taskId: string;
  projectId: string;
  projectName: string;
  dueDate: string;
}

export type AppNotification =
  | HoldAppNotification
  | AccessAppNotification
  | FileVersionAppNotification
  | ShareLinkAppNotification
  | DeadlineAppNotification
  | FollowUpReminderNotification;
