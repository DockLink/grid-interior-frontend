import { ProjectLinksScreen } from "@/components/projects/hub/project-links-screen";

export default async function ProjectLinksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectLinksScreen projectId={projectId} />;
}
