"use client";

import { useMemo } from "react";

import { mapProjectCardToClientLinked, mapProjectToClientLinked } from "@/lib/clients/map-client-projects";
import { useProjects } from "@/hooks/use-projects";
import type { ClientLinkedProject } from "@/types/clients";

export function useClientProjects(clientId: string | null) {
  const { projects, rawProjects, isLoading, error, refetch } = useProjects({
    clients: clientId ? [clientId] : undefined,
    limit: 100,
    page: 1,
  });

  const linkedProjects: ClientLinkedProject[] = useMemo(() => {
    if (rawProjects.length > 0) {
      const filtered = clientId
        ? rawProjects.filter((p) => p.client?.id === clientId)
        : rawProjects;
      if (filtered.length > 0) {
        return filtered.map(mapProjectToClientLinked);
      }
    }
    if (clientId) {
      return projects
        .filter((p) => p.client && p.client !== "No client")
        .map(mapProjectCardToClientLinked);
    }
    return projects.map(mapProjectCardToClientLinked);
  }, [rawProjects, projects, clientId]);

  return {
    projects: linkedProjects,
    isLoading,
    error,
    refetch,
  };
}
