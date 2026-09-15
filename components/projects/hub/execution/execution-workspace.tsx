"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { PhaseLockedContent } from "@/components/projects/hub/shared/workspace-ui";
import { useActiveProjectView } from "@/hooks/use-active-project-view";
import { useProjectMembers } from "@/hooks/use-project-members";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { HubTeamProvider } from "@/lib/projects/hub-team-context";
import { isPhaseEditable } from "@/lib/projects/map-project-hub";
import { canViewBoqFinancials } from "@/lib/projects/permissions";
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
  const authDisabled = isAuthDisabled();
  const { project, teamMembers, isLoading, error } = useActiveProjectView(projectId);
  const { effectiveRole, isViewer } = useProjectMembers();
  const allowBoq = authDisabled || canViewBoqFinancials(effectiveRole, isViewer);
  const [view, setView] = useState<ExecutionView>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (!allowBoq && view === "boq") {
      setView("stages");
      onViewChange?.("stages");
    }
  }, [allowBoq, view, onViewChange]);

  const navigateView = (next: ExecutionView) => {
    if (next === "boq" && !allowBoq) return;
    setView(next);
    onViewChange?.(next);
  };

  const handleBackToProject = () => {
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

  const readOnly = !isPhaseEditable(project.phase, "Execution");

  return (
    <HubTeamProvider members={teamMembers}>
      <div>
        {authDisabled && <DemoCaption className="mb-4 px-4 pt-6 sm:px-10" />}
        <PhaseLockedContent locked={readOnly}>
          {view === "boq" ? (
            <BoqLineTable project={project} onBack={() => navigateView("stages")} />
          ) : view === "site" ? (
            <SiteSubstagesScreen project={project} onBack={() => navigateView("stages")} />
          ) : (
            <StagesScreen
              project={project}
              onBack={handleBackToProject}
              onOpenBoq={allowBoq ? () => navigateView("boq") : undefined}
              onOpenSite={() => navigateView("site")}
            />
          )}
        </PhaseLockedContent>
      </div>
    </HubTeamProvider>
  );
}
