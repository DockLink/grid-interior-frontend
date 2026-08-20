import { ConsultationPageClient } from "@/components/projects/hub/consultation/consultation-page-client";

export default async function ProjectConsultationPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view } = await searchParams;

  return <ConsultationPageClient projectId={projectId} viewParam={view} />;
}
