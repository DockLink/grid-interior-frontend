"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { DEFAULT_DEMO_PROJECT_ID, getActiveProject } from "@/lib/projects/mock-projects";
import type { ThreeDView } from "@/types/threed";

import { ThreeDConfirmationScreen } from "./threed-confirmation-screen";
import { ThreeDVisualizationsScreen } from "./threed-visualizations-screen";

export function ThreeDWorkspace({
  projectId,
  initialView = "visualizations",
  onViewChange,
}: {
  projectId: string;
  initialView?: ThreeDView;
  onViewChange?: (view: ThreeDView) => void;
}) {
  const router = useRouter();
  const project = getActiveProject(projectId) ?? getActiveProject(DEFAULT_DEMO_PROJECT_ID)!;

  const [view, setView] = useState<ThreeDView>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const navigateView = (next: ThreeDView) => {
    setView(next);
    onViewChange?.(next);
  };

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div>
      <DemoCaption className="mb-4 px-10 pt-6" />
      {view === "visualizations" && (
        <ThreeDVisualizationsScreen project={project} onBack={handleBack} />
      )}
      {view === "confirmation" && (
        <ThreeDConfirmationScreen
          project={project}
          onBack={() => navigateView("visualizations")}
        />
      )}
    </div>
  );
}
