"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapProjectLinksApiToView } from "@/lib/projects/map-project-links";
import { mapVendorTaskApiToView } from "@/lib/suppliers/map-vendor-tasks";
import { queryKeys } from "@/lib/query/keys";
import type { SubVendor, Supplier } from "@/types/suppliers";
import type {
  CreateVendorTaskPayload,
  UpdateVendorTaskPayload,
  VendorPartyContact,
  VendorPartyKind,
  VendorTask,
  VendorTasksListResponse,
  VendorTasksQueryParams,
} from "@/types/vendor-tasks";

function toQueryString(params: VendorTasksQueryParams = {}): string {
  const qs = new URLSearchParams();
  if (params.project_id) qs.set("project_id", params.project_id);
  if (params.party_id) qs.set("party_id", params.party_id);
  if (params.party_kind) qs.set("party_kind", params.party_kind);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export function useVendorTasks(
  params: VendorTasksQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const enabled = options.enabled !== false && !isAuthDisabled();
  const qKey = queryKeys.vendorTasks.list(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<VendorTasksListResponse>(
        `/vendor-tasks${toQueryString(params)}`,
      );
      return (raw.data ?? []).map(mapVendorTaskApiToView);
    },
    staleTime: 30_000,
    enabled,
  });

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: queryKeys.vendorTasks.all });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateVendorTaskPayload) =>
      authApiClient("/vendor-tasks", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => void invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVendorTaskPayload }) =>
      authApiClient(`/vendor-tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: (result, { id }) => {
      const mapped = mapVendorTaskApiToView(result as Record<string, unknown>);
      qc.setQueryData<VendorTask[]>(qKey, (prev) =>
        (prev ?? []).map((t) => (t.id === id ? mapped : t)),
      );
      void invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApiClient(`/vendor-tasks/${id}`, { method: "DELETE" }),
    onSuccess: (_result, id) => {
      qc.setQueryData<VendorTask[]>(qKey, (prev) => (prev ?? []).filter((t) => t.id !== id));
      void invalidate();
    },
  });

  return {
    tasks: data ?? [],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load vendor tasks") : null,
    refetch: () => refetch().then(() => undefined),
    createTask: (payload: CreateVendorTaskPayload) => createMutation.mutateAsync(payload),
    updateTask: (id: string, payload: UpdateVendorTaskPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteTask: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/** Resolves project name from React Query cache for vendor task exports. */
export function getProjectNameFromCache(
  qc: ReturnType<typeof useQueryClient>,
  projectId: string,
): string {
  const cached = qc.getQueryData<{ name?: string }>(queryKeys.projects.detail(projectId));
  return cached?.name ?? "Project";
}

/** Resolves party contact from React Query cache for vendor task exports and print. */
export function getVendorPartyContactFromCache(
  qc: ReturnType<typeof useQueryClient>,
  partyKind: VendorPartyKind,
  partyId: string,
): VendorPartyContact {
  if (partyKind === "supplier") {
    const supplier = qc.getQueryData<Supplier>(queryKeys.suppliers.detail(partyId));
    return {
      name: supplier?.name ?? "Supplier",
      contactPerson: supplier?.contactPerson,
      email: supplier?.email ?? "",
      phone: supplier?.phone ?? "",
    };
  }
  const vendor = qc.getQueryData<SubVendor>(queryKeys.subVendors.detail(partyId));
  return {
    name: vendor?.name ?? "Sub-vendor",
    company: vendor?.company,
    email: vendor?.email ?? "",
    phone: vendor?.phone ?? "",
  };
}

export function getVendorPartyNameFromCache(
  qc: ReturnType<typeof useQueryClient>,
  partyKind: VendorPartyKind,
  partyId: string,
): string {
  return getVendorPartyContactFromCache(qc, partyKind, partyId).name;
}

/** Re-export for vendor-tasks-tab — party contact resolution via suppliers cache. */
export { mapProjectLinksApiToView };
