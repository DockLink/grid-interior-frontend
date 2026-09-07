"use client";

import { useEffect } from "react";

import { getApiErrorMessage } from "@/lib/api/handle-api-error";
import { MaterialIcon } from "@/components/projects/hub/material-icon";

export function RouteErrorBoundary({
  error,
  reset,
  title = "Something went wrong",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(242,109,109,0.12)]">
        <MaterialIcon name="error_outline" size={28} className="text-[var(--figma-alert)]" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-[var(--figma-navy)]">{title}</h2>
      <p className="mb-6 max-w-md text-sm text-[var(--figma-gray500)]">
        {getApiErrorMessage(error)}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-[var(--figma-navy)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
