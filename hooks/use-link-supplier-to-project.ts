"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import {
  clientIdFromLinksRaw,
  subVendorLinkRowsFromRaw,
  supplierLinkRowsFromRaw,
} from "@/lib/projects/map-project-links";
import { queryKeys } from "@/lib/query/keys";
import type { ProjectLinksApi, UpdateProjectLinksPayload } from "@/types/project-links";

export function useLinkSupplierToProject(supplierId: string) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      projectId,
      role,
    }: {
      projectId: string;
      role: string;
    }) => {
      const raw = await authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`);
      const existing = supplierLinkRowsFromRaw(raw);
      if (existing.some((row) => row.supplier_id === supplierId)) {
        return raw;
      }
      const payload: UpdateProjectLinksPayload = {
        client_id: clientIdFromLinksRaw(raw),
        suppliers: [...existing, { supplier_id: supplierId, role }],
        sub_vendors: subVendorLinkRowsFromRaw(raw),
      };
      return authApiClient<ProjectLinksApi>(`/projects/${projectId}/links`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (_result, { projectId }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.projectLinks.detail(projectId) });
      void qc.invalidateQueries({ queryKey: queryKeys.suppliers.linkedProjects(supplierId) });
    },
  });

  const linkProject = useCallback(
    (projectId: string, role: string) => mutation.mutateAsync({ projectId, role }),
    [mutation],
  );

  return {
    linkProject,
    isLinking: mutation.isPending,
  };
}
