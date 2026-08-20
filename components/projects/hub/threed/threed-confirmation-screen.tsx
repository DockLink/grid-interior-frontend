"use client";

import { ClientConfirmationWidget } from "@/components/projects/hub/shared/client-confirmation-widget";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-ui";
import type { ActiveProjectView } from "@/types/project-hub";

export function ThreeDConfirmationScreen({
  project,
  onBack,
}: {
  project: ActiveProjectView;
  onBack: () => void;
}) {
  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb
        items={["Projects", project.name, "3D Design", "Confirmation"]}
        onBack={onBack}
      />
      <h1 className="mb-1.5 text-2xl font-bold text-[var(--figma-navy)]">3D Design Confirmation</h1>
      <p className="mb-6 text-[13px] text-[var(--figma-gray500)]">
        Standalone view of the client confirmation panel for the 3D Design phase.
      </p>
      <div className="max-w-[680px]">
        <ClientConfirmationWidget
          phase="3D Design"
          nextPhase="Detail Drawings"
          defaultFeedback="Client approved the 3D renders and walkthrough. Minor lighting adjustment requested for the lobby east view."
        />
      </div>
    </div>
  );
}
