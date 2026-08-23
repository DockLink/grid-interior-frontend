import { ThreeDPageClient } from "@/components/projects/hub/threed/threed-page-client";

export default async function ProjectThreeDPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;

  return <ThreeDPageClient projectId={projectId} viewParam={view} />;
}
