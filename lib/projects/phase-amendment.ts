import { isPhaseEditable } from "@/lib/projects/map-project-hub";
import type { ProjectPhase } from "@/lib/projects/design-tokens";

/** Server-enforced cap. A completed phase can be reopened this many times. */
export const PHASE_AMENDMENT_LIMIT = 4;

export type PhaseAmendmentMode = "locked" | "amending";

export function resolvePhaseEditAccess(input: {
  currentPhase: ProjectPhase | undefined;
  targetPhase: ProjectPhase;
  amendmentCount: number;
  amendmentOpen: boolean;
  hasStage: boolean;
  stagesLoading: boolean;
}): {
  pastPhase: boolean;
  readOnly: boolean;
  canReopen: boolean;
  limitReached: boolean;
  mode: PhaseAmendmentMode | null;
  used: number;
} {
  const pastPhase = input.currentPhase
    ? !isPhaseEditable(input.currentPhase, input.targetPhase)
    : false;
  const used = Math.max(0, input.amendmentCount);
  const open = pastPhase && input.amendmentOpen;
  const stagesReady = !input.stagesLoading;

  return {
    pastPhase,
    readOnly: pastPhase && !input.amendmentOpen,
    canReopen:
      pastPhase &&
      !input.amendmentOpen &&
      stagesReady &&
      input.hasStage &&
      used < PHASE_AMENDMENT_LIMIT,
    limitReached:
      pastPhase &&
      !input.amendmentOpen &&
      stagesReady &&
      used >= PHASE_AMENDMENT_LIMIT,
    mode: pastPhase ? (open ? "amending" : "locked") : null,
    used,
  };
}
