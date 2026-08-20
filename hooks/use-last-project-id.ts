"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { resolveEffectiveLastProjectId } from "@/lib/navigation/last-project";

export function useLastProjectId(): string | null {
  const pathname = usePathname();

  return useMemo(() => resolveEffectiveLastProjectId(pathname), [pathname]);
}
