"use client";

import { useQuery } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { queryKeys } from "@/lib/query/keys";
import { mapTasksList } from "@/lib/tasks/map-task";
import { toTasksQueryString } from "@/lib/tasks/query-string";
import type { Task, TasksListResponse, TasksQueryParams } from "@/types/tasks";

async function fetchTasks(params: TasksQueryParams): Promise<Task[]> {
  const query = toTasksQueryString(params);
  const res = await authApiClient<TasksListResponse>(`/tasks${query}`);
  return mapTasksList(res);
}

export function useTasks(params: TasksQueryParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => fetchTasks(params),
    staleTime: 30_000,
    enabled: !isAuthDisabled(),
  });

  return {
    tasks: data ?? [],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load tasks") : null,
    refetch: () => refetch().then(() => undefined),
  };
}
