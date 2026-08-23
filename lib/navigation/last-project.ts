import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { DEFAULT_DEMO_PROJECT_ID, isMockProjectId } from "@/lib/projects/mock-projects";
import {
  NAV_ROUTES,
  projectRoute,
  projectTabRoute,
  type ProjectTab,
} from "@/types/navigation";

export const LAST_PROJECT_STORAGE_KEY = "grid:last-project-id";

export type ProjectNavTab = ProjectTab | "overview";

const RESERVED_PROJECT_SEGMENTS = new Set(["new"]);

export function parseProjectIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  if (!match) return null;
  const id = match[1];
  if (RESERVED_PROJECT_SEGMENTS.has(id)) return null;
  return id;
}

export function getLastProjectId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(LAST_PROJECT_STORAGE_KEY);
    return value?.trim() || null;
  } catch {
    return null;
  }
}

export function setLastProjectId(id: string): void {
  if (typeof window === "undefined") return;
  const trimmed = id.trim();
  if (!trimmed || RESERVED_PROJECT_SEGMENTS.has(trimmed)) return;
  try {
    window.localStorage.setItem(LAST_PROJECT_STORAGE_KEY, trimmed);
  } catch {
    // ignore quota / private mode
  }
}

export function resolveLastProjectId(pathname: string): string | null {
  return parseProjectIdFromPathname(pathname) ?? getLastProjectId();
}

/** Last project for nav links — always a demo project when auth bypass is on. */
export function resolveEffectiveLastProjectId(pathname: string): string | null {
  if (isAuthDisabled()) {
    const resolved = resolveLastProjectId(pathname);
    if (resolved && isMockProjectId(resolved)) return resolved;
    return DEFAULT_DEMO_PROJECT_ID;
  }
  const resolved = resolveLastProjectId(pathname);
  if (resolved) return resolved;
  return null;
}

export function resolveProjectNavHref(
  tab: ProjectNavTab,
  lastId: string | null,
): string {
  if (!lastId) return NAV_ROUTES.projects;
  if (tab === "overview") return projectRoute(lastId);
  return projectTabRoute(lastId, tab);
}

export function isProjectNavActive(pathname: string, tab: ProjectNavTab): boolean {
  const projectId = parseProjectIdFromPathname(pathname);
  if (!projectId) return false;

  const base = projectRoute(projectId);
  if (tab === "overview") {
    return pathname === base;
  }

  return pathname === `${base}/${tab}` || pathname.startsWith(`${base}/${tab}/`);
}
