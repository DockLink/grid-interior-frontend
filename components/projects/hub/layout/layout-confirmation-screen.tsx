"use client";

import { ClientConfirmationWidget } from "@/components/projects/hub/shared/client-confirmation-widget";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-ui";
import type { ActiveProjectView } from "@/types/project-hub";

export function LayoutConfirmationScreen({
  project,
  onBack,
}: {
  project: ActiveProjectView;
  onBack: () => void;
}) {
  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb
        items={["Projects", project.name, "Layout", "Confirmation"]}
        onBack={onBack}
      />
      <h1 className="mb-1.5 text-2xl font-bold text-[var(--figma-navy)]">Layout Confirmation</h1>
      <p className="mb-6 text-[13px] text-[var(--figma-gray500)]">
        Standalone view of the client confirmation panel for the Layout phase.
      </p>
      <div className="max-w-[680px]">
        <ClientConfirmationWidget phase="Layout" nextPhase="3D Design" />
      </div>
    </div>
  );
}
