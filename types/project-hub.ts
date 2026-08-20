import type { ProjectHealthStatus, ProjectPhase } from "@/lib/projects/design-tokens";

export interface HubTeamMember {
  id: number;
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
  location: string;
  distanceKm: number;
  projectType: string;
  tasksTotal: number;
  tasksDone: number;
  daysActive: number;
  description: string;
  activity: HubActivityItem[];
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
