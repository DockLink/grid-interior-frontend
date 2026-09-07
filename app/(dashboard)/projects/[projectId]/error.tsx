"use client";

import { RouteErrorBoundary } from "@/components/errors/route-error-boundary";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorBoundary error={error} reset={reset} title="Project failed to load" />;
}
