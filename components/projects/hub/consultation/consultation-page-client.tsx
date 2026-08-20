"use client";

import { useRouter } from "next/navigation";

import { ConsultationWorkspace } from "@/components/projects/hub/consultation/consultation-workspace";
import { consultViewFromParam } from "@/types/consultation";
import { projectConsultationRoute } from "@/types/navigation";

export function ConsultationPageClient({
  projectId,
  viewParam,
}: {
  projectId: string;
  viewParam?: string;
}) {
  const router = useRouter();
  const initialView = consultViewFromParam(viewParam);

  return (
    <ConsultationWorkspace
      projectId={projectId}
      initialView={initialView}
      onViewChange={(view) => {
        router.replace(projectConsultationRoute(projectId, view));
      }}
    />
  );
}
