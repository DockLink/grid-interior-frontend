"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { DEFAULT_DEMO_PROJECT_ID, getActiveProject } from "@/lib/projects/mock-projects";
import type { LayoutView } from "@/types/layout";

import { LayoutConfirmationScreen } from "./layout-confirmation-screen";
import { LayoutDrawingsScreen } from "./layout-drawings-screen";

export function LayoutWorkspace({
  projectId,
  initialView = "drawings",
  onViewChange,
}: {
  projectId: string;
  initialView?: LayoutView;
  onViewChange?: (view: LayoutView) => void;
}) {
  const router = useRouter();
  const project = getActiveProject(projectId) ?? getActiveProject(DEFAULT_DEMO_PROJECT_ID)!;

  const [view, setView] = useState<LayoutView>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const navigateView = (next: LayoutView) => {
    setView(next);
    onViewChange?.(next);
  };

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div>
      <DemoCaption className="mb-4 px-10 pt-6" />
      {view === "drawings" && (
        <LayoutDrawingsScreen project={project} onBack={handleBack} conceptConfirmed />
      )}
      {view === "confirmation" && (
        <LayoutConfirmationScreen
          project={project}
          onBack={() => navigateView("drawings")}
        />
      )}
    </div>
  );
}
