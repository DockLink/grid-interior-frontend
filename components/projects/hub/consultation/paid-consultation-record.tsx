"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useConsultation } from "@/hooks/use-consultation";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { findStageTaskable } from "@/lib/projects/seed-phases";
import type { ConsultView, ModeType, PaidTab } from "@/types/consultation";
import { viewFromPaidTab } from "@/types/consultation";
import type { ActiveProjectView } from "@/types/project-hub";

import { AudioTab } from "./audio-tab";
import { ConsultHeader } from "./consult-header";
import { GradientBtn, SectionCard, SectionTitle } from "./consultation-ui";
import { InventoryTab } from "./inventory-tab";
import { NotesThread } from "./notes-thread";
import { PaidTabNav } from "./paid-tab-nav";
import { QuestionnaireTab } from "./questionnaire-tab";
import { SiteMeasurementsTab } from "./site-measurements-tab";

export function PaidConsultationRecord({
  project,
  mode,
  initialTab,
  onBack,
  onTabChange,
  readOnly = false,
}: {
  project: ActiveProjectView;
  mode: ModeType;
  initialTab: PaidTab;
  onBack: () => void;
  onTabChange?: (view: ConsultView) => void;
  readOnly?: boolean;
}) {
  const [tab, setTab] = useState<PaidTab>(initialTab);
  const [completing, setCompleting] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);
  const { completeConsultation, isAuthOff } = useConsultation(project.id);
  const { tasks: stages, isLoading: stagesLoading } = useProjectTaskables(
    project.id,
    "STAGE",
    { limit: 100 },
  );
  const consultationStage = findStageTaskable(stages, "Consultation");
  const isComplete =
    consultationStage?.status === "COMPLETED" || localCompleted;
  const completeDisabled =
    readOnly || completing || isComplete || (!isAuthOff && stagesLoading);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (next: PaidTab) => {
    setTab(next);
    onTabChange?.(viewFromPaidTab(next));
  };

  const handleComplete = async () => {
    if (completeDisabled) return;
    setCompleting(true);
    try {
      const result = await completeConsultation({
        mode,
        consult_type: "paid",
      });
      if (!result?.completed && result?.stage?.status !== "COMPLETED") {
        throw new Error("Consultation stage was not marked COMPLETED");
      }
      setLocalCompleted(true);
      toast.success("Consultation marked complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark consultation complete");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <ConsultHeader project={project} consultType="paid" mode={mode} onBack={onBack} showModeBadge />
      <PaidTabNav tab={tab} setTab={handleTabChange} />

      <div className={readOnly ? "pointer-events-none opacity-80" : undefined}>
        {tab === "questionnaire" && <QuestionnaireTab key={project.id} project={project} />}
        {tab === "site" && <SiteMeasurementsTab projectId={project.id} />}
        {tab === "inventory" && <InventoryTab projectId={project.id} />}
        {tab === "notes" && (
          <SectionCard>
            <SectionTitle icon="forum" title="Notes & Thread" />
            <NotesThread projectId={project.id} />
          </SectionCard>
        )}
        {tab === "audio" && <AudioTab projectId={project.id} />}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <GradientBtn
          label={
            completing
              ? "Saving…"
              : isComplete
                ? "Consultation Complete"
                : "Mark Consultation Complete"
          }
          icon={isComplete ? "check" : "check_circle"}
          onClick={() => void handleComplete()}
          disabled={completeDisabled}
        />
      </div>
    </div>
  );
}
