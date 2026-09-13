import type { ProjectsQueryParams } from "@/types/projects";
import type { TaskableType, TasksQueryParams } from "@/types/tasks";

/**
 * Centralised React Query key factory.
 * Using structured keys lets us invalidate whole subtrees:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
 * will bust the list AND every detail entry.
 */
export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (params: ProjectsQueryParams) => ["projects", "list", params] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    members: (id: string) => ["projects", "members", id] as const,
    taskables: (
      projectId: string,
      type?: TaskableType,
      opts?: { limit?: number; depth?: number }
    ) =>
      ["projects", "taskables", projectId, type, opts?.limit ?? null, opts?.depth ?? null] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (params: TasksQueryParams) => ["tasks", "list", params] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
    assignees: (id: string) => ["tasks", "assignees", id] as const,
    batchAssignees: (ids: string[]) => ["tasks", "batchAssignees", ...ids.slice().sort()] as const,
    my: (userId: string) => ["tasks", "my", userId] as const,
  },
  files: {
    all: ["files"] as const,
    tree: (projectId: string) => ["files", "tree", projectId] as const,
    folder: (projectId: string, folderPath: string) =>
      ["files", "folder", projectId, folderPath] as const,
    recentGlobal: (projectIdsKey: string) => ["files", "recentGlobal", projectIdsKey] as const,
  },
  minutes: {
    all: ["minutes"] as const,
    project: (projectId: string) => ["minutes", "project", projectId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: object) => ["users", "list", params] as const,
  },
  holdRequests: {
    all: ["holdRequests"] as const,
    list: (params: object) => ["holdRequests", "list", params] as const,
    project: (projectId: string) => ["holdRequests", "project", projectId] as const,
  },
  accessRequests: {
    all: ["accessRequests"] as const,
    list: (params: object) => ["accessRequests", "list", params] as const,
  },
  clients: {
    all: ["clients"] as const,
    list: (params: object) => ["clients", "list", params] as const,
    detail: (id: string) => ["clients", "detail", id] as const,
    commLog: (id: string) => ["clients", "commLog", id] as const,
    pipeline: () => ["clients", "pipeline"] as const,
    projects: (id: string) => ["clients", "projects", id] as const,
    documents: (id: string) => ["clients", "documents", id] as const,
  },
  suppliers: {
    all: ["suppliers"] as const,
    list: (params: object) => ["suppliers", "list", params] as const,
    detail: (id: string) => ["suppliers", "detail", id] as const,
    linkedProjects: (id: string) => ["suppliers", "linkedProjects", id] as const,
  },
  subVendors: {
    all: ["subVendors"] as const,
    list: (params: object) => ["subVendors", "list", params] as const,
    detail: (id: string) => ["subVendors", "detail", id] as const,
  },
  vendorTasks: {
    all: ["vendorTasks"] as const,
    list: (params: object) => ["vendorTasks", "list", params] as const,
  },
  projectLinks: {
    detail: (projectId: string) => ["projectLinks", projectId] as const,
  },
  boq: {
    all: ["boq"] as const,
    project: (projectId: string) => ["boq", "project", projectId] as const,
    summary: (projectId: string) => ["boq", "summary", projectId] as const,
  },
  consultation: {
    all: ["consultation"] as const,
    project: (projectId: string) => ["consultation", "project", projectId] as const,
  },
  execution: {
    all: ["execution"] as const,
    stages: (projectId: string) => ["execution", "stages", projectId] as const,
    site: (projectId: string) => ["execution", "site", projectId] as const,
    endedAfterBoq: (projectId: string) =>
      ["execution", "endedAfterBoq", projectId] as const,
  },
  detail: {
    all: ["detail"] as const,
    categories: (projectId: string) => ["detail", "categories", projectId] as const,
    directorOverview: () => ["detail", "directorOverview"] as const,
  },
  concept: {
    all: ["concept"] as const,
    project: (projectId: string) => ["concept", "project", projectId] as const,
  },
  audit: {
    all: ["audit"] as const,
    actor: (actorId: string) => ["audit", "actor", actorId] as const,
  },
  portal: {
    all: ["portal"] as const,
    byToken: (token: string) => ["portal", "token", token] as const,
  },
} as const;
