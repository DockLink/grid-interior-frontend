"use client";

import { useCallback, useEffect, useState } from "react";

function readIds(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String));
  } catch {
    return new Set();
  }
}

function writeIds(key: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Persist which dashboard panel row ids the user has dismissed via "All clear".
 * Fresh ids (new tasks / requests) still appear after clear.
 */
export function usePanelDismiss(storageKey: string) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setDismissedIds(readIds(storageKey));
  }, [storageKey]);

  const isDismissed = useCallback(
    (id: string | number) => dismissedIds.has(String(id)),
    [dismissedIds],
  );

  const dismissAll = useCallback(
    (ids: Array<string | number>) => {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.add(String(id));
        writeIds(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const filterVisible = useCallback(
    <T extends { id: string | number }>(items: T[]) =>
      items.filter((item) => !dismissedIds.has(String(item.id))),
    [dismissedIds],
  );

  return { dismissedIds, isDismissed, dismissAll, filterVisible };
}
