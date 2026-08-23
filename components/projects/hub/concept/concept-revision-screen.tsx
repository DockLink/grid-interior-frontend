"use client";

import { RevisionTrackerWidget } from "@/components/projects/hub/concept/concept-revision-widget";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-breadcrumb";

export function ConceptRevisionScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb items={["Concept Design", "Revision Tracker Widget"]} onBack={onBack} />
      <h1 className="mb-5 text-xl font-bold text-[var(--figma-navy)]">Revision Tracker</h1>
      <div className="max-w-[560px]">
        <RevisionTrackerWidget />
      </div>
    </div>
  );
}
