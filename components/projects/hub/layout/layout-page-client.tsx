"use client";

import { useRouter } from "next/navigation";

import { LayoutWorkspace } from "@/components/projects/hub/layout/layout-workspace";
import { layoutViewFromParam } from "@/types/layout";
import { projectLayoutRoute } from "@/types/navigation";

export function LayoutPageClient({
  projectId,
  viewParam,
}: {
  projectId: string;
  viewParam?: string;
}) {
  const router = useRouter();
  const initialView = layoutViewFromParam(viewParam);

  return (
    <LayoutWorkspace
      projectId={projectId}
      initialView={initialView}
      onViewChange={(view) => {
        router.replace(projectLayoutRoute(projectId, view));
      }}
    />
  );
}
