// TODO: wire API — replace these fixtures with useProjects / useAccessRequests / useTasks

export type AttentionItem = {
  id: number;
  type: "access" | "hold" | "task";
  requester: string;
  initials: string;
  color: string;
  project: string;
  date: string;
  detail?: string;
};

export type FileActivityItem = {
  id: number;
  name: string;
  ext: string;
  project: string;
  uploader: string;
  time: string;
};

export type ProjectOverviewItem = {
  id: number;
  code: string;
  name: string;
  client: string;
  status: "active" | "at-risk" | "overdue" | "inactive" | "completed";
  progress: number;
};

export type StatItem = {
  label: string;
  value: string;
  delta?: string;
  accent: string;
  bg: string;
  icon: "folder" | "user-plus" | "pause" | "check" | "list" | "flag" | "users" | "calendar";
};

export const ADMIN_STATS: StatItem[] = [
  {
    label: "Active Projects",
    value: "12",
    delta: "+2",
    icon: "folder",
    accent: "#0B2545",
    bg: "rgba(11,37,69,0.08)",
  },
  {
    label: "Pending Access Requests",
    value: "2",
    icon: "user-plus",
    accent: "#0FA8A0",
    bg: "rgba(15,168,160,0.1)",
  },
  {
    label: "Pending Hold Requests",
    value: "4",
    icon: "pause",
    accent: "#FF6B6B",
    bg: "#FDECEC",
  },
  {
    label: "Tasks Completed This Week",
    value: "23",
    delta: "+8",
    icon: "check",
    accent: "#2FBE6B",
    bg: "#E7F9EE",
  },
];

export const SUPER_ADMIN_STATS: StatItem[] = [
  {
    label: "Active Projects",
    value: "12",
    delta: "+2",
    icon: "folder",
    accent: "#0B2545",
    bg: "rgba(11,37,69,0.08)",
  },
  {
    label: "Total Users",
    value: "48",
    delta: "+3",
    icon: "users",
    accent: "#0FA8A0",
    bg: "rgba(15,168,160,0.1)",
  },
  {
    label: "Pending Access Requests",
    value: "2",
    icon: "user-plus",
    accent: "#FF6B6B",
    bg: "#FDECEC",
  },
  {
    label: "Tasks Completed This Week",
    value: "23",
    delta: "+8",
    icon: "check",
    accent: "#2FBE6B",
    bg: "#E7F9EE",
  },
];

export const LEAD_STATS: StatItem[] = [
  {
    label: "Led Projects",
    value: "5",
    delta: "+1",
    icon: "folder",
    accent: "#0B2545",
    bg: "rgba(11,37,69,0.08)",
  },
  {
    label: "Open Tasks",
    value: "18",
    delta: "-3",
    icon: "list",
    accent: "#0FA8A0",
    bg: "rgba(15,168,160,0.1)",
  },
  {
    label: "Overdue Items",
    value: "2",
    icon: "flag",
    accent: "#FF6B6B",
    bg: "#FDECEC",
  },
  {
    label: "Team Members",
    value: "9",
    icon: "users",
    accent: "#2FBE6B",
    bg: "#E7F9EE",
  },
];

export const MEMBER_STATS: StatItem[] = [
  {
    label: "My Open Tasks",
    value: "7",
    delta: "-2",
    icon: "list",
    accent: "#0B2545",
    bg: "rgba(11,37,69,0.08)",
  },
  {
    label: "Assigned Projects",
    value: "3",
    icon: "folder",
    accent: "#0FA8A0",
    bg: "rgba(15,168,160,0.1)",
  },
  {
    label: "Due This Week",
    value: "4",
    icon: "calendar",
    accent: "#D97706",
    bg: "#FEF3C7",
  },
  {
    label: "Completed This Week",
    value: "6",
    delta: "+2",
    icon: "check",
    accent: "#2FBE6B",
    bg: "#E7F9EE",
  },
];

export const ATTENTION_DATA: AttentionItem[] = [
  {
    id: 1,
    type: "access",
    requester: "Lena Fischer",
    initials: "LF",
    color: "#5B6B85",
    project: "Lumière Penthouse",
    date: "Jul 28",
  },
  {
    id: 2,
    type: "hold",
    requester: "Carlos Mendez",
    initials: "CM",
    color: "#0B2545",
    project: "Noir Boutique Hotel",
    date: "Jul 29",
  },
  {
    id: 3,
    type: "access",
    requester: "Yuki Tanaka",
    initials: "YT",
    color: "#0FA8A0",
    project: "Verdant Residence",
    date: "Jul 30",
  },
  {
    id: 4,
    type: "hold",
    requester: "Priya Kapoor",
    initials: "PK",
    color: "#FF6B6B",
    project: "Atrium Office HQ",
    date: "Jul 30",
  },
];

export const LEAD_ATTENTION_DATA: AttentionItem[] = [
  {
    id: 1,
    type: "task",
    requester: "Material board",
    initials: "MB",
    color: "#0FA8A0",
    project: "Lumière Penthouse",
    date: "Today",
    detail: "Review due",
  },
  {
    id: 2,
    type: "hold",
    requester: "Site survey delay",
    initials: "SS",
    color: "#FF6B6B",
    project: "Noir Boutique Hotel",
    date: "Yesterday",
    detail: "Hold pending",
  },
  {
    id: 3,
    type: "task",
    requester: "Client feedback",
    initials: "CF",
    color: "#0B2545",
    project: "Verdant Residence",
    date: "Jul 29",
    detail: "Needs reply",
  },
];

export const MEMBER_ATTENTION_DATA: AttentionItem[] = [
  {
    id: 1,
    type: "task",
    requester: "Update floor plan",
    initials: "FP",
    color: "#0FA8A0",
    project: "Lumière Penthouse",
    date: "Today",
    detail: "Due 5pm",
  },
  {
    id: 2,
    type: "task",
    requester: "Mood board v2",
    initials: "MB",
    color: "#0B2545",
    project: "Verdant Residence",
    date: "Tomorrow",
    detail: "In progress",
  },
  {
    id: 3,
    type: "task",
    requester: "Spec sheet review",
    initials: "SP",
    color: "#D97706",
    project: "Cascade Spa",
    date: "Jul 31",
    detail: "Assigned to you",
  },
];

export const FILE_ACTIVITY_DATA: FileActivityItem[] = [
  {
    id: 1,
    name: "Floor_Plan_Rev3.pdf",
    ext: "pdf",
    project: "Lumière Penthouse",
    uploader: "MR",
    time: "2h ago",
  },
  {
    id: 2,
    name: "Material_Spec_v2.xlsx",
    ext: "xlsx",
    project: "Noir Boutique Hotel",
    uploader: "SK",
    time: "5h ago",
  },
  {
    id: 3,
    name: "Render_Exterior.png",
    ext: "png",
    project: "Verdant Residence",
    uploader: "JW",
    time: "Yesterday",
  },
  {
    id: 4,
    name: "Contract_Signed.pdf",
    ext: "pdf",
    project: "Cascade Spa",
    uploader: "AL",
    time: "2d ago",
  },
  {
    id: 5,
    name: "Site_Survey_Final.dwg",
    ext: "dwg",
    project: "Atrium HQ",
    uploader: "PK",
    time: "3d ago",
  },
];

export const PROJECTS_OVERVIEW_DATA: ProjectOverviewItem[] = [
  {
    id: 1,
    code: "GI-024",
    name: "Lumière Penthouse",
    client: "Dumont Family",
    status: "active",
    progress: 62,
  },
  {
    id: 2,
    code: "GI-023",
    name: "Noir Boutique Hotel",
    client: "Meridian Group",
    status: "at-risk",
    progress: 81,
  },
  {
    id: 3,
    code: "GI-022",
    name: "Verdant Residence",
    client: "Chen & Partners",
    status: "overdue",
    progress: 34,
  },
  {
    id: 4,
    code: "GI-021",
    name: "Atrium Office HQ",
    client: "Nexum Corp",
    status: "inactive",
    progress: 8,
  },
  {
    id: 5,
    code: "GI-020",
    name: "Cascade Spa & Wellness",
    client: "Zenith Hospitality",
    status: "completed",
    progress: 100,
  },
];

export const PROJ_STATUS_CONFIG = {
  active: { label: "Active", bg: "#E6F7F7", color: "#0FA8A0", bar: "#0FA8A0" },
  "at-risk": { label: "At Risk", bg: "#FEF3C7", color: "#D97706", bar: "#F59E0B" },
  overdue: { label: "Overdue", bg: "#FDECEC", color: "#FF6B6B", bar: "#FF6B6B" },
  inactive: { label: "Inactive", bg: "#EEF1F6", color: "#5B6B85", bar: "#A0AEBB" },
  completed: { label: "Completed", bg: "#E7F9EE", color: "#2FBE6B", bar: "#2FBE6B" },
} as const;

export function fileExtColor(ext: string) {
  if (ext === "pdf") return "#FF6B6B";
  if (["png", "jpg", "jpeg"].includes(ext)) return "#0FA8A0";
  if (["xlsx", "csv"].includes(ext)) return "#2FBE6B";
  return "#5B6B85";
}
