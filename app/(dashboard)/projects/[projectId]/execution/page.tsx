import { ExecutionPageClient } from "@/components/projects/hub/execution/execution-page-client";

export default async function ProjectExecutionPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;

  return <ExecutionPageClient projectId={projectId} viewParam={view} />;
}
