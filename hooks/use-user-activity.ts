"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapAuditListToActivity } from "@/lib/audit/map-audit";
import { queryKeys } from "@/lib/query/keys";
import type { UserActivityItem } from "@/types/audit";

const MOCK_ACTIVITY: UserActivityItem[] = [
  { id: "a1", text: "Signed in from Chrome on macOS", at: "2h ago" },
  { id: "a2", text: "Updated project Lumière Penthouse", at: "Yesterday" },
  { id: "a3", text: "Uploaded FF&E Schedule v4.xlsx", at: "3d ago" },
];

export function useUserActivity(actorId: string | null | undefined) {
  const authDisabled = isAuthDisabled();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.audit.actor(actorId ?? ""),
    queryFn: async () => {
      const raw = await authApiClient<unknown>(`/audit/actor/${actorId}`);
      return mapAuditListToActivity(raw);
    },
    enabled: !authDisabled && Boolean(actorId),
    staleTime: 30_000,
    retry: false,
  });

  if (authDisabled) {
    return {
      activity: MOCK_ACTIVITY,
      isLoading: false,
      error: null as string | null,
      refetch: async () => undefined,
      authDisabled: true,
    };
  }

  return {
    activity: data ?? [],
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load activity"
      : null,
    refetch: () => refetch().then(() => undefined),
    authDisabled: false,
  };
}
