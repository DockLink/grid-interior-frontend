"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { DEFAULT_DEMO_PROJECT_ID, getActiveProject } from "@/lib/projects/mock-projects";
import type { ExecutionView } from "@/types/execution";

import { BoqLineTable } from "./boq-line-table";
import { SiteSubstagesScreen } from "./site-substages-screen";
import { StagesScreen } from "./stages-screen";

export function ExecutionWorkspace({
  projectId,
  initialView = "stages",
  onViewChange,
}: {
  projectId: string;
  initialView?: ExecutionView;
  onViewChange?: (view: ExecutionView) => void;
}) {
  const router = useRouter();
  const project = getActiveProject(projectId) ?? getActiveProject(DEFAULT_DEMO_PROJECT_ID)!;
  const [view, setView] = useState<ExecutionView>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const navigateView = (next: ExecutionView) => {
    setView(next);
    onViewChange?.(next);
  };

  const handleBackToProject = () => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div>
      <DemoCaption className="mb-4 px-4 pt-6 sm:px-10" />
      {view === "boq" ? (
        <BoqLineTable project={project} onBack={() => navigateView("stages")} />
      ) : view === "site" ? (
        <SiteSubstagesScreen project={project} onBack={() => navigateView("stages")} />
      ) : (
        <StagesScreen
          project={project}
          onBack={handleBackToProject}
          onOpenBoq={() => navigateView("boq")}
          onOpenSite={() => navigateView("site")}
        />
      )}
    </div>
  );
}
