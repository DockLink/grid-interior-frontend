"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSubVendorPaymentApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type {
  CreateSubVendorPaymentPayload,
  SubVendorPayment,
  SubVendorPaymentApi,
  SubVendorPaymentsListResponse,
} from "@/types/suppliers";

function unwrapPaymentList(
  raw: SubVendorPaymentApi[] | SubVendorPaymentsListResponse | null | undefined,
): SubVendorPaymentApi[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

function unwrapPayment(
  raw: SubVendorPaymentApi | { data?: SubVendorPaymentApi } | null | undefined,
): SubVendorPaymentApi {
  if (raw && typeof raw === "object" && "data" in raw && raw.data && !Array.isArray(raw.data)) {
    return raw.data;
  }
  return raw as SubVendorPaymentApi;
}

export function useSubVendorPayments(
  subVendorId: string | null,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const enabled =
    options.enabled !== false && Boolean(subVendorId) && !isAuthDisabled();
  const qKey = queryKeys.subVendors.payments(subVendorId ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const raw = await authApiClient<
        SubVendorPaymentApi[] | SubVendorPaymentsListResponse
      >(`/sub-vendors/${subVendorId}/payments`);
      return unwrapPaymentList(raw).map(mapSubVendorPaymentApiToView);
    },
    staleTime: 30_000,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateSubVendorPaymentPayload) => {
      const raw = await authApiClient<SubVendorPaymentApi | { data: SubVendorPaymentApi }>(
        `/sub-vendors/${subVendorId}/payments`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      return mapSubVendorPaymentApiToView(unwrapPayment(raw));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qKey });
    },
  });

  return {
    payments: (data ?? []) as SubVendorPayment[],
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load payment records"
      : null,
    refetch: () => refetch().then(() => undefined),
    createPayment: (payload: CreateSubVendorPaymentPayload) => createMutation.mutateAsync(payload),
    isCreating: createMutation.isPending,
  };
}
