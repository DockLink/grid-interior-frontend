"use client";

import { useProjectContext } from "@/components/projects/project-context";
import { ProjectGalleryBoard } from "@/components/projects/hub/project-gallery-board";

export function ProjectGalleryTab() {
  const { project } = useProjectContext();
  if (!project) return null;
  return <ProjectGalleryBoard projectId={project.id} projectName={project.name} />;
}
