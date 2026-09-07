"use client";

import { createContext, useContext } from "react";

import type { HubTeamMember } from "@/types/project-hub";

const HubTeamContext = createContext<HubTeamMember[]>([]);

export function HubTeamProvider({
  members,
  children,
}: {
  members: HubTeamMember[];
  children: React.ReactNode;
}) {
  return <HubTeamContext.Provider value={members}>{children}</HubTeamContext.Provider>;
}

export function useHubTeam(): HubTeamMember[] {
  return useContext(HubTeamContext);
}

/** @deprecated Use useHubTeam() inside hub workspaces */
export function getHubTeamFallback(): HubTeamMember[] {
  return [];
}
