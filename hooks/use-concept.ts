"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  mapConceptAreaApi,
  mapConceptCardApi,
  mapConceptRenderApi,
  mapConceptRevisionApi,
  mapConceptTree,
} from "@/lib/concept/map-concept";
import {
  CONCEPT_AREAS,
  CONCEPT_CARDS,
  CONCEPT_RENDER_GALLERY,
  CONCEPT_REVISION_LOG,
} from "@/lib/projects/mock-concept";
import { queryKeys } from "@/lib/query/keys";
import type {
  ConceptAreaApi,
  ConceptAreaCreatePayload,
  ConceptCardApi,
  ConceptCardCreatePayload,
  ConceptCardUpdatePayload,
  ConceptRenderApi,
  ConceptRenderCreatePayload,
  ConceptRevisionApi,
  ConceptRevisionCreatePayload,
  ConceptTreeResponse,
} from "@/types/concept";

function base(projectId: string) {
  return `/projects/${projectId}/concept`;
}

export function useConcept(
  projectId: string,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false && Boolean(projectId);
  const qKey = queryKeys.concept.project(projectId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      if (authOff) {
        return {
          areas: CONCEPT_AREAS,
          cards: CONCEPT_CARDS,
          renders: CONCEPT_RENDER_GALLERY,
          revisions: CONCEPT_REVISION_LOG,
        };
      }
      const raw = await authApiClient<ConceptTreeResponse>(base(projectId));
      const mapped = mapConceptTree(raw);
      return {
        areas: mapped.areas,
        cards: mapped.cards,
        renders: mapped.renders,
        revisions: mapped.revisions,
      };
    },
    staleTime: 15_000,
    enabled,
  });

  const areas = useMemo(() => data?.areas ?? [], [data]);
  const cards = useMemo(() => data?.cards ?? [], [data]);
  const renders = useMemo(() => data?.renders ?? [], [data]);
  const revisions = useMemo(() => data?.revisions ?? [], [data]);

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: qKey });
  }, [qc, qKey]);

  const createAreaMutation = useMutation({
    mutationFn: async (payload: ConceptAreaCreatePayload) => {
      if (authOff) {
        return mapConceptAreaApi({
          id: `mock-area-${Date.now()}`,
          name: payload.name,
          icon: payload.icon ?? "door_front",
          concept_count: 0,
          cards: [],
        });
      }
      const raw = await authApiClient<ConceptAreaApi>(`${base(projectId)}/areas`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return mapConceptAreaApi(raw);
    },
    onSuccess: (created) => {
      if (!created) return;
      const { cards: _cards, ...area } = created;
      qc.setQueryData(qKey, (prev: typeof data) => {
        if (!prev) {
          return {
            areas: [area],
            cards: [],
            renders: [],
            revisions: [],
          };
        }
        if (prev.areas.some((a) => a.id === area.id)) return prev;
        return { ...prev, areas: [...prev.areas, area] };
      });
      if (!authOff) void invalidate();
    },
  });

  const createCardMutation = useMutation({
    mutationFn: async ({
      areaId,
      payload,
    }: {
      areaId: string;
      payload: ConceptCardCreatePayload;
    }) => {
      if (authOff) {
        return mapConceptCardApi(
          {
            id: `mock-card-${Date.now()}`,
            name: payload.name,
            file_name: payload.file_name ?? "",
            file_type: payload.file_type ?? "jpg",
            file_size: payload.file_size ?? "",
            thumb_url: payload.thumb_url ?? "",
            confirm_status: payload.confirm_status ?? "pending",
          },
          areaId,
        );
      }
      // Backend Create DTO rejects unknown fields (forbidNonWhitelisted).
      const { confirm_status: _confirm, ...apiPayload } = payload;
      const raw = await authApiClient<ConceptCardApi>(
        `${base(projectId)}/areas/${areaId}/cards`,
        { method: "POST", body: JSON.stringify(apiPayload) },
      );
      return mapConceptCardApi(raw, areaId);
    },
    onSuccess: (created) => {
      if (created) {
        qc.setQueryData(qKey, (prev: typeof data) => {
          if (!prev) return prev;
          const areas = prev.areas.map((a) =>
            a.id === created.areaId
              ? { ...a, conceptCount: a.conceptCount + 1 }
              : a,
          );
          return { ...prev, areas, cards: [...prev.cards, created] };
        });
      }
      if (!authOff) void invalidate();
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({
      cardId,
      payload,
    }: {
      cardId: string;
      payload: ConceptCardUpdatePayload;
    }) => {
      if (authOff) return null;
      // confirm_status is handled by confirmCard (separate Nest endpoint).
      const { confirm_status: _confirm, ...apiPayload } = payload;
      const raw = await authApiClient<ConceptCardApi>(
        `${base(projectId)}/cards/${cardId}`,
        { method: "PATCH", body: JSON.stringify(apiPayload) },
      );
      return mapConceptCardApi(raw);
    },
    onSuccess: () => {
      void invalidate();
    },
  });

  const confirmCardMutation = useMutation({
    mutationFn: async ({
      cardId,
      status,
    }: {
      cardId: string;
      status: "confirmed" | "pending";
    }) => {
      if (authOff) {
        const cached = qc.getQueryData<{
          cards: { id: string; areaId: string; confirmStatus: string }[];
        }>(qKey);
        const existing = cached?.cards.find((c) => c.id === cardId);
        if (!existing) return null;
        return { ...existing, confirmStatus: status } as ReturnType<
          typeof mapConceptCardApi
        >;
      }
      const raw = await authApiClient<ConceptCardApi>(
        `${base(projectId)}/cards/${cardId}/confirm`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: status === "confirmed" ? "CONFIRMED" : "PENDING",
          }),
        },
      );
      return mapConceptCardApi(raw);
    },
    onSuccess: (updated) => {
      if (updated) {
        qc.setQueryData(qKey, (prev: typeof data) => {
          if (!prev) return prev;
          return {
            ...prev,
            cards: prev.cards.map((c) =>
              c.id === updated.id
                ? updated
                : updated.confirmStatus === "confirmed" &&
                    c.areaId === updated.areaId
                  ? { ...c, confirmStatus: "pending" as const }
                  : c,
            ),
          };
        });
      }
      if (!authOff) void invalidate();
    },
  });

  const createRenderMutation = useMutation({
    mutationFn: async (payload: ConceptRenderCreatePayload) => {
      if (authOff) {
        return mapConceptRenderApi({
          id: `mock-render-${Date.now()}`,
          url: payload.url ?? "",
          caption: payload.caption ?? "New render",
        });
      }
      const raw = await authApiClient<ConceptRenderApi>(
        `${base(projectId)}/renders`,
        { method: "POST", body: JSON.stringify(payload) },
      );
      return mapConceptRenderApi(raw);
    },
    onSuccess: () => {
      void invalidate();
    },
  });

  const deleteRenderMutation = useMutation({
    mutationFn: async (renderId: string) => {
      if (authOff) return { id: renderId, deleted: true as const };
      return authApiClient(`${base(projectId)}/renders/${renderId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void invalidate();
    },
  });

  const createRevisionMutation = useMutation({
    mutationFn: async (payload: ConceptRevisionCreatePayload) => {
      if (authOff) {
        return mapConceptRevisionApi({
          id: `mock-rev-${Date.now()}`,
          date: payload.date ?? new Date().toISOString(),
          note: payload.note,
          chargeable: payload.chargeable ?? false,
        });
      }
      const raw = await authApiClient<ConceptRevisionApi>(
        `${base(projectId)}/revisions`,
        { method: "POST", body: JSON.stringify(payload) },
      );
      return mapConceptRevisionApi(raw);
    },
    onSuccess: () => {
      void invalidate();
    },
  });

  return {
    areas,
    cards,
    renders,
    revisions,
    isLoading: enabled && !authOff ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load concept"
      : null,
    refetch: () => refetch().then(() => undefined),
    isAuthOff: authOff,
    createArea: (payload: ConceptAreaCreatePayload) =>
      createAreaMutation.mutateAsync(payload),
    createCard: (areaId: string, payload: ConceptCardCreatePayload) =>
      createCardMutation.mutateAsync({ areaId, payload }),
    updateCard: (cardId: string, payload: ConceptCardUpdatePayload) =>
      updateCardMutation.mutateAsync({ cardId, payload }),
    confirmCard: (cardId: string, status: "confirmed" | "pending") =>
      confirmCardMutation.mutateAsync({ cardId, status }),
    createRender: (payload: ConceptRenderCreatePayload) =>
      createRenderMutation.mutateAsync(payload),
    deleteRender: (renderId: string) => deleteRenderMutation.mutateAsync(renderId),
    createRevision: (payload: ConceptRevisionCreatePayload) =>
      createRevisionMutation.mutateAsync(payload),
    isMutating:
      createAreaMutation.isPending ||
      createCardMutation.isPending ||
      updateCardMutation.isPending ||
      confirmCardMutation.isPending ||
      createRenderMutation.isPending ||
      deleteRenderMutation.isPending ||
      createRevisionMutation.isPending,
  };
}
