import { LayoutPageClient } from "@/components/projects/hub/layout/layout-page-client";

export default async function ProjectLayoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;

  return <LayoutPageClient projectId={projectId} viewParam={view} />;
}
