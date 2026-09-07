"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { useActiveProjectView } from "@/hooks/use-active-project-view";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { HubTeamProvider } from "@/lib/projects/hub-team-context";
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
  const authDisabled = isAuthDisabled();
  const { project, teamMembers, isLoading, error } = useActiveProjectView(projectId);

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

  const wrap = (content: React.ReactNode) => (
    <HubTeamProvider members={teamMembers}>
      <div>
        {authDisabled && <DemoCaption className="mb-4 px-10 pt-6" />}
        {content}
      </div>
    </HubTeamProvider>
  );

  if (view === "director-overview") {
    return wrap(
      <DirectorOverviewScreen project={project} onBack={() => navigateView("hub")} />,
    );
  }

  if (view === "boq") {
    return wrap(<BoqScreen project={project} onBack={() => navigateView("hub")} />);
  }

  return wrap(
    <DrawingsHubScreen
      project={project}
      onBack={handleBack}
      onDirectorOverview={() => navigateView("director-overview")}
      onBoq={() => navigateView("boq")}
    />,
  );
}
