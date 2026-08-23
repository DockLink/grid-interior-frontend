"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { AreaSetupScreen } from "@/components/projects/hub/concept/area-setup-screen";
import { ConceptListScreen } from "@/components/projects/hub/concept/concept-list-screen";
import { ConceptNonRenderScreen } from "@/components/projects/hub/concept/concept-nonrender-screen";
import { ConceptPresentationScreen } from "@/components/projects/hub/concept/concept-presentation-screen";
import { ConceptRenderScreen } from "@/components/projects/hub/concept/concept-render-screen";
import { ConceptRevisionScreen } from "@/components/projects/hub/concept/concept-revision-screen";
import { WalkthroughModal } from "@/components/projects/hub/shared/walkthrough-modal";
import { CONCEPT_AREAS, CONCEPT_CARDS } from "@/lib/projects/mock-concept";
import { DEFAULT_DEMO_PROJECT_ID, getActiveProject } from "@/lib/projects/mock-projects";
import type { ConceptStage, ConceptView } from "@/types/concept";

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
  const [selectedConcept, setSelectedConcept] = useState(CONCEPT_CARDS[0]?.id ?? 1);
  const [showWalkthrough, setShowWalkthrough] = useState(initialView === "concept-walkthrough");

  useEffect(() => {
    setView(initialView);
    if (initialView === "concept-walkthrough") setShowWalkthrough(true);
  }, [initialView]);

  const navigateView = (next: ConceptView) => {
    setView(next);
    onViewChange?.(next);
  };

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  const concept = CONCEPT_CARDS.find((c) => c.id === selectedConcept) ?? CONCEPT_CARDS[0];
  const area = CONCEPT_AREAS.find((a) => a.id === concept?.areaId) ?? CONCEPT_AREAS[0];
  const walkthroughLabel = concept && area ? `${concept.name} — ${area.name}` : "Concept";

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
          onSelectConcept={(id, stage) => {
            setSelectedConcept(id);
            navigateView(stage === "nonrender" ? "concept-nonrender" : "concept-render");
          }}
          onBack={() => navigateView("area-setup")}
        />
      )}

      {view === "concept-nonrender" && (
        <ConceptNonRenderScreen
          conceptId={selectedConcept}
          onBack={() => navigateView("concept-list")}
          onSwitchToRender={() => navigateView("concept-render")}
        />
      )}

      {(view === "concept-render" || view === "concept-walkthrough") && (
        <ConceptRenderScreen
          conceptId={selectedConcept}
          onBack={() => navigateView("concept-list")}
          onSwitchToNonRender={() => navigateView("concept-nonrender")}
          onOpenWalkthrough={() => setShowWalkthrough(true)}
        />
      )}

      {view === "concept-presentation" && (
        <ConceptPresentationScreen onBack={handleBack} />
      )}

      {view === "concept-revision" && (
        <ConceptRevisionScreen onBack={handleBack} />
      )}

      {showWalkthrough && (
        <WalkthroughModal
          projectName={walkthroughLabel}
          variant="concept"
          onClose={() => {
            setShowWalkthrough(false);
            if (view === "concept-walkthrough") navigateView("concept-render");
          }}
        />
      )}
    </div>
  );
}
