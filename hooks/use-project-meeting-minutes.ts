"use client";

import { useCallback, useEffect, useState } from "react";

import { useProjectMembers } from "@/hooks/use-project-members";
import { useUploadFile } from "@/hooks/use-upload-file";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { canManageProject } from "@/lib/projects/permissions";
import {
  mapMeetingMinute,
  mapMeetingMinutesList,
} from "@/lib/meeting-minutes/map-meeting-minute";
import type {
  CreateMeetingMinutePayload,
  MeetingMinute,
  MeetingMinutesListResponse,
  UpdateMeetingMinutePayload,
} from "@/types/meeting-minutes";

export function useProjectMeetingMinutes(projectId: string) {
  const { effectiveRole, isViewer } = useProjectMembers();
  const { uploadFile } = useUploadFile();

  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionItemUpdating, setActionItemUpdating] = useState<string | null>(null);

  const canManage = canManageProject(effectiveRole, isViewer);

  const fetchMinutes = useCallback(async () => {
    if (isAuthDisabled()) {
      setMinutes([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApiClient<MeetingMinutesListResponse>(
        `/meeting-minutes/projects/${projectId}?page=1&limit=100`
      );
      setMinutes(mapMeetingMinutesList(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meeting minutes");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchMinutes();
  }, [fetchMinutes]);

  const createMinute = useCallback(
    async (payload: CreateMeetingMinutePayload) => {
      const created = await authApiClient<MeetingMinute>(
        `/meeting-minutes/projects/${projectId}`,
        { method: "POST", body: JSON.stringify(payload) }
      );
      await fetchMinutes();
      return mapMeetingMinute(created);
    },
    [projectId, fetchMinutes]
  );

  const updateMinute = useCallback(
    async (id: string, payload: UpdateMeetingMinutePayload) => {
      const updated = await authApiClient<MeetingMinute>(`/meeting-minutes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await fetchMinutes();
      return mapMeetingMinute(updated);
    },
    [fetchMinutes]
  );

  const removeMinute = useCallback(
    async (id: string) => {
      await authApiClient(`/meeting-minutes/${id}`, { method: "DELETE" });
      await fetchMinutes();
    },
    [fetchMinutes]
  );

  const setActionItemStatus = useCallback(
    async (minuteId: string, index: number, status: "PENDING" | "COMPLETED") => {
      const key = `${minuteId}:${index}`;
      setActionItemUpdating(key);
      try {
        const updated = await authApiClient<MeetingMinute>(
          `/meeting-minutes/${minuteId}/action-items/${index}/status`,
          { method: "PATCH", body: JSON.stringify({ status }) }
        );
        const mapped = mapMeetingMinute(updated);
        setMinutes((prev) => prev.map((m) => (m.id === minuteId ? mapped : m)));
        return mapped;
      } finally {
        setActionItemUpdating(null);
      }
    },
    []
  );

  /** Uploads an attachment file and returns the floating storage token (id). */
  const uploadAttachment = useCallback(
    async (file: File) => {
      const { token } = await uploadFile(file);
      return token;
    },
    [uploadFile]
  );

  return {
    minutes,
    isLoading,
    error,
    canManage,
    refetch: fetchMinutes,
    createMinute,
    updateMinute,
    removeMinute,
    setActionItemStatus,
    actionItemUpdating,
    uploadAudio: uploadAttachment,
    uploadAttachment,
  };
}
