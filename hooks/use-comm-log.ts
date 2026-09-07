"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapCommLogApiToView } from "@/lib/clients/map-clients";
import { queryKeys } from "@/lib/query/keys";
import type { CommLogEntry, CommLogEntryApi, CreateCommLogPayload } from "@/types/clients";

export function useCommLog(clientId: string | null, options: { enabled?: boolean } = {}) {
  const qc = useQueryClient();
  const enabled =
    options.enabled !== false && Boolean(clientId) && !isAuthDisabled();
  const qKey = queryKeys.clients.commLog(clientId ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<{ data: CommLogEntryApi[] }>(
        `/clients/${clientId}/comm-log`,
      );
      return (raw.data ?? []).map(mapCommLogApiToView);
    },
    staleTime: 30_000,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCommLogPayload) =>
      authApiClient<CommLogEntryApi>(`/clients/${clientId}/comm-log`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (result) => {
      const mapped = mapCommLogApiToView(result);
      qc.setQueryData<CommLogEntry[]>(qKey, (prev) => [mapped, ...(prev ?? [])]);
    },
  });

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: qKey });
  }, [qc, qKey]);

  return {
    entries: data ?? [],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load comm log") : null,
    refetch: () => refetch().then(() => undefined),
    createEntry: (payload: CreateCommLogPayload) => createMutation.mutateAsync(payload),
    isCreating: createMutation.isPending,
    invalidate,
  };
}
