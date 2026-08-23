// Mock task data for Phase 4 Tasks Workspace
// Ported from Design System for GRID CRM/src/screens/tasks/TasksWorkspace.tsx

export type MockPriority = "high" | "medium" | "low";
export type MockTaskStatus = "todo" | "in-progress" | "review" | "done";

export interface MockComment {
  id: number;
  author: string;
  initials: string;
  color: string;
  time: string;
  text: string;
}

export interface MockTask {
  id: number;
  title: string;
  project: string;
  projectColor: string;
  priority: MockPriority;
  dueDate: string;
  overdue: boolean;
  status: MockTaskStatus;
  assignee: { initials: string; color: string; name: string };
  description: string;
  comments: MockComment[];
}

export const MOCK_TASKS: MockTask[] = [
  {
    id: 1,
    title: "Finalise lobby ceiling plan dimensions",
    project: "Marchetti Villa",
    projectColor: "#0E7C86",
    priority: "high",
    dueDate: "28 Jul 2026",
    overdue: true,
    status: "in-progress",
    assignee: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
    description:
      "Review structural engineer drawings and confirm final ceiling height for the lobby area. Cross-check with MEP consultant.",
    comments: [
      {
        id: 1,
        author: "Ashan Perera",
        initials: "AP",
        color: "#0891B2",
        time: "2h ago",
        text: "Checked with MEP — clearance is fine at 3.2m.",
      },
      {
        id: 2,
        author: "Priya Nair",
        initials: "PN",
        color: "#7C3AED",
        time: "1h ago",
        text: "Updated drawing sent to structural. Awaiting sign-off.",
      },
    ],
  },
  {
    id: 2,
    title: "Prepare client presentation deck",
    project: "Marchetti Villa",
    projectColor: "#0E7C86",
    priority: "high",
    dueDate: "30 Jul 2026",
    overdue: false,
    status: "todo",
    assignee: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
    description:
      "Compile all approved renders, layout drawings, and BOQ summary into the final client presentation PDF.",
    comments: [],
  },
  {
    id: 3,
    title: "Review FF&E schedule v1",
    project: "Bianchi Office",
    projectColor: "#0891B2",
    priority: "medium",
    dueDate: "01 Aug 2026",
    overdue: false,
    status: "review",
    assignee: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
    description:
      "Cross-check FF&E quantities against BOQ. Flag any discrepancies.",
    comments: [
      {
        id: 3,
        author: "Dilani Silva",
        initials: "DS",
        color: "#D97706",
        time: "3h ago",
        text: "Item 14 (reception chair) quantity mismatch — needs correction.",
      },
    ],
  },
  {
    id: 4,
    title: "Update site measurement records",
    project: "Romano Penthouse",
    projectColor: "#8B5CF6",
    priority: "low",
    dueDate: "05 Aug 2026",
    overdue: false,
    status: "todo",
    assignee: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
    description: "Enter revised measurements from site visit on 27 Jul.",
    comments: [],
  },
  {
    id: 5,
    title: "Submit electrical drawings to consultant",
    project: "Marchetti Villa",
    projectColor: "#0E7C86",
    priority: "high",
    dueDate: "25 Jul 2026",
    overdue: true,
    status: "todo",
    assignee: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
    description:
      "Package all electrical layout PDFs and DWG files for MEP review.",
    comments: [],
  },
  {
    id: 6,
    title: "Photo documentation — site visit",
    project: "De Luca Townhouse",
    projectColor: "#059669",
    priority: "medium",
    dueDate: "03 Aug 2026",
    overdue: false,
    status: "done",
    assignee: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
    description:
      "Upload all before photos from the 24 Jul site visit to the Photo Gallery.",
    comments: [],
  },
  {
    id: 7,
    title: "Director review — detail drawings",
    project: "Visconti Showroom",
    projectColor: "#EC4899",
    priority: "high",
    dueDate: "29 Jul 2026",
    overdue: true,
    status: "review",
    assignee: { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
    description:
      "Director must review and sign off on all 6 drawing categories before execution commences.",
    comments: [],
  },
];

export const PRIORITY_CFG: Record<
  MockPriority,
  { label: string; color: string; bg: string; dot: string }
> = {
  high: { label: "High", color: "#F26D6D", bg: "#FEE2E2", dot: "#F26D6D" },
  medium: { label: "Medium", color: "#1B2A4A", bg: "#F3F4F6", dot: "#1B2A4A" },
  low: { label: "Low", color: "#6B7280", bg: "#F9FAFB", dot: "#9CA3AF" },
};

export const STATUS_CFG: Record<
  MockTaskStatus,
  { label: string; color: string; bg: string }
> = {
  todo: { label: "To Do", color: "#6B7280", bg: "#F3F4F6" },
  "in-progress": { label: "In Progress", color: "#D97706", bg: "#FEF3C7" },
  review: {
    label: "Under Review",
    color: "#0E7C86",
    bg: "rgba(14,124,134,0.10)",
  },
  done: { label: "Completed", color: "#3FA66B", bg: "#DCFCE7" },
};

export const STATUS_ORDER: MockTaskStatus[] = [
  "todo",
  "in-progress",
  "review",
  "done",
];
