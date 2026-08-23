"use client";

import { useRouter } from "next/navigation";

import { ConceptDesignWorkspace } from "@/components/projects/hub/concept/concept-design-workspace";
import { conceptViewFromParam } from "@/types/concept";
import { projectConceptRoute } from "@/types/navigation";

export function ConceptPageClient({
  projectId,
  viewParam,
}: {
  projectId: string;
  viewParam?: string;
}) {
  const router = useRouter();
  const initialView = conceptViewFromParam(viewParam);

  return (
    <ConceptDesignWorkspace
      projectId={projectId}
      initialView={initialView}
      onViewChange={(view) => {
        router.replace(projectConceptRoute(projectId, view));
      }}
    />
  );
}
