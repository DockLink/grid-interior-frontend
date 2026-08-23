"use client";

import { useRouter } from "next/navigation";

import { ThreeDWorkspace } from "@/components/projects/hub/threed/threed-workspace";
import { projectThreeDRoute } from "@/types/navigation";
import { threedViewFromParam } from "@/types/threed";

export function ThreeDPageClient({
  projectId,
  viewParam,
}: {
  projectId: string;
  viewParam?: string;
}) {
  const router = useRouter();
  const initialView = threedViewFromParam(viewParam);

  return (
    <ThreeDWorkspace
      projectId={projectId}
      initialView={initialView}
      onViewChange={(view) => {
        router.replace(projectThreeDRoute(projectId, view));
      }}
    />
  );
}
