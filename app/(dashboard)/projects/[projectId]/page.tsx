import { ProjectOverviewScreen } from "@/components/projects/hub/project-overview-screen";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectOverviewScreen projectId={projectId} />;
}
