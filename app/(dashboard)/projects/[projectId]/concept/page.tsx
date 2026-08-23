import { ConceptPageClient } from "@/components/projects/hub/concept/concept-page-client";

export default async function ProjectConceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;

  return <ConceptPageClient projectId={projectId} viewParam={view} />;
}
