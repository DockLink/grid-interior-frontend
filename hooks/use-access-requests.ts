"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { queryKeys } from "@/lib/query/keys";
import type {
  AccessRequest,
  AccessRequestsListResponse,
  AccessRequestsQueryParams,
  CreateAccessRequestPayload,
  ReviewAccessRequestPayload,
} from "@/types/access-requests";

function toQueryString(params: AccessRequestsQueryParams = {}): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.project_id) qs.set("project_id", params.project_id);
  if (params.requested_by_id) qs.set("requested_by_id", params.requested_by_id);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

async function fetchAccessRequests(
  params: AccessRequestsQueryParams,
): Promise<AccessRequestsListResponse> {
  return authApiClient<AccessRequestsListResponse>(
    `/access-requests${toQueryString(params)}`,
  );
}

export function useAccessRequests(
  params: AccessRequestsQueryParams = { page: 1, limit: 50 },
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const enabled = options.enabled !== false && !isAuthDisabled();
  const qKey = queryKeys.accessRequests.list(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: () => fetchAccessRequests(params),
    staleTime: 30_000,
    enabled,
  });

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: queryKeys.accessRequests.all });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateAccessRequestPayload) =>
      authApiClient<AccessRequest>("/access-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => void invalidate(),
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: ReviewAccessRequestPayload) =>
      authApiClient<AccessRequest>("/access-requests/review", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => void invalidate(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      authApiClient(`/access-requests/${id}`, { method: "DELETE" }),
    onSuccess: () => void invalidate(),
  });

  const createRequest = useCallback(
    (payload: CreateAccessRequestPayload) => createMutation.mutateAsync(payload),
    [createMutation],
  );

  const reviewRequest = useCallback(
    (payload: ReviewAccessRequestPayload) => reviewMutation.mutateAsync(payload),
    [reviewMutation],
  );

  const cancelRequest = useCallback(
    (id: string) => cancelMutation.mutateAsync(id),
    [cancelMutation],
  );

  return {
    requests: data?.data ?? [],
    meta: data
      ? {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
        }
      : null,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load access requests"
      : null,
    refetch: () => refetch().then(() => undefined),
    createRequest,
    reviewRequest,
    cancelRequest,
  };
}
