import { ClientPortalWorkspace } from "@/components/portal/client-portal-workspace";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ClientPortalWorkspace token={token} />;
}
