import type {
  ConsultationAggregateResponse,
  ConsultAudioApi,
  ConsultAudioFile,
  ConsultComment,
  ConsultInventoryItem,
  ConsultInventoryItemApi,
  ConsultNoteApi,
  ConsultRoom,
  ConsultRoomApi,
  ConsultTask,
  ConsultTaskApi,
  ConsultTaskStatusApi,
} from "@/types/consultation";

export function mapConsultTaskStatus(status: string): string {
  const s = status.toLowerCase().replace(/_/g, "-");
  if (s === "done" || s === "completed") return "Done";
  if (s === "in-progress" || s === "in progress") return "In Progress";
  return "Pending";
}

export function toConsultTaskStatusApi(status: string): ConsultTaskStatusApi {
  const s = status.toLowerCase().replace(/_/g, "-");
  if (s === "done" || s === "completed") return "done";
  if (s === "in-progress" || s === "in progress") return "in-progress";
  return "pending";
}

export function mapConsultRoomApi(room: ConsultRoomApi): ConsultRoom {
  return {
    id: room.id,
    name: room.name ?? "",
    length: room.length ?? "",
    width: room.width ?? "",
    height: room.height ?? "",
  };
}

export function mapConsultInventoryApi(
  item: ConsultInventoryItemApi,
): ConsultInventoryItem {
  return {
    id: item.id,
    name: item.name ?? "",
    spec: item.spec ?? "",
    h: item.h ?? "",
    w: item.w ?? "",
    l: item.l ?? "",
    qty: item.qty ?? "",
    notes: item.notes ?? "",
    measured: Boolean(item.measured),
  };
}

export function mapConsultNoteApi(note: ConsultNoteApi): ConsultComment {
  const created = note.created_at ? new Date(note.created_at) : null;
  const time =
    created && !Number.isNaN(created.getTime())
      ? created.toLocaleString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : note.created_at || "";

  return {
    id: note.id,
    memberId: note.author_user_id ?? "",
    text: note.text ?? "",
    time,
  };
}

export function mapConsultAudioApi(audio: ConsultAudioApi): ConsultAudioFile {
  return {
    id: audio.id,
    name: audio.name ?? "",
    duration: audio.duration ?? "",
    date: audio.date ?? "",
    size: audio.size ?? "",
    storageFileId: audio.storage_file_id ?? null,
    fileUrl: audio.file_url ?? null,
  };
}

export function mapConsultTaskApi(task: ConsultTaskApi): ConsultTask {
  return {
    id: task.id,
    title: task.title ?? "",
    assigneeId: task.assignee_user_id ?? null,
    status: mapConsultTaskStatus(task.status ?? "pending"),
  };
}

export function mapConsultationAggregate(raw: ConsultationAggregateResponse) {
  return {
    rooms: (raw.rooms ?? []).map(mapConsultRoomApi),
    inventory: (raw.inventory ?? []).map(mapConsultInventoryApi),
    notes: (raw.notes ?? []).map(mapConsultNoteApi),
    audio: (raw.audio ?? []).map(mapConsultAudioApi),
    tasks: (raw.tasks ?? []).map(mapConsultTaskApi),
  };
}
