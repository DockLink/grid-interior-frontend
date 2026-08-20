import { HistoricalProjectDetail } from "@/components/projects/hub/historical-project-detail";

export default async function HistoricalProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <HistoricalProjectDetail projectId={projectId} />;
}
