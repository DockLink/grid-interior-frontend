"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  mapBoqCategoriesResponse,
  mapBoqLineItemApi,
  mapBoqSummary,
} from "@/lib/boq/map-boq";
import { BOQ_CATEGORIES } from "@/lib/projects/mock-execution";
import { queryKeys } from "@/lib/query/keys";
import type {
  BoqCategoriesResponse,
  BoqCategoryUpdatePayload,
  BoqCommercialUpdatePayload,
  BoqLineItemApi,
  BoqLineItemCreatePayload,
  BoqLineItemUpdatePayload,
  BoqQuotesReplacePayload,
  BoqSummaryBucketApi,
  BoqSummaryResponse,
} from "@/types/boq";
import type { BoqCategory, BoqLineItem } from "@/types/execution";

function boqBase(projectId: string) {
  return `/projects/${projectId}/boq`;
}

export function useProjectBoq(
  projectId: string,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false && Boolean(projectId);
  const qKey = queryKeys.boq.project(projectId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async (): Promise<BoqCategory[]> => {
      if (authOff) return BOQ_CATEGORIES;
      const raw = await authApiClient<BoqCategoriesResponse>(boqBase(projectId));
      return mapBoqCategoriesResponse(raw);
    },
    staleTime: 15_000,
    enabled,
  });

  const categories = useMemo(() => data ?? [], [data]);

  const invalidate = useCallback(() => {
    return Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.boq.project(projectId) }),
      qc.invalidateQueries({ queryKey: queryKeys.boq.summary(projectId) }),
    ]);
  }, [qc, projectId]);

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: BoqCategoryUpdatePayload;
    }) => {
      if (authOff) return null;
      return authApiClient(`${boqBase(projectId)}/categories/${categoryId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: BoqLineItemCreatePayload;
    }) => {
      if (authOff) {
        const local: BoqLineItemApi = {
          id: `mock-item-${Date.now()}`,
          item: payload.item,
          description: payload.description ?? "",
          length_in: payload.length_in ?? "",
          width_in: payload.width_in ?? "",
          height_in: payload.height_in ?? "",
          image_url: payload.image_url ?? null,
          image_file_id: payload.image_file_id ?? null,
          unit: payload.unit ?? "LS",
          qty: payload.qty ?? 1,
          rate: payload.rate ?? 0,
          design_firm_price: 0,
          negotiation_status: "pending",
          payment_status: "not-paid",
          contract_uploaded: false,
          contract_file_id: null,
          contract_url: null,
          selected_supplier_id: null,
          sort_order: payload.sort_order ?? 0,
          quotes: [],
        };
        return local;
      }
      return authApiClient<BoqLineItemApi>(
        `${boqBase(projectId)}/categories/${categoryId}/items`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: BoqLineItemUpdatePayload;
    }) => {
      if (authOff) return null;
      return authApiClient<BoqLineItemApi>(`${boqBase(projectId)}/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (authOff) return { id: itemId, deleted: true as const };
      return authApiClient(`${boqBase(projectId)}/items/${itemId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const replaceQuotesMutation = useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: BoqQuotesReplacePayload;
    }) => {
      if (authOff) return null;
      return authApiClient<BoqLineItemApi>(
        `${boqBase(projectId)}/items/${itemId}/quotes`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const updateCommercialMutation = useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: BoqCommercialUpdatePayload;
    }) => {
      if (authOff) return null;
      return authApiClient<BoqLineItemApi>(
        `${boqBase(projectId)}/items/${itemId}/commercial`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  return {
    categories,
    isLoading: enabled && !authOff ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load BOQ"
      : null,
    refetch: () => refetch().then(() => undefined),
    isAuthOff: authOff,
    updateCategory: (categoryId: string, payload: BoqCategoryUpdatePayload) =>
      updateCategoryMutation.mutateAsync({ categoryId, payload }),
    createItem: async (categoryId: string, payload: BoqLineItemCreatePayload) => {
      const raw = await createItemMutation.mutateAsync({ categoryId, payload });
      return raw ? mapBoqLineItemApi(raw) : null;
    },
    updateItem: async (itemId: string, payload: BoqLineItemUpdatePayload) => {
      const raw = await updateItemMutation.mutateAsync({ itemId, payload });
      return raw ? mapBoqLineItemApi(raw) : null;
    },
    deleteItem: (itemId: string) => deleteItemMutation.mutateAsync(itemId),
    replaceQuotes: async (itemId: string, payload: BoqQuotesReplacePayload) => {
      const raw = await replaceQuotesMutation.mutateAsync({ itemId, payload });
      return raw ? mapBoqLineItemApi(raw) : null;
    },
    updateCommercial: async (
      itemId: string,
      payload: BoqCommercialUpdatePayload,
    ) => {
      const raw = await updateCommercialMutation.mutateAsync({ itemId, payload });
      return raw ? mapBoqLineItemApi(raw) : null;
    },
    isMutating:
      updateCategoryMutation.isPending ||
      createItemMutation.isPending ||
      updateItemMutation.isPending ||
      deleteItemMutation.isPending ||
      replaceQuotesMutation.isPending ||
      updateCommercialMutation.isPending,
  };
}

export function useProjectBoqSummary(
  projectId: string,
  options: { enabled?: boolean } = {},
) {
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false && Boolean(projectId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.boq.summary(projectId),
    queryFn: async (): Promise<BoqSummaryBucketApi[]> => {
      if (authOff) {
        // Derive rough estimates from mock categories when auth is off
        const byCode: Record<string, number> = {};
        for (const cat of BOQ_CATEGORIES) {
          byCode[cat.code] = cat.items.reduce((s, it) => s + it.qty * it.rate, 0);
        }
        return [
          { id: "electrical", label: "Electrical", estimate: byCode.C ?? 0 },
          { id: "flooring", label: "Flooring", estimate: byCode.G ?? 0 },
          { id: "ceiling", label: "Ceiling", estimate: byCode.F ?? 0 },
          {
            id: "walls",
            label: "Walls, Doors & Windows",
            estimate: (byCode.B ?? 0) + (byCode.D ?? 0) + (byCode.E ?? 0),
          },
          { id: "furniture", label: "Furniture", estimate: byCode.H ?? 0 },
          {
            id: "interior",
            label: "Interior Elements",
            estimate:
              (byCode.A ?? 0) +
              (byCode.I ?? 0) +
              (byCode.J ?? 0) +
              (byCode.K ?? 0) +
              (byCode.L ?? 0),
          },
        ];
      }
      const raw = await authApiClient<BoqSummaryResponse>(
        `${boqBase(projectId)}/summary`,
      );
      return mapBoqSummary(raw);
    },
    staleTime: 15_000,
    enabled,
  });

  return {
    buckets: data ?? [],
    isLoading: enabled && !authOff ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load BOQ summary"
      : null,
    refetch: () => refetch().then(() => undefined),
  };
}

export type { BoqLineItem };
