import type { ProjectHealthStatus, ProjectPhase } from "@/lib/projects/design-tokens";

export interface HubTeamMember {
  id: number;
  /** Real user UUID (or mock id) for API payloads such as assignee_user_id. */
  userId: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface HubActivityItem {
  icon: string;
  iconColor: string;
  text: string;
  time: string;
}

export interface ActiveProjectView {
  id: string;
  name: string;
  clientId: number;
  clientName: string;
  phase: ProjectPhase;
  phaseIndex: number;
  status: ProjectHealthStatus;
  progress: number;
  nextDeadline: string;
  teamIds: number[];
  startDate: string;
  /** Formatted project created date when known (e.g. "16 Oct 2026") */
  createdAt?: string;
  /** Formatted project end date when known */
  endDate?: string;
  location: string;
  /** Null when the project has no pinned lat/lng yet. */
  distanceKm: number | null;
  projectType: string;
  tasksTotal: number;
  tasksDone: number;
  daysActive: number;
  description: string;
  activity: HubActivityItem[];
}

export interface HistoricalBriefAttachment {
  id: string;
  url: string;
  fileName: string;
}

export interface HistoricalProjectView {
  id: string;
  name: string;
  clientName: string;
  startDate: string;
  completionDate: string;
  year: number;
  type: string;
  description: string;
  photo: string;
  photoAlt: string;
  code: string;
  location: string;
  duration: string;
  clientEmail: string | null;
  clientPhone: string | null;
  briefAttachments: HistoricalBriefAttachment[];
  latitude: number | null;
  longitude: number | null;
}

export interface HistoricalGalleryItem {
  url: string;
  alt: string;
  caption: string;
}

export interface HubClient {
  id: number;
  name: string;
  email: string;
}
