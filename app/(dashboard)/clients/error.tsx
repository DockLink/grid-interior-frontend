"use client";

import { RouteErrorBoundary } from "@/components/errors/route-error-boundary";

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorBoundary error={error} reset={reset} title="Clients failed to load" />;
}
