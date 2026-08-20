"use client";

import { useRouter } from "next/navigation";

import { detailViewFromParam } from "@/types/detail";
import { projectDetailRoute } from "@/types/navigation";

import { DetailDrawingsWorkspace } from "./detail-drawings-workspace";

export function DetailPageClient({
  projectId,
  viewParam,
}: {
  projectId: string;
  viewParam?: string;
}) {
  const router = useRouter();
  const initialView = detailViewFromParam(viewParam);

  return (
    <DetailDrawingsWorkspace
      projectId={projectId}
      initialView={initialView}
      onViewChange={(view) => {
        router.replace(projectDetailRoute(projectId, view));
      }}
    />
  );
}
