"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { DEFAULT_DEMO_PROJECT_ID, getActiveProject } from "@/lib/projects/mock-projects";
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
  const project = getActiveProject(projectId) ?? getActiveProject(DEFAULT_DEMO_PROJECT_ID)!;

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

  if (view === "toggle") {
    return (
      <div>
        <DemoCaption className="mb-4 px-10 pt-6" />
        <TypeToggleScreen project={project} onContinue={handleContinue} onBack={handleBack} />
      </div>
    );
  }

  if (view === "free") {
    return (
      <div>
        <DemoCaption className="mb-4 px-10 pt-6" />
        <FreeConsultationRecord
          project={project}
          mode={mode}
          onBack={handleToggleBack}
          onConvertToPaid={handleConvertToPaid}
        />
      </div>
    );
  }

  return (
    <div>
      <DemoCaption className="mb-4 px-10 pt-6" />
      <PaidConsultationRecord
        project={project}
        mode={mode}
        initialTab={paidTabFromView(view)}
        onBack={handleToggleBack}
        onTabChange={navigateView}
      />
    </div>
  );
}
