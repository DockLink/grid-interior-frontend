"use client";

import Link from "next/link";
import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { ProjectSubNav } from "@/components/projects/hub/project-sub-nav";
import { StatusBadge } from "@/components/projects/hub/status-badge";
import { getActiveProject } from "@/lib/projects/mock-projects";
import { clientRoute, NAV_ROUTES } from "@/types/navigation";

export function ProjectDetailHeader({ projectId }: { projectId: string }) {
  const project = getActiveProject(projectId);
  const [editHover, setEditHover] = useState(false);

  if (!project) return null;

  return (
    <div className="bg-white px-10 pt-7">
      <Link
        href={NAV_ROUTES.projects}
        className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--figma-gray500)] no-underline transition-colors hover:text-[var(--figma-teal)]"
      >
        <MaterialIcon name="arrow_back" outlined size={18} />
        Projects
      </Link>

      <div className="mb-2.5 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-[26px] font-bold text-[var(--figma-navy)]">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={clientRoute(project.clientId)}
              className="flex cursor-pointer items-center gap-1.5 no-underline font-[inherit]"
            >
              <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--figma-navy)] to-[var(--figma-teal)] text-[9px] font-bold text-white">
                {project.clientName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <span className="text-[13px] font-medium text-[var(--figma-teal)] hover:underline">
                {project.clientName}
              </span>
            </Link>
            <span className="text-[var(--figma-border)]">·</span>
            <span className="text-xs text-[var(--figma-gray500)]">{project.projectType}</span>
            <span className="text-[var(--figma-border)]">·</span>
            <span className="text-xs text-[var(--figma-gray500)]">Since {project.startDate}</span>
          </div>
        </div>
        <button
          type="button"
          onMouseEnter={() => setEditHover(true)}
          onMouseLeave={() => setEditHover(false)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-none transition-all duration-150"
          style={{
            background: editHover ? "var(--figma-gray100)" : "#fff",
            boxShadow: "var(--neu-raised)",
          }}
        >
          <MaterialIcon name="edit" outlined size={18} className="text-[var(--figma-gray500)]" />
        </button>
      </div>

      <ProjectSubNav projectId={projectId} />
      <div className="mt-2.5 h-px bg-[var(--figma-border)]" />
    </div>
  );
}
