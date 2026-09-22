"use client";

import { useEffect, useMemo } from "react";

import { useTeamDirectoryStats } from "@/hooks/use-team-directory-stats";
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

  const {
    projectCountByUserId,
    openTaskCountByUserId,
    isLoading: statsLoading,
  } = useTeamDirectoryStats(!authDisabled);

  // Always refresh the directory when this screen mounts (e.g. after User
  // Management / Project Assignments changes in another admin tab).
  useEffect(() => {
    if (authDisabled) return;
    void refetch();
  }, [authDisabled, refetch]);

  const members = useMemo(() => {
    if (authDisabled) return MOCK_TEAM;
    return mapUsersToStudioMembers(users).map((member) => ({
      ...member,
      projects: projectCountByUserId.get(member.id) ?? 0,
      openTasks: openTaskCountByUserId.get(member.id) ?? 0,
    }));
  }, [authDisabled, users, projectCountByUserId, openTaskCountByUserId]);

  return {
    members,
    isLoading: authDisabled ? false : isLoading || statsLoading,
    isMutating,
    error: authDisabled ? null : error,
    refetch,
    createUser: async (payload: CreateUserRequest) => createUser(payload),
    authDisabled,
  };
}
