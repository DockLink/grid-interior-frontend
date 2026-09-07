"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapClientApiToView, mapClientsListResponse } from "@/lib/clients/map-clients";
import { queryKeys } from "@/lib/query/keys";
import type {
  Client,
  ClientsListResponse,
  ClientsQueryParams,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/types/clients";

function toQueryString(params: ClientsQueryParams = {}): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.source) qs.set("source", params.source);
  if (params.stage) qs.set("stage", params.stage);
  if (params.include_deleted) qs.set("include_deleted", "true");
  const str = qs.toString();
  return str ? `?${str}` : "";
}

async function fetchClients(params: ClientsQueryParams): Promise<{
  data: Client[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}> {
  const raw = await authApiClient<ClientsListResponse>(`/clients${toQueryString(params)}`);
  return mapClientsListResponse(raw);
}

export function useClients(
  params: ClientsQueryParams = { page: 1, limit: 100 },
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const enabled = options.enabled !== false && !isAuthDisabled();
  const qKey = queryKeys.clients.list(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: () => fetchClients(params),
    staleTime: 30_000,
    enabled,
  });

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: queryKeys.clients.all });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateClientPayload) =>
      authApiClient("/clients", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => void invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientPayload }) =>
      authApiClient(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: (result, { id }) => {
      const mapped = mapClientApiToView(result as Record<string, unknown>);
      qc.setQueryData<{ data: Client[]; meta: unknown }>(qKey, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((c) => (c.id === id ? mapped : c)),
        };
      });
      qc.setQueryData(queryKeys.clients.detail(id), mapped);
      void invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApiClient(`/clients/${id}`, { method: "DELETE" }),
    onSuccess: (_result, id) => {
      qc.setQueryData<{ data: Client[]; meta: unknown }>(qKey, (prev) => {
        if (!prev) return prev;
        return { ...prev, data: prev.data.filter((c) => c.id !== id) };
      });
      void invalidate();
    },
  });

  return {
    clients: data?.data ?? [],
    meta: data?.meta ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load clients") : null,
    refetch: () => refetch().then(() => undefined),
    createClient: (payload: CreateClientPayload) => createMutation.mutateAsync(payload),
    updateClient: (id: string, payload: UpdateClientPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteClient: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
