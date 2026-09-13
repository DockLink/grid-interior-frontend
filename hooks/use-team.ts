"use client";

import { useMemo } from "react";

import { useUsers } from "@/hooks/use-users";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { MOCK_TEAM } from "@/lib/team/mock-team";
import { mapUsersToStudioMembers } from "@/lib/team/map-team";
import type { CreateUserRequest } from "@/types/users-api";

export function useTeam() {
  const authDisabled = isAuthDisabled();
  const {
    users,
    isLoading,
    isMutating,
    error,
    refetch,
    createUser,
  } = useUsers({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const members = useMemo(() => {
    if (authDisabled) return MOCK_TEAM;
    return mapUsersToStudioMembers(users);
  }, [authDisabled, users]);

  return {
    members,
    isLoading: authDisabled ? false : isLoading,
    isMutating,
    error: authDisabled ? null : error,
    refetch,
    createUser: async (payload: CreateUserRequest) => createUser(payload),
    authDisabled,
  };
}
