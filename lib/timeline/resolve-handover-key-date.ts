const HANDOVER_RE = /handover|hand[\s-]?over|close[\s-]?out/i;

/** Latest milestone whose name is explicitly handover / hand-over / close-out. */
export function findHandoverNamedMilestone<T extends { name: string }>(
  milestones: T[],
): T | undefined {
  return [...milestones].reverse().find((m) => HANDOVER_RE.test(m.name));
}

/** Handover card date: named milestone date, else the project end label. */
export function resolveHandoverDateLabel(
  milestones: { name: string; date: string }[],
  projectEndLabel: string,
): string {
  return findHandoverNamedMilestone(milestones)?.date ?? projectEndLabel;
}
