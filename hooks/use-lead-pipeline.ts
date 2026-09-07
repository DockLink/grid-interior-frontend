"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapLeadPipelineResponse } from "@/lib/clients/map-clients";
import { queryKeys } from "@/lib/query/keys";
import type { LeadPipelineResponse } from "@/types/clients";

export function useLeadPipeline(options: { enabled?: boolean } = {}) {
  const enabled = options.enabled !== false && !isAuthDisabled();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.clients.pipeline(),
    queryFn: async () => {
      const raw = await authApiClient<LeadPipelineResponse>("/clients/pipeline");
      return mapLeadPipelineResponse(raw);
    },
    staleTime: 30_000,
    enabled,
  });

  const empty: LeadPipelineResponse = {
    new: [],
    meeting: [],
    proposal: [],
    won: [],
    lost: [],
  };

  return {
    pipeline: data ?? empty,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load pipeline") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
