import { CommLogScreen } from "@/components/clients/comm-log-screen";

export default async function ClientCommLogPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <CommLogScreen clientId={Number(clientId)} />;
}
