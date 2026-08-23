import type { ConsultView } from "@/types/consultation";
import type { ConceptView } from "@/types/concept";
import type { DetailView } from "@/types/detail";
import type { ExecutionView } from "@/types/execution";
import type { LayoutView } from "@/types/layout";
import type { ThreeDView } from "@/types/threed";

export const NAV_ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  sessionExpired: "/session-expired",
  adminDashboard: "/dashboard/admin",
  superAdminDashboard: "/dashboard/super-admin",
  leadDashboard: "/dashboard/lead",
  memberDashboard: "/dashboard/member",
  guestDashboard: "/dashboard/guest",
  projects: "/projects",
  createProject: "/projects/new",
  myTasks: "/my-tasks",
  notifications: "/notifications",
  userManagement: "/user-management",
  guestUsers: "/guest-users",
  accessRequests: "/access-requests",
  holdRequests: "/hold-requests",
  settings: "/settings",
  clients: "/clients",
  leadPipeline: "/lead-pipeline",
  suppliers: "/suppliers",
  team: "/team",
  files: "/files",
} as const;

export function clientRoute(clientId: string | number) {
  return `${NAV_ROUTES.clients}/${clientId}`;
}

export function clientCommLogRoute(clientId: string | number) {
  return `${clientRoute(clientId)}/comm-log`;
}

export function supplierRoute(supplierId: string | number) {
  return `${NAV_ROUTES.suppliers}/${supplierId}`;
}

export function subVendorRoute(vendorId: string | number) {
  return `${NAV_ROUTES.suppliers}/sub-vendors/${vendorId}`;
}

export function projectRoute(projectId: string) {
  return `${NAV_ROUTES.projects}/${projectId}`;
}

export function projectTabRoute(projectId: string, tab: ProjectTab) {
  if (tab === "overview") return projectRoute(projectId);
  return `${projectRoute(projectId)}/${tab}`;
}

export type { ConsultView };

export function projectConsultationRoute(projectId: string, view?: ConsultView) {
  const base = `${projectRoute(projectId)}/consultation`;
  return view && view !== "toggle" ? `${base}?view=${view}` : base;
}

export type { ConceptView };

export function projectConceptRoute(projectId: string, view?: ConceptView) {
  const base = `${projectRoute(projectId)}/concept`;
  return view && view !== "area-setup" ? `${base}?view=${view}` : base;
}

export type { LayoutView };

export function projectLayoutRoute(projectId: string, view?: LayoutView) {
  const base = `${projectRoute(projectId)}/layout`;
  return view && view !== "drawings" ? `${base}?view=${view}` : base;
}

export type { ThreeDView };

export function projectThreeDRoute(projectId: string, view?: ThreeDView) {
  const base = `${projectRoute(projectId)}/threed`;
  return view && view !== "visualizations" ? `${base}?view=${view}` : base;
}

export type { DetailView };

export function projectDetailRoute(projectId: string, view?: DetailView) {
  const base = `${projectRoute(projectId)}/detail`;
  return view && view !== "hub" ? `${base}?view=${view}` : base;
}

export type { ExecutionView };

export function projectExecutionRoute(projectId: string, view?: ExecutionView) {
  const base = `${projectRoute(projectId)}/execution`;
  return view && view !== "stages" ? `${base}?view=${view}` : base;
}

export type ProjectTab =
  | "overview"
  | "files"
  | "tasks"
  | "minutes"
  | "timeline"
  | "hold-requests";

export const PROJECT_TABS: { key: ProjectTab; label: string; adminOnly?: boolean }[] = [
  { key: "overview", label: "Overview" },
  { key: "files", label: "Documents" },
  { key: "tasks", label: "Tasks" },
  { key: "minutes", label: "Minutes" },
  { key: "timeline", label: "Timeline" },
  { key: "hold-requests", label: "Hold Requests", adminOnly: true },
];

export type NavRoute = (typeof NAV_ROUTES)[keyof typeof NAV_ROUTES];

/** Super Admin only */
export const SUPER_ADMIN_ONLY_ROUTES = [
  NAV_ROUTES.superAdminDashboard,
] as const;

/** Admin + Super Admin only */
export const ADMIN_ONLY_ROUTES = [
  NAV_ROUTES.userManagement,
  NAV_ROUTES.guestUsers,
  NAV_ROUTES.clients,
  NAV_ROUTES.leadPipeline,
  NAV_ROUTES.suppliers,
  NAV_ROUTES.team,
  NAV_ROUTES.files,
  NAV_ROUTES.createProject,
] as const;

/** Routes blocked for guest org role */
export const GUEST_BLOCKED_ROUTES = [
  NAV_ROUTES.userManagement,
  NAV_ROUTES.guestUsers,
  NAV_ROUTES.accessRequests,
  NAV_ROUTES.holdRequests,
  NAV_ROUTES.myTasks,
  NAV_ROUTES.notifications,
  NAV_ROUTES.superAdminDashboard,
  NAV_ROUTES.adminDashboard,
  NAV_ROUTES.leadDashboard,
  NAV_ROUTES.memberDashboard,
  NAV_ROUTES.clients,
  NAV_ROUTES.leadPipeline,
  NAV_ROUTES.suppliers,
  NAV_ROUTES.team,
  NAV_ROUTES.files,
  NAV_ROUTES.createProject,
] as const;

/** Admin + Super Admin + Team Lead */
export const LEAD_ADMIN_ROUTES = [
  NAV_ROUTES.accessRequests,
  NAV_ROUTES.holdRequests,
] as const;
