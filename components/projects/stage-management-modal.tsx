"use client";

import { HubModal } from "@/components/projects/hub/hub-modal";
import { ProjectStagesEditor } from "@/components/projects/project-stages-editor";

export function StageManagementModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  return (
    <HubModal
      onClose={onClose}
      title="Manage stages"
      subtitle="Edit timeline stages for this project"
      icon="layers"
      maxWidth={560}
    >
      <ProjectStagesEditor projectId={projectId} />
    </HubModal>
  );
}
