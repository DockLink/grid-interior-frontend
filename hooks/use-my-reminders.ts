"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { queryKeys } from "@/lib/query/keys";
import type { MyReminder, MyRemindersResponse } from "@/types/clients";

export function useMyReminders() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.clients.myReminders(),
    queryFn: async () => {
      const res = await authApiClient<MyRemindersResponse>("/clients/my-reminders");
      return res.data ?? [];
    },
    staleTime: 30_000,
    enabled: !isAuthDisabled(),
  });

  return {
    reminders: (data ?? []) as MyReminder[],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load reminders") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
