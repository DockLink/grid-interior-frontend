"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { SAMPLE_AUDIO } from "@/lib/projects/mock-consultation";
import type { ConsultAudioFile } from "@/types/consultation";

import { OutlineBtn, SectionCard, SectionTitle } from "./consultation-ui";

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
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none transition-all duration-[180ms]"
        style={{
          background: isPlaying ? "var(--figma-teal)" : "rgba(14,124,134,0.10)",
          boxShadow: isPlaying ? "var(--neu-raised)" : "none",
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

export function AudioTab() {
  const [audioFiles, setAudioFiles] = useState<ConsultAudioFile[]>(SAMPLE_AUDIO);
  const [playing, setPlaying] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const togglePlay = (id: number) => setPlaying((p) => (p === id ? null : id));

  return (
    <div>
      <SectionCard>
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            setAudioFiles((p) => [
              ...p,
              {
                id: Date.now(),
                name: "new_recording.m4a",
                duration: "00:00",
                date: "Just now",
                size: "—",
              },
            ]);
          }}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-[14px] border-2 border-dashed px-8 py-9 transition-all duration-200 neu-inset"
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
            <div className="mb-1 text-sm font-semibold text-[var(--figma-navy)]">Upload Audio Recording</div>
            <div className="text-xs text-[var(--figma-gray500)]">
              Drag & drop or click to browse · MP3, M4A, WAV up to 200 MB
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
              onClick={() =>
                setAudioFiles((p) => [
                  ...p,
                  { id: Date.now(), name: "recording.m4a", duration: "00:00", date: "Just now", size: "—" },
                ])
              }
            />
          }
        />
        <div className="flex flex-col gap-2.5">
          {audioFiles.map((file) => (
            <AudioRow
              key={file.id}
              file={file}
              isPlaying={playing === file.id}
              onPlay={() => togglePlay(file.id)}
              onDelete={() => setAudioFiles((p) => p.filter((f) => f.id !== file.id))}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
