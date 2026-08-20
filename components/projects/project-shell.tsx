"use client";

import { usePathname } from "next/navigation";

import { ProjectDetailHeader } from "@/components/projects/hub/project-detail-header";
import { isMockProjectId } from "@/lib/projects/mock-projects";

export function ProjectShell({
  projectId,
  children,
}: {
  projectId: string;
  projectName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMock = isMockProjectId(projectId);
  const isWorkspaceRoute = /\/(consultation|concept|layout|threed|detail)$/.test(pathname);

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
        <ProjectDetailHeader projectId={projectId} />
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
