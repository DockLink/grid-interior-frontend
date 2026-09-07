"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { useActiveProjectView } from "@/hooks/use-active-project-view";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { HubTeamProvider } from "@/lib/projects/hub-team-context";
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
  const authDisabled = isAuthDisabled();
  const { project, teamMembers, isLoading, error } = useActiveProjectView(projectId);

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

  return (
    <HubTeamProvider members={teamMembers}>
      <div>
        {authDisabled && <DemoCaption className="mb-4 px-10 pt-6" />}
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
    </HubTeamProvider>
  );
}
