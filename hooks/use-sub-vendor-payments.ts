"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapSubVendorPaymentApiToView } from "@/lib/suppliers/map-suppliers";
import { queryKeys } from "@/lib/query/keys";
import type {
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

export function useSubVendorPayments(
  subVendorId: string | null,
  options: { enabled?: boolean } = {},
) {
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

  return {
    payments: (data ?? []) as SubVendorPayment[],
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load payment records"
      : null,
    refetch: () => refetch().then(() => undefined),
  };
}
