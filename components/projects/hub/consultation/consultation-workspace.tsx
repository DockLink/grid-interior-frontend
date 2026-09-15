"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { PhaseLockedContent } from "@/components/projects/hub/shared/workspace-ui";
import { useActiveProjectView } from "@/hooks/use-active-project-view";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { HubTeamProvider } from "@/lib/projects/hub-team-context";
import { isPhaseEditable } from "@/lib/projects/map-project-hub";
import type { ConsultType, ConsultView, ModeType } from "@/types/consultation";
import { paidTabFromView } from "@/types/consultation";

import { FreeConsultationRecord } from "./free-consultation-record";
import { PaidConsultationRecord } from "./paid-consultation-record";
import { TypeToggleScreen } from "./type-toggle-screen";

export function ConsultationWorkspace({
  projectId,
  initialView = "toggle",
  onViewChange,
}: {
  projectId: string;
  initialView?: ConsultView;
  onViewChange?: (view: ConsultView) => void;
}) {
  const router = useRouter();
  const authDisabled = isAuthDisabled();
  const { project, teamMembers, isLoading, error } = useActiveProjectView(projectId);

  const [view, setView] = useState<ConsultView>(initialView);
  const [mode, setMode] = useState<ModeType>("online");
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const navigateView = (next: ConsultView) => {
    setView(next);
    onViewChange?.(next);
  };

  const handleBack = () => {
    router.push(`/projects/${projectId}`);
  };

  const handleContinue = (type: ConsultType, m: ModeType) => {
    if (!type) return;
    setMode(m);
    const next: ConsultView = type === "free" ? "free" : "questionnaire";
    navigateView(next);
  };

  const handleToggleBack = () => {
    navigateView("toggle");
  };

  const handleConvertToPaid = () => {
    navigateView("questionnaire");
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

  const readOnly = !isPhaseEditable(project.phase, "Consultation");

  const wrap = (content: React.ReactNode) => (
    <HubTeamProvider members={teamMembers}>
      <div>
        {authDisabled && <DemoCaption className="mb-4 px-10 pt-6" />}
        <PhaseLockedContent locked={readOnly}>{content}</PhaseLockedContent>
      </div>
    </HubTeamProvider>
  );

  if (view === "toggle") {
    return wrap(
      <TypeToggleScreen
        project={project}
        onContinue={handleContinue}
        onBack={handleBack}
        readOnly={readOnly}
      />,
    );
  }

  if (view === "free") {
    return wrap(
      <FreeConsultationRecord
        project={project}
        mode={mode}
        onBack={handleToggleBack}
        onConvertToPaid={handleConvertToPaid}
        readOnly={readOnly}
      />,
    );
  }

  return wrap(
    <PaidConsultationRecord
      project={project}
      mode={mode}
      initialTab={paidTabFromView(view)}
      onBack={handleToggleBack}
      onTabChange={navigateView}
      readOnly={readOnly}
    />,
  );
}
