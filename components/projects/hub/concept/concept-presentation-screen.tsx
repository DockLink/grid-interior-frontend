"use client";

import { ClientPresentationWidget } from "@/components/projects/hub/concept/concept-presentation-widget";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-breadcrumb";

export function ConceptPresentationScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb items={["Concept Design", "Client Presentation Widget"]} onBack={onBack} />
      <h1 className="mb-5 text-xl font-bold text-[var(--figma-navy)]">Client Presentation & Feedback</h1>
      <div className="max-w-[640px]">
        <ClientPresentationWidget />
      </div>
    </div>
  );
}
