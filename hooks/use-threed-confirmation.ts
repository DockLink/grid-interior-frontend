"use client";

import { useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { queryKeys } from "@/lib/query/keys";
import type { ThreeDConfirmation, ThreeDConfirmationUpdate } from "@/types/threed";

export function useThreeDConfirmation(projectId?: string) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const enabled = Boolean(projectId) && !authOff;
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.threed.confirmation(projectId ?? ""),
    queryFn: () =>
      authApiClient<ThreeDConfirmation>(`/projects/${projectId}/threed/confirmation`),
    enabled,
    staleTime: 15_000,
  });

  const mutation = useMutation({
    mutationFn: (payload: ThreeDConfirmationUpdate) =>
      authApiClient<ThreeDConfirmation>(`/projects/${projectId}/threed/confirmation`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (saved) => {
      if (!projectId) return;
      qc.setQueryData(queryKeys.threed.confirmation(projectId), saved);
    },
  });

  const save = useCallback(
    (payload: ThreeDConfirmationUpdate) => {
      const run = queue.current.then(() => mutation.mutateAsync(payload));
      queue.current = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
    [mutation],
  );

  return {
    data,
    isLoading: enabled ? isLoading : false,
    error: enabled ? error : null,
    save,
    isSaving: mutation.isPending,
  };
}
