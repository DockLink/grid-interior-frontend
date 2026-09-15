"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { AreaSetupScreen } from "@/components/projects/hub/concept/area-setup-screen";
import { ConceptListScreen } from "@/components/projects/hub/concept/concept-list-screen";
import { PhaseLockedContent } from "@/components/projects/hub/shared/workspace-ui";
import { useActiveProjectView } from "@/hooks/use-active-project-view";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { HubTeamProvider } from "@/lib/projects/hub-team-context";
import { isPhaseEditable } from "@/lib/projects/map-project-hub";
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
  const authDisabled = isAuthDisabled();
  const { project, teamMembers, isLoading, error } = useActiveProjectView(projectId);

  const [view, setView] = useState<ConceptView>(initialView);
  const [selectedArea, setSelectedArea] = useState<string>("");

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

  if (!authDisabled && isLoading) {
    return (
      <div className="px-10 py-6 text-sm text-[var(--figma-gray500)]">Loading project…</div>
    );
  }

  if (!authDisabled && (error || !project)) {
    return (
      <div className="px-10 py-6 text-sm text-[var(--figma-alert)]">
        {error ?? "Project not found"}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-10 py-6 text-sm text-[var(--figma-gray500)]">Loading project…</div>
    );
  }

  const readOnly = !isPhaseEditable(project.phase, "Concept Design");

  return (
    <HubTeamProvider members={teamMembers}>
      <div className="relative">
        {authDisabled && <DemoCaption className="mb-4 px-10 pt-6" />}
        <PhaseLockedContent locked={readOnly}>
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

          {view === "concept-list" && selectedArea && (
            <ConceptListScreen
              projectId={projectId}
              areaId={selectedArea}
              onBack={() => navigateView("area-setup")}
            />
          )}
        </PhaseLockedContent>
      </div>
    </HubTeamProvider>
  );
}
