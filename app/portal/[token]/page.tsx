import { ClientPortalWorkspace } from "@/components/portal/client-portal-workspace";

// Dynamic route — `token` can be used for link validation in a future API integration.
// e.g. /portal/abc123 → validate token against API, then render
export default function PortalPage({
  params,
}: {
  params: { token: string };
}) {
  // TODO: validate params.token against API and render expiry screen if invalid
  void params.token;

  return <ClientPortalWorkspace />;
}
