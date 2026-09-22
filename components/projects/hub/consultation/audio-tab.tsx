"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useConsultation } from "@/hooks/use-consultation";
import { authApiClient } from "@/lib/api/authenticated-client";
import { getApiErrorMessage } from "@/lib/api/handle-api-error";
import { uploadFileMultipart } from "@/lib/files/multipart-upload";
import type { ConsultAudioFile } from "@/types/consultation";
import type { ProjectFile } from "@/types/files";

import { OutlineBtn, SectionCard, SectionTitle } from "./consultation-ui";

/** Provisioned admin folder used for consultation recordings (project File IDs). */
const CONSULTATION_AUDIO_FOLDER = "4.0 ADMIN/4.4 Meeting Minutes";

const MAX_AUDIO_BYTES = 200 * 1024 * 1024;
const ALLOWED_AUDIO_EXTS = ["mp3", "m4a", "wav"] as const;

function AudioRow({
  file,
  isPlaying,
  onPlay,
  onDelete,
}: {
  file: ConsultAudioFile;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !file.fileUrl) return;
    if (isPlaying) {
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [isPlaying, file.fileUrl]);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-3.5 rounded-xl border px-4 py-[13px] transition-all duration-[180ms]"
      style={{
        background: "#fff",
        borderColor: isPlaying ? "var(--figma-teal)" : "var(--figma-border)",
        boxShadow: hov ? "var(--neu-card-hover)" : "var(--neu-card)",
      }}
    >
      {file.fileUrl ? (
        <audio
          ref={audioRef}
          src={file.fileUrl}
          preload="none"
          onEnded={onPlay}
          className="hidden"
        />
      ) : null}
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border"
        style={{
          background: isPlaying ? "rgba(14,124,134,0.10)" : "var(--figma-gray50)",
          borderColor: isPlaying ? "var(--figma-teal)" : "var(--figma-border)",
        }}
      >
        <svg width="22" height="16" viewBox="0 0 22 16">
          {[2, 5, 1, 7, 4, 8, 3, 6, 2, 5, 3].map((h, i) => (
            <rect
              key={i}
              x={i * 2}
              y={8 - h}
              width="1.4"
              height={h * 2}
              rx="0.7"
              fill={isPlaying ? "var(--figma-teal)" : "var(--figma-gray400)"}
              opacity={isPlaying ? 1 : 0.6}
            />
          ))}
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 truncate text-[13px] font-semibold text-[var(--figma-navy)]">{file.name}</div>
        <div className="flex gap-3 text-[11px] text-[var(--figma-gray400)]">
          <span className="flex items-center gap-[3px]">
            <MaterialIcon name="schedule" outlined size={12} />
            {file.duration}
          </span>
          <span>{file.date}</span>
          <span>{file.size}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onPlay}
        disabled={!file.fileUrl}
        title={file.fileUrl ? undefined : "Playback URL not available yet"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border-none transition-all duration-[180ms]"
        style={{
          background: isPlaying ? "var(--figma-teal)" : "rgba(14,124,134,0.10)",
          boxShadow: isPlaying ? "var(--neu-raised)" : "none",
          cursor: file.fileUrl ? "pointer" : "not-allowed",
          opacity: file.fileUrl ? 1 : 0.5,
        }}
      >
        <MaterialIcon
          name={isPlaying ? "pause" : "play_arrow"}
          size={18}
          className={isPlaying ? "text-white" : "text-[var(--figma-teal)]"}
        />
      </button>

      <button
        type="button"
        onClick={onDelete}
        onMouseEnter={() => setDeleteHover(true)}
        onMouseLeave={() => setDeleteHover(false)}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent transition-[opacity,color] duration-150"
        style={{
          color: deleteHover ? "var(--figma-alert)" : "var(--figma-gray400)",
          opacity: hov ? 1 : 0,
        }}
      >
        <MaterialIcon name="delete" outlined size={17} />
      </button>
    </div>
  );
}

function formatSizeMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedAudioFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (ALLOWED_AUDIO_EXTS as readonly string[]).includes(ext);
}

function extractUploadedFileId(uploaded: unknown): string | null {
  if (!uploaded || typeof uploaded !== "object") return null;
  const row = uploaded as Partial<ProjectFile> & { file_id?: string };
  if (typeof row.id === "string" && row.id) return row.id;
  if (typeof row.file_id === "string" && row.file_id) return row.file_id;
  return null;
}

export function AudioTab({ projectId }: { projectId: string }) {
  const {
    audio: remoteAudio,
    createAudio,
    deleteAudio,
    isAuthOff,
  } = useConsultation(projectId);
  const [audioFiles, setAudioFiles] = useState<ConsultAudioFile[]>(remoteAudio);
  const [playing, setPlaying] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAudioFiles(remoteAudio);
  }, [remoteAudio]);

  const togglePlay = (id: string) => setPlaying((p) => (p === id ? null : id));

  const processFile = async (file: File) => {
    if (file.size > MAX_AUDIO_BYTES) {
      toast.error("File size exceeds 200MB limit.");
      return;
    }
    if (!isAllowedAudioFile(file)) {
      toast.error("Unsupported file type. Please upload MP3, M4A, or WAV.");
      return;
    }

    setIsUploading(true);
    try {
      let storageFileId = `local-${Date.now()}`;
      if (!isAuthOff) {
        // Ensure project folder tree exists before multipart initiate.
        await authApiClient(`/projects/${projectId}/folders`, {
          method: "POST",
        }).catch(() => undefined);

        const uploaded = await uploadFileMultipart({
          projectId,
          folderPath: CONSULTATION_AUDIO_FOLDER,
          file,
        });
        const fileId = extractUploadedFileId(uploaded);
        if (!fileId) {
          throw new Error("Upload succeeded but no file id was returned");
        }
        storageFileId = fileId;
      }

      const created = await createAudio({
        name: file.name,
        duration: "00:00",
        date: new Date().toISOString().slice(0, 10),
        size: formatSizeMb(file.size),
        storage_file_id: storageFileId,
      });

      if (created) {
        setAudioFiles((prev) =>
          prev.some((f) => f.id === created.id) ? prev : [created, ...prev],
        );
      }
      toast.success("Audio recording uploaded");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to upload audio recording");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = "";
  };

  const openPicker = () => {
    if (isUploading) return;
    fileRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav"
      />
      <SectionCard>
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!isUploading) setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isUploading) setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (isUploading) return;
            const file = e.dataTransfer.files?.[0];
            if (file) void processFile(file);
          }}
          className={`flex ${
            isUploading ? "cursor-wait opacity-70" : "cursor-pointer"
          } flex-col items-center gap-3 rounded-[14px] border-2 border-dashed px-8 py-9 transition-all duration-200 neu-inset`}
          style={{
            borderColor: dragOver ? "var(--figma-teal)" : "var(--figma-border)",
            background: dragOver ? "rgba(14,124,134,0.04)" : "var(--figma-gray50)",
          }}
        >
          <div
            className="flex size-[52px] items-center justify-center rounded-[14px] transition-colors duration-200"
            style={{
              background: dragOver ? "rgba(14,124,134,0.12)" : "var(--figma-gray100)",
            }}
          >
            <MaterialIcon
              name="mic"
              outlined
              size={28}
              className={dragOver ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
            />
          </div>
          <div className="text-center">
            <div className="mb-1 text-sm font-semibold text-[var(--figma-navy)]">
              {isUploading ? "Uploading..." : "Upload Audio Recording"}
            </div>
            <div className="text-xs text-[var(--figma-gray500)]">
              {isUploading
                ? "Please wait while your file is being uploaded."
                : "Drag & drop or click to browse · MP3, M4A, WAV up to 200 MB"}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle
          icon="library_music"
          title="Uploaded Recordings"
          right={
            <OutlineBtn
              label="Add Audio"
              icon="add"
              small
              onClick={openPicker}
            />
          }
        />
        <div className="flex flex-col gap-2.5">
          {audioFiles.length === 0 ? (
            <div className="py-4 text-center text-xs text-[var(--figma-gray400)]">
              No recordings uploaded yet.
            </div>
          ) : (
            audioFiles.map((file) => (
              <AudioRow
                key={file.id}
                file={file}
                isPlaying={playing === file.id}
                onPlay={() => togglePlay(file.id)}
                onDelete={() => {
                  setAudioFiles((p) => p.filter((f) => f.id !== file.id));
                  if (playing === file.id) setPlaying(null);
                  void deleteAudio(file.id).catch((err) => {
                    toast.error(getApiErrorMessage(err) || "Failed to delete recording");
                    setAudioFiles(remoteAudio);
                  });
                }}
              />
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
