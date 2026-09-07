"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapClientApiToView } from "@/lib/clients/map-clients";
import { queryKeys } from "@/lib/query/keys";
import type { Client, ClientApi } from "@/types/clients";

export function useClient(clientId: string | null, options: { enabled?: boolean } = {}) {
  const enabled =
    options.enabled !== false && Boolean(clientId) && !isAuthDisabled();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.clients.detail(clientId ?? ""),
    queryFn: async () => {
      const raw = await authApiClient<ClientApi>(`/clients/${clientId}`);
      return mapClientApiToView(raw);
    },
    staleTime: 30_000,
    enabled,
  });

  return {
    client: (data ?? null) as Client | null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load client") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
