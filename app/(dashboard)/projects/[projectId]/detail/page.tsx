import { DetailPageClient } from "@/components/projects/hub/detail/detail-page-client";

export default async function ProjectDetailDrawingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;

  return <DetailPageClient projectId={projectId} viewParam={view} />;
}
