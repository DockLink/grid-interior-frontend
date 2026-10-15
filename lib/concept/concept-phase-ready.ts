/** Concept Design is ready to close when every area has a client-finalized concept. */
export function isConceptPhaseReady(
  areas: { id: string }[],
  cards: { areaId: string; confirmStatus: string }[],
): boolean {
  if (areas.length === 0) return false;
  return areas.every((area) =>
    cards.some(
      (card) => card.areaId === area.id && card.confirmStatus === "confirmed",
    ),
  );
}
