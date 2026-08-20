"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { DEFAULT_DEMO_PROJECT_ID, getActiveProject } from "@/lib/projects/mock-projects";
import type { DetailView } from "@/types/detail";

import { BoqScreen } from "./boq-screen";
import { DirectorOverviewScreen } from "./director-overview-screen";
import { DrawingsHubScreen } from "./drawings-hub-screen";

export function DetailDrawingsWorkspace({
  projectId,
  initialView = "hub",
  onViewChange,
}: {
  projectId: string;
  initialView?: DetailView;
  onViewChange?: (view: DetailView) => void;
}) {
  const router = useRouter();
  const project = getActiveProject(projectId) ?? getActiveProject(DEFAULT_DEMO_PROJECT_ID)!;

  const [view, setView] = useState<DetailView>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const navigateView = (next: DetailView) => {
    setView(next);
    onViewChange?.(next);
  };

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  if (view === "director-overview") {
    return (
      <div>
        <DemoCaption className="mb-4 px-10 pt-6" />
        <DirectorOverviewScreen project={project} onBack={() => navigateView("hub")} />
      </div>
    );
  }

  if (view === "boq") {
    return (
      <div>
        <DemoCaption className="mb-4 px-10 pt-6" />
        <BoqScreen project={project} onBack={() => navigateView("hub")} />
      </div>
    );
  }

  return (
    <div>
      <DemoCaption className="mb-4 px-10 pt-6" />
      <DrawingsHubScreen
        project={project}
        onBack={handleBack}
        onDirectorOverview={() => navigateView("director-overview")}
        onBoq={() => navigateView("boq")}
      />
    </div>
  );
}
