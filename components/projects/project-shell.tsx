"use client";

import { usePathname } from "next/navigation";

import { ProjectDetailHeader } from "@/components/projects/hub/project-detail-header";

export function ProjectShell({
  projectId,
  children,
}: {
  projectId: string;
  projectName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWorkspaceRoute = /\/(consultation|concept|layout|threed|detail|timeline)$/.test(pathname);

  if (isWorkspaceRoute) {
    return (
      <div className="project-page -mt-[var(--ds-content-padding-y)] w-full min-w-0">
        <div className="project-shell-content">{children}</div>
      </div>
    );
  }

  return (
    <div className="project-page -mt-[var(--ds-content-padding-y)] w-full min-w-0">
      <ProjectDetailHeader projectId={projectId} />
      <div className="project-shell-content">{children}</div>
    </div>
  );
}
