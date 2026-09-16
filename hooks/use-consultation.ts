"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  mapConsultAudioApi,
  mapConsultationAggregate,
  mapConsultInventoryApi,
  mapConsultNoteApi,
  mapConsultRoomApi,
  mapConsultTaskApi,
  toConsultTaskStatusApi,
} from "@/lib/consultation/map-consultation";
import {
  SAMPLE_AUDIO,
  SAMPLE_COMMENTS,
  SAMPLE_INVENTORY,
  SAMPLE_ROOMS,
  SAMPLE_TASKS,
} from "@/lib/projects/mock-consultation";
import { queryKeys } from "@/lib/query/keys";
import type {
  ConsultAudioApi,
  ConsultAudioCreatePayload,
  ConsultationAggregateResponse,
  ConsultInventoryCreatePayload,
  ConsultInventoryItemApi,
  ConsultInventoryUpdatePayload,
  ConsultNoteApi,
  ConsultNoteCreatePayload,
  ConsultRoomApi,
  ConsultRoomCreatePayload,
  ConsultRoomUpdatePayload,
  ConsultTaskApi,
  ConsultTaskCreatePayload,
  ConsultTaskUpdatePayload,
} from "@/types/consultation";

function base(projectId: string) {
  return `/projects/${projectId}/consultation`;
}

export function useConsultation(
  projectId: string,
  options: { enabled?: boolean } = {},
) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const enabled = options.enabled !== false && Boolean(projectId);
  const qKey = queryKeys.consultation.project(projectId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      if (authOff) {
        return {
          rooms: SAMPLE_ROOMS,
          inventory: SAMPLE_INVENTORY,
          notes: SAMPLE_COMMENTS,
          audio: SAMPLE_AUDIO,
          tasks: SAMPLE_TASKS,
        };
      }
      const raw = await authApiClient<ConsultationAggregateResponse>(base(projectId));
      return mapConsultationAggregate(raw);
    },
    staleTime: 15_000,
    enabled,
  });

  const rooms = useMemo(() => data?.rooms ?? [], [data]);
  const inventory = useMemo(() => data?.inventory ?? [], [data]);
  const notes = useMemo(() => data?.notes ?? [], [data]);
  const audio = useMemo(() => data?.audio ?? [], [data]);
  const tasks = useMemo(() => data?.tasks ?? [], [data]);

  const invalidate = useCallback(() => {
    return qc.invalidateQueries({ queryKey: qKey });
  }, [qc, qKey]);

  const createRoomMutation = useMutation({
    mutationFn: async (payload: ConsultRoomCreatePayload) => {
      if (authOff) {
        return mapConsultRoomApi({
          id: `mock-room-${Date.now()}`,
          name: payload.name,
          length: payload.length ?? "",
          width: payload.width ?? "",
          height: payload.height ?? "",
        });
      }
      const raw = await authApiClient<ConsultRoomApi>(`${base(projectId)}/rooms`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return mapConsultRoomApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({
      roomId,
      payload,
    }: {
      roomId: string;
      payload: ConsultRoomUpdatePayload;
    }) => {
      if (authOff) return null;
      const raw = await authApiClient<ConsultRoomApi>(
        `${base(projectId)}/rooms/${roomId}`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
      return mapConsultRoomApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      if (authOff) return { id: roomId, deleted: true as const };
      return authApiClient(`${base(projectId)}/rooms/${roomId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const createInventoryMutation = useMutation({
    mutationFn: async (payload: ConsultInventoryCreatePayload) => {
      if (authOff) {
        return mapConsultInventoryApi({
          id: `mock-inv-${Date.now()}`,
          name: payload.name,
          spec: payload.spec ?? "",
          h: payload.h ?? "",
          w: payload.w ?? "",
          l: payload.l ?? "",
          qty: payload.qty ?? "1",
          notes: payload.notes ?? "",
          measured: payload.measured ?? false,
        });
      }
      const raw = await authApiClient<ConsultInventoryItemApi>(
        `${base(projectId)}/inventory`,
        { method: "POST", body: JSON.stringify(payload) },
      );
      return mapConsultInventoryApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: ConsultInventoryUpdatePayload;
    }) => {
      if (authOff) return null;
      const raw = await authApiClient<ConsultInventoryItemApi>(
        `${base(projectId)}/inventory/${itemId}`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
      return mapConsultInventoryApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (authOff) return { id: itemId, deleted: true as const };
      return authApiClient(`${base(projectId)}/inventory/${itemId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (payload: ConsultNoteCreatePayload) => {
      if (authOff) {
        return mapConsultNoteApi({
          id: `mock-note-${Date.now()}`,
          author_user_id: "1",
          text: payload.text,
          created_at: new Date().toISOString(),
          attachment_name: payload.attachment_name ?? null,
          attachment_url: payload.attachment_url ?? null,
        });
      }
      const raw = await authApiClient<ConsultNoteApi>(`${base(projectId)}/notes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return mapConsultNoteApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const createAudioMutation = useMutation({
    mutationFn: async (payload: ConsultAudioCreatePayload) => {
      if (authOff) {
        return mapConsultAudioApi({
          id: `mock-audio-${Date.now()}`,
          name: payload.name,
          duration: payload.duration ?? "00:00",
          date: payload.date ?? "Just now",
          size: payload.size ?? "—",
          storage_file_id: payload.storage_file_id ?? null,
          file_url: payload.file_url ?? null,
        });
      }
      const raw = await authApiClient<ConsultAudioApi>(`${base(projectId)}/audio`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return mapConsultAudioApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const deleteAudioMutation = useMutation({
    mutationFn: async (audioId: string) => {
      if (authOff) return { id: audioId, deleted: true as const };
      return authApiClient(`${base(projectId)}/audio/${audioId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (payload: ConsultTaskCreatePayload) => {
      if (authOff) {
        return mapConsultTaskApi({
          id: `mock-task-${Date.now()}`,
          title: payload.title,
          assignee_user_id: payload.assignee_user_id ?? "1",
          status: payload.status ?? "pending",
        });
      }
      const raw = await authApiClient<ConsultTaskApi>(`${base(projectId)}/tasks`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return mapConsultTaskApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: ConsultTaskUpdatePayload;
    }) => {
      if (authOff) return null;
      const raw = await authApiClient<ConsultTaskApi>(
        `${base(projectId)}/tasks/${taskId}`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
      return mapConsultTaskApi(raw);
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (authOff) return { id: taskId, deleted: true as const };
      return authApiClient(`${base(projectId)}/tasks/${taskId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      if (!authOff) void invalidate();
    },
  });

  return {
    rooms,
    inventory,
    notes,
    audio,
    tasks,
    isLoading: enabled && !authOff ? isLoading : false,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to load consultation"
      : null,
    refetch: () => refetch().then(() => undefined),
    isAuthOff: authOff,
    createRoom: (payload: ConsultRoomCreatePayload) =>
      createRoomMutation.mutateAsync(payload),
    updateRoom: (roomId: string, payload: ConsultRoomUpdatePayload) =>
      updateRoomMutation.mutateAsync({ roomId, payload }),
    deleteRoom: (roomId: string) => deleteRoomMutation.mutateAsync(roomId),
    createInventory: (payload: ConsultInventoryCreatePayload) =>
      createInventoryMutation.mutateAsync(payload),
    updateInventory: (itemId: string, payload: ConsultInventoryUpdatePayload) =>
      updateInventoryMutation.mutateAsync({ itemId, payload }),
    deleteInventory: (itemId: string) => deleteInventoryMutation.mutateAsync(itemId),
    createNote: (payload: ConsultNoteCreatePayload) =>
      createNoteMutation.mutateAsync(payload),
    createAudio: (payload: ConsultAudioCreatePayload) =>
      createAudioMutation.mutateAsync(payload),
    deleteAudio: (audioId: string) => deleteAudioMutation.mutateAsync(audioId),
    createTask: (payload: ConsultTaskCreatePayload) =>
      createTaskMutation.mutateAsync(payload),
    updateTask: (taskId: string, payload: ConsultTaskUpdatePayload) =>
      updateTaskMutation.mutateAsync({ taskId, payload }),
    deleteTask: (taskId: string) => deleteTaskMutation.mutateAsync(taskId),
    toTaskStatusApi: toConsultTaskStatusApi,
    isMutating:
      createRoomMutation.isPending ||
      updateRoomMutation.isPending ||
      deleteRoomMutation.isPending ||
      createInventoryMutation.isPending ||
      updateInventoryMutation.isPending ||
      deleteInventoryMutation.isPending ||
      createNoteMutation.isPending ||
      createAudioMutation.isPending ||
      deleteAudioMutation.isPending ||
      createTaskMutation.isPending ||
      updateTaskMutation.isPending ||
      deleteTaskMutation.isPending,
  };
}
