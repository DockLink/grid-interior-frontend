"use client";

import { HubModal } from "@/components/projects/hub/hub-modal";
import { ProjectMilestonesEditor } from "@/components/projects/project-milestones-editor";

export function MilestoneManagementModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  return (
    <HubModal
      onClose={onClose}
      title="Manage milestones"
      subtitle="Organize milestones under each stage"
      icon="flag"
      maxWidth={560}
    >
      <ProjectMilestonesEditor projectId={projectId} />
    </HubModal>
  );
}
