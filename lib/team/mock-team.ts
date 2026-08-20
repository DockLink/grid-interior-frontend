export type StudioMemberRole = "Admin" | "Team Lead" | "Member";

export interface StudioMember {
  id: string;
  name: string;
  email: string;
  role: StudioMemberRole;
  initials: string;
  color: string;
  title: string;
  projects: number;
  openTasks: number;
  status: "active" | "away";
}

export const MOCK_TEAM: StudioMember[] = [
  {
    id: "m1",
    name: "Amara Chen",
    email: "amara@gridstudio.com",
    role: "Admin",
    initials: "AC",
    color: "#0B2545",
    title: "Studio Director",
    projects: 8,
    openTasks: 3,
    status: "active",
  },
  {
    id: "m2",
    name: "Luca Bianchi",
    email: "luca@gridstudio.com",
    role: "Team Lead",
    initials: "LB",
    color: "#0FA8A0",
    title: "Project Lead — Residential",
    projects: 4,
    openTasks: 11,
    status: "active",
  },
  {
    id: "m3",
    name: "Priya Shah",
    email: "priya@gridstudio.com",
    role: "Member",
    initials: "PS",
    color: "#2FBE6B",
    title: "Interior Designer",
    projects: 3,
    openTasks: 7,
    status: "active",
  },
  {
    id: "m4",
    name: "Noah Adler",
    email: "noah@gridstudio.com",
    role: "Member",
    initials: "NA",
    color: "#F59E0B",
    title: "FF&E Specialist",
    projects: 5,
    openTasks: 4,
    status: "away",
  },
  {
    id: "m5",
    name: "Elena Rossi",
    email: "elena@gridstudio.com",
    role: "Team Lead",
    initials: "ER",
    color: "#7C6CF0",
    title: "Project Lead — Hospitality",
    projects: 2,
    openTasks: 9,
    status: "active",
  },
  {
    id: "m6",
    name: "Kenji Watanabe",
    email: "kenji@gridstudio.com",
    role: "Member",
    initials: "KW",
    color: "#FF6B6B",
    title: "3D Visualiser",
    projects: 6,
    openTasks: 2,
    status: "active",
  },
];
