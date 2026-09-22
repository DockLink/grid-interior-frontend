import { PHASES, type ProjectPhase } from "@/lib/projects/design-tokens";
import type { ProjectStatus } from "@/types/projects";

type StageLike = { title?: string | null; status?: string | null };
type TaskLike = { status: string };

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function stageToPhase(stage: string | null | undefined): ProjectPhase {
  if (!stage) return "Consultation";
  const normalized = stage.trim().toLowerCase();
  const match = PHASES.find((p) => p.toLowerCase() === normalized);
  if (match) return match;
  if (normalized.includes("concept")) return "Concept Design";
  if (normalized.includes("layout")) return "Layout";
  if (normalized.includes("3d")) return "3D Design";
  if (normalized.includes("detail") || normalized.includes("drawing")) return "Detail Drawings";
  if (normalized.includes("execution") || normalized.includes("site")) return "Execution";
  if (normalized.includes("consult")) return "Consultation";
  return "Consultation";
}

function phaseIndexOf(phase: ProjectPhase): number {
  const idx = PHASES.indexOf(phase);
  return idx >= 0 ? idx : 0;
}

function findStageForPhase(stages: StageLike[], phase: ProjectPhase): StageLike | undefined {
  const needle = phase.toLowerCase();
  return (
    stages.find((t) => (t.title ?? "").trim().toLowerCase() === needle) ??
    stages.find((t) => (t.title ?? "").toLowerCase().includes(needle))
  );
}

/** First non-COMPLETED matched phase (same rules as hub resolveCurrentPhase). */
function resolvePhaseFromStages(
  currentStage: string | null | undefined,
  stages?: StageLike[],
): ProjectPhase {
  if (stages?.length) {
    let matchedAny = false;
    for (const phase of PHASES) {
      const stage = findStageForPhase(stages, phase);
      if (!stage) continue;
      matchedAny = true;
      if (stage.status !== "COMPLETED") return phase;
    }
    if (matchedAny) return "Execution";
  }
  return stageToPhase(currentStage);
}

/** Phase-stepper style fill: Consultation=0% … Execution=100%. */
export function progressFromPhaseIndex(
  index: number,
  phaseCount: number = PHASES.length,
): number {
  if (phaseCount <= 1) return 0;
  return clampPct((index / (phaseCount - 1)) * 100);
}

export function progressFromPhase(phase: ProjectPhase): number {
  return progressFromPhaseIndex(phaseIndexOf(phase));
}

export function progressFromCurrentStage(currentStage: string | null | undefined): number {
  return progressFromPhase(stageToPhase(currentStage));
}

/**
 * Prefer STAGE taskable completion when available.
 * Falls back to current_stage / phase index.
 */
export function progressFromStages(
  stages: StageLike[] | undefined,
  currentStage?: string | null,
): number {
  return progressFromPhase(resolvePhaseFromStages(currentStage, stages));
}

export function progressFromTasks(tasks: TaskLike[] | undefined): number {
  if (!tasks?.length) return 0;
  const done = tasks.filter((t) => t.status === "COMPLETED").length;
  return clampPct((done / tasks.length) * 100);
}

/**
 * Blend phase position with task completion inside the current phase so the
 * bar moves as work is finished, not only when a whole stage flips COMPLETED.
 */
export function blendPhaseAndTaskProgress(
  phaseProgress: number,
  taskProgress: number,
  phaseCount: number = PHASES.length,
): number {
  if (phaseCount <= 1) return clampPct(taskProgress);
  if (phaseProgress >= 100) return 100;
  const slice = 100 / (phaseCount - 1);
  return clampPct(phaseProgress + (taskProgress / 100) * slice);
}

export function resolveProjectProgress(options: {
  apiCompletion?: number | null;
  currentStage?: string | null;
  projectStatus?: ProjectStatus | "Active" | "Inactive" | null;
  stages?: StageLike[];
  tasks?: TaskLike[];
  /** When true, blend task % into the current phase slice (hub overview). */
  blendTasks?: boolean;
}): number {
  const inactive =
    options.projectStatus === "INACTIVE" || options.projectStatus === "Inactive";
  if (inactive) return 100;

  if (
    typeof options.apiCompletion === "number" &&
    Number.isFinite(options.apiCompletion) &&
    options.apiCompletion >= 0
  ) {
    return clampPct(options.apiCompletion);
  }

  const phaseProgress = progressFromStages(options.stages, options.currentStage);
  if (options.blendTasks) {
    return blendPhaseAndTaskProgress(phaseProgress, progressFromTasks(options.tasks));
  }

  return phaseProgress;
}
