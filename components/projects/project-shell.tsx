"use client";

import { usePathname } from "next/navigation";

import { ProjectDetailHeader } from "@/components/projects/hub/project-detail-header";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { DEFAULT_DEMO_PROJECT_ID, isMockProjectId } from "@/lib/projects/mock-projects";

export function ProjectShell({
  projectId,
  children,
}: {
  projectId: string;
  projectName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const headerProjectId = isMockProjectId(projectId)
    ? projectId
    : isAuthDisabled()
      ? DEFAULT_DEMO_PROJECT_ID
      : null;
  const isMock = Boolean(headerProjectId);
  const isWorkspaceRoute = /\/(consultation|concept|layout|threed|detail|timeline)$/.test(pathname);

  if (isMock && isWorkspaceRoute) {
    return (
      <div className="project-page -mt-[var(--ds-content-padding-y)] w-full min-w-0">
        <div className="project-shell-content">{children}</div>
      </div>
    );
  }

  if (isMock) {
    return (
      <div className="project-page -mt-[var(--ds-content-padding-y)] w-full min-w-0">
        <ProjectDetailHeader projectId={headerProjectId!} />
        <div className="project-shell-content">{children}</div>
      </div>
    );
  }

  return (
    <div className="project-page -mt-[var(--ds-content-padding-y)] w-full min-w-0">
      <div className="project-shell-content">{children}</div>
    </div>
  );
}
