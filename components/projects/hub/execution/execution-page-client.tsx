"use client";

import { useRouter } from "next/navigation";

import { executionViewFromParam } from "@/types/execution";
import { projectExecutionRoute } from "@/types/navigation";

import { ExecutionWorkspace } from "./execution-workspace";

export function ExecutionPageClient({
  projectId,
  viewParam,
}: {
  projectId: string;
  viewParam?: string;
}) {
  const router = useRouter();
  const initialView = executionViewFromParam(viewParam);

  return (
    <ExecutionWorkspace
      projectId={projectId}
      initialView={initialView}
      onViewChange={(view) => {
        router.replace(projectExecutionRoute(projectId, view));
      }}
    />
  );
}
