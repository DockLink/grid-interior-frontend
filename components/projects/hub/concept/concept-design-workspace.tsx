"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { AreaSetupScreen } from "@/components/projects/hub/concept/area-setup-screen";
import { ConceptListScreen } from "@/components/projects/hub/concept/concept-list-screen";
import { CONCEPT_AREAS } from "@/lib/projects/mock-concept";
import { DEFAULT_DEMO_PROJECT_ID, getActiveProject } from "@/lib/projects/mock-projects";
import type { ConceptView } from "@/types/concept";

export function ConceptDesignWorkspace({
  projectId,
  initialView = "area-setup",
  onViewChange,
}: {
  projectId: string;
  initialView?: ConceptView;
  onViewChange?: (view: ConceptView) => void;
}) {
  const router = useRouter();
  const project = getActiveProject(projectId) ?? getActiveProject(DEFAULT_DEMO_PROJECT_ID)!;

  const [view, setView] = useState<ConceptView>(initialView);
  const [selectedArea, setSelectedArea] = useState(CONCEPT_AREAS[0]?.id ?? 1);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const navigateView = (next: ConceptView) => {
    setView(next);
    onViewChange?.(next);
  };

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="relative">
      <DemoCaption className="mb-4 px-10 pt-6" />

      {view === "area-setup" && (
        <AreaSetupScreen
          project={project}
          onSelectArea={(id) => {
            setSelectedArea(id);
            navigateView("concept-list");
          }}
          onBack={handleBack}
        />
      )}

      {view === "concept-list" && (
        <ConceptListScreen
          areaId={selectedArea}
          onBack={() => navigateView("area-setup")}
        />
      )}
    </div>
  );
}
