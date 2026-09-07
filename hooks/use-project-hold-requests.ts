"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  mapHoldRequestsList,
  toProcessHoldRequestBody,
} from "@/lib/hold-requests/map-hold-request";
import { queryKeys } from "@/lib/query/keys";
import type {
  HoldRequestsListResponse,
  TaskableHoldRequest,
  TaskableHoldRequestStatus,
} from "@/types/hold-requests";

export interface ProcessHoldRequestPayload {
  taskableHoldRequestId: string;
  action: "approve" | "reject" | "resume";
  reviewRemark?: string;
  approvedStartDate?: string;
  approvedEndDate?: string;
  resumeDate?: string;
}

export interface HoldRequestsQueryParams {
  status?: TaskableHoldRequestStatus;
  projectId?: string;
  requestedById?: string;
  limit?: number;
}

async function fetchHoldRequests(
  params: HoldRequestsQueryParams,
): Promise<TaskableHoldRequest[]> {
  const qs = new URLSearchParams({
    page: "1",
    limit: String(params.limit ?? 50),
    ...(params.status ? { status: params.status } : {}),
    ...(params.requestedById ? { requested_by_id: params.requestedById } : {}),
  });
  const res = await authApiClient<HoldRequestsListResponse>(
    `/taskable-hold-requests?${qs}`,
  );
  let items = mapHoldRequestsList(res);
  if (params.projectId) {
    items = items.filter((r) => r.task?.projectId === params.projectId);
  }
  return items;
}

export function useHoldRequests(options: HoldRequestsQueryParams = {}) {
  const qc = useQueryClient();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      status: options.status,
      projectId: options.projectId,
      requestedById: options.requestedById,
      limit: options.limit ?? 50,
    }),
    [options.status, options.projectId, options.requestedById, options.limit],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.holdRequests.list(queryParams),
    queryFn: () => fetchHoldRequests(queryParams),
    staleTime: 30_000,
    enabled: !isAuthDisabled(),
  });

  const processMutation = useMutation({
    mutationFn: (payload: ProcessHoldRequestPayload) =>
      authApiClient("/taskable-hold-requests/process", {
        method: "POST",
        body: JSON.stringify(toProcessHoldRequestBody(payload)),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.holdRequests.all });
      await qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const processRequest = useCallback(
    async (payload: ProcessHoldRequestPayload) => {
      setIsProcessing(payload.taskableHoldRequestId);
      try {
        await processMutation.mutateAsync(payload);
      } finally {
        setIsProcessing(null);
      }
    },
    [processMutation],
  );

  return {
    requests: data ?? [],
    isLoading,
    isProcessing,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load hold requests"
      : null,
    refetch: () => refetch().then(() => undefined),
    processRequest,
  };
}

/** @deprecated Use useHoldRequests — kept for existing imports */
export function useProjectHoldRequests(options?: {
  status?: TaskableHoldRequestStatus;
  projectId?: string;
  limit?: number;
}) {
  return useHoldRequests(options);
}
