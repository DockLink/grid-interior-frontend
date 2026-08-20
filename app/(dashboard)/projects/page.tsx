import { Suspense } from "react";

import { ProjectsListPage } from "@/components/projects/hub/projects-list-page";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="px-10 py-8 text-[var(--figma-gray500)]">Loading projects…</div>}>
      <ProjectsListPage />
    </Suspense>
  );
}
