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
  mapConsultSketchApi,
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
  ConsultSketchApi,
  ConsultSketchUpsertPayload,
  ConsultTaskApi,
  ConsultTaskCreatePayload,
  ConsultTaskUpdatePayload,
  ConsultationCompletePayload,
  ConsultationCompleteResponse,
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
          sketch: null,
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
  const sketch = data?.sketch ?? null;

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
        body: JSON.stringify({
          ...payload,
          // Backend DTO requires MinLength(1) on name
          name: payload.name.trim() || "New room",
        }),
      });
      return mapConsultRoomApi(raw);
    },
    onSuccess: (created) => {
      if (authOff || !created) return;
      qc.setQueryData(qKey, (old: ReturnType<typeof mapConsultationAggregate> | undefined) => {
        if (!old) return old;
        if (old.rooms.some((r) => r.id === created.id)) return old;
        return { ...old, rooms: [...old.rooms, created] };
      });
      void invalidate();
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
        {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            // Backend DTO requires MinLength(1) on name
            name: payload.name.trim() || "New item",
          }),
        },
      );
      return mapConsultInventoryApi(raw);
    },
    onSuccess: (created) => {
      if (authOff || !created) return;
      qc.setQueryData(qKey, (old: ReturnType<typeof mapConsultationAggregate> | undefined) => {
        if (!old) return old;
        if (old.inventory.some((i) => i.id === created.id)) return old;
        return { ...old, inventory: [...old.inventory, created] };
      });
      void invalidate();
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
          storage_file_id: payload.storage_file_id ?? null,
          attachment_name: payload.attachment_name ?? null,
          attachment_url: null,
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
      // Backend DTO (forbidNonWhitelisted): storage_file_id + name required;
      // duration/date/size optional. storage_file_id must be a project File UUID
      // from multipart upload (not a floating /storage/upload token).
      if (!payload.storage_file_id) {
        throw new Error("Audio upload is missing storage_file_id");
      }
      const raw = await authApiClient<ConsultAudioApi>(`${base(projectId)}/audio`, {
        method: "POST",
        body: JSON.stringify({
          storage_file_id: payload.storage_file_id,
          name: payload.name.trim() || "Audio recording",
          ...(payload.duration ? { duration: payload.duration } : {}),
          ...(payload.date ? { date: payload.date } : {}),
          ...(payload.size ? { size: payload.size } : {}),
        }),
      });
      return mapConsultAudioApi(raw);
    },
    onSuccess: (created) => {
      if (authOff || !created) return;
      qc.setQueryData(qKey, (old: ReturnType<typeof mapConsultationAggregate> | undefined) => {
        if (!old) return old;
        if (old.audio.some((a) => a.id === created.id)) return old;
        return { ...old, audio: [created, ...old.audio] };
      });
      void invalidate();
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
      // Backend DTO expects DONE | IN_PROGRESS | PENDING
      const statusApi =
        payload.status === "done"
          ? "DONE"
          : payload.status === "in-progress"
            ? "IN_PROGRESS"
            : payload.status
              ? "PENDING"
              : undefined;
      const raw = await authApiClient<ConsultTaskApi>(`${base(projectId)}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          title: payload.title,
          assignee_user_id: payload.assignee_user_id,
          ...(statusApi ? { status: statusApi } : {}),
        }),
      });
      return mapConsultTaskApi(raw);
    },
    onSuccess: (created) => {
      if (authOff || !created) return;
      qc.setQueryData(qKey, (old: ReturnType<typeof mapConsultationAggregate> | undefined) => {
        if (!old) return old;
        if (old.tasks.some((t) => t.id === created.id)) return old;
        return { ...old, tasks: [...old.tasks, created] };
      });
      void invalidate();
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
      const body: Record<string, unknown> = {};
      if (payload.title !== undefined) body.title = payload.title;
      if (payload.assignee_user_id !== undefined) {
        body.assignee_user_id = payload.assignee_user_id;
      }
      if (payload.status !== undefined) {
        body.status =
          payload.status === "done"
            ? "DONE"
            : payload.status === "in-progress"
              ? "IN_PROGRESS"
              : "PENDING";
      }
      const raw = await authApiClient<ConsultTaskApi>(
        `${base(projectId)}/tasks/${taskId}`,
        { method: "PATCH", body: JSON.stringify(body) },
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

  const completeConsultationMutation = useMutation({
    mutationFn: async (payload: ConsultationCompletePayload = {}) => {
      if (authOff) {
        return {
          stage: { id: "mock-consultation-stage", status: "COMPLETED", title: "Consultation" },
          next_stage: null,
          note: null,
          completed: true,
        } satisfies ConsultationCompleteResponse;
      }
      return authApiClient<ConsultationCompleteResponse>(`${base(projectId)}/complete`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      if (authOff) return;
      void invalidate();
      void qc.invalidateQueries({
        queryKey: ["projects", "taskables", projectId],
      });
      void qc.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    },
  });

  const upsertSketchMutation = useMutation({
    mutationFn: async (payload: ConsultSketchUpsertPayload) => {
      if (authOff) {
        return mapConsultSketchApi({
          id: `mock-sketch-${Date.now()}`,
          file_name: payload.file_name,
          uploaded_at: payload.uploaded_at ?? new Date().toISOString(),
          storage_file_id: payload.storage_file_id,
          file_url: null,
        });
      }
      const raw = await authApiClient<ConsultSketchApi>(`${base(projectId)}/sketch`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return mapConsultSketchApi(raw);
    },
    onSuccess: (created) => {
      qc.setQueryData(qKey, (old: ReturnType<typeof mapConsultationAggregate> | undefined) => {
        if (!old) return old;
        return { ...old, sketch: created };
      });
      if (!authOff) void invalidate();
    },
  });

  const deleteSketchMutation = useMutation({
    mutationFn: async () => {
      if (authOff) return { deleted: true as const };
      return authApiClient(`${base(projectId)}/sketch`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.setQueryData(qKey, (old: ReturnType<typeof mapConsultationAggregate> | undefined) => {
        if (!old) return old;
        return { ...old, sketch: null };
      });
      if (!authOff) void invalidate();
    },
  });

  return {
    rooms,
    inventory,
    notes,
    audio,
    tasks,
    sketch,
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
    completeConsultation: (payload?: ConsultationCompletePayload) =>
      completeConsultationMutation.mutateAsync(payload ?? {}),
    upsertSketch: (payload: ConsultSketchUpsertPayload) =>
      upsertSketchMutation.mutateAsync(payload),
    deleteSketch: () => deleteSketchMutation.mutateAsync(),
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
      deleteTaskMutation.isPending ||
      completeConsultationMutation.isPending ||
      upsertSketchMutation.isPending ||
      deleteSketchMutation.isPending,
  };
}
