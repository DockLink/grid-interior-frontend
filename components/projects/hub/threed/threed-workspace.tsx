"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { PhaseLockedContent } from "@/components/projects/hub/shared/workspace-ui";
import { useActiveProjectView } from "@/hooks/use-active-project-view";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { HubTeamProvider } from "@/lib/projects/hub-team-context";
import { isPhaseEditable } from "@/lib/projects/map-project-hub";
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
  const authDisabled = isAuthDisabled();
  const { project, teamMembers, isLoading, error } = useActiveProjectView(projectId);

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

  const readOnly = !isPhaseEditable(project.phase, "3D Design");

  return (
    <HubTeamProvider members={teamMembers}>
      <div>
        {authDisabled && <DemoCaption className="mb-4 px-10 pt-6" />}
        <PhaseLockedContent locked={readOnly}>
          {view === "visualizations" && (
            <ThreeDVisualizationsScreen project={project} onBack={handleBack} />
          )}
          {view === "confirmation" && (
            <ThreeDConfirmationScreen
              project={project}
              onBack={() => navigateView("visualizations")}
            />
          )}
        </PhaseLockedContent>
      </div>
    </HubTeamProvider>
  );
}
