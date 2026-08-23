"use client";

import { useEffect, useState } from "react";

import type { ConsultView, ModeType, PaidTab } from "@/types/consultation";
import { viewFromPaidTab } from "@/types/consultation";
import type { ActiveProjectView } from "@/types/project-hub";

import { AudioTab } from "./audio-tab";
import { ConsultHeader } from "./consult-header";
import { SectionCard, SectionTitle } from "./consultation-ui";
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
}: {
  project: ActiveProjectView;
  mode: ModeType;
  initialTab: PaidTab;
  onBack: () => void;
  onTabChange?: (view: ConsultView) => void;
}) {
  const [tab, setTab] = useState<PaidTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (next: PaidTab) => {
    setTab(next);
    onTabChange?.(viewFromPaidTab(next));
  };

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <ConsultHeader project={project} consultType="paid" mode={mode} onBack={onBack} showModeBadge />
      <PaidTabNav tab={tab} setTab={handleTabChange} />

      {tab === "questionnaire" && <QuestionnaireTab />}
      {tab === "site" && <SiteMeasurementsTab />}
      {tab === "inventory" && <InventoryTab />}
      {tab === "notes" && (
        <SectionCard>
          <SectionTitle icon="forum" title="Notes & Thread" />
          <NotesThread />
        </SectionCard>
      )}
      {tab === "audio" && <AudioTab />}
    </div>
  );
}
