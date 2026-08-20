"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";

export function WalkthroughModal({
  onClose,
  projectName = "Marchetti Villa",
  variant = "threed",
}: {
  onClose: () => void;
  projectName?: string;
  variant?: "concept" | "threed";
}) {
  const phaseLabel = variant === "concept" ? "Concept Design Phase" : "3D Design Phase";
  const title = variant === "concept" ? "Concept Virtual Walkthrough" : "3D Virtual Walkthrough";
  const subtitle =
    variant === "concept"
      ? `${projectName} — Concept visualisation`
      : `${projectName} — Full visualisation`;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-8 backdrop-blur-sm"
      style={{ background: "rgba(27,42,74,0.30)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[860px] animate-[wtin_220ms_ease-out] rounded-[20px] bg-white px-8 py-7"
        style={{ boxShadow: "var(--neu-modal, 0 24px 48px rgba(27,42,74,0.18))" }}
      >
        <style>{`@keyframes wtin{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}`}</style>

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MaterialIcon name="smart_display" outlined size={22} className="text-[var(--figma-teal)]" />
            <div>
              <div className="text-base font-bold text-[var(--figma-navy)]">{title}</div>
              <div className="text-xs text-[var(--figma-gray500)]">{subtitle}</div>
            </div>
          </div>
          <CloseButton onClose={onClose} />
        </div>

        <div
          className="relative flex h-[460px] items-center justify-center overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #0d1f38, #162d52)",
            boxShadow: "var(--neu-card)",
          }}
        >
          <WalkthroughPreview projectName={projectName} variant={variant} large />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[var(--figma-navy)]">
            {projectName} · {phaseLabel}
          </span>
          <div className="flex gap-2">
            {(["download", "share"] as const).map((icon) => (
              <ActionIconButton key={icon} icon={icon} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WalkthroughCard({
  onExpand,
}: {
  onExpand: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="mb-5 rounded-2xl bg-white px-6 py-[22px]"
      style={{ boxShadow: "var(--neu-card)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MaterialIcon name="smart_display" outlined size={18} className="text-[var(--figma-teal)]" />
          <span className="text-[15px] font-bold tracking-tight text-[var(--figma-navy)]">
            Virtual Walkthrough
          </span>
        </div>
        <button
          type="button"
          onClick={onExpand}
          className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-xs font-semibold text-[var(--figma-teal)]"
        >
          <MaterialIcon name="open_in_full" outlined size={15} />
          Expand
        </button>
      </div>

      <div
        onClick={onExpand}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative flex h-[220px] cursor-pointer flex-col items-center justify-center gap-3.5 overflow-hidden rounded-[14px] transition-opacity duration-150"
        style={{
          background: "linear-gradient(135deg, #0d1f38, #162d52)",
          opacity: hover ? 0.88 : 1,
        }}
      >
        <WalkthroughPreview variant="threed" compact />
        <span className="z-[1] text-[13px] font-medium text-white/70">
          Click to open 3D walkthrough
        </span>
      </div>
    </div>
  );
}

function WalkthroughPreview({
  projectName = "Marchetti Villa",
  variant = "threed",
  large = false,
  compact = false,
}: {
  projectName?: string;
  variant?: "concept" | "threed";
  large?: boolean;
  compact?: boolean;
}) {
  const label =
    variant === "concept"
      ? `${projectName} — Concept Walkthrough`
      : `${projectName} — 3D Walkthrough`;

  return (
    <>
      <GridOverlay viewBox={large ? "0 0 800 460" : "0 0 700 220"} />
      {!compact && !large && <RoomSilhouette viewBox="0 0 700 220" />}
      <div className="z-[1] flex flex-col items-center gap-4">
        <PlayButton large={large} />
        {!compact && (
          <div className="text-center">
            <div className="text-[15px] font-semibold text-white/90">{label}</div>
            <div className="mt-1 text-xs text-white/45">
              Click to start the immersive 3D experience
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function GridOverlay({ viewBox }: { viewBox: string }) {
  const [, , w, h] = viewBox.split(" ").map(Number);
  const yLines = Array.from({ length: Math.floor(h / 44) }, (_, i) => (i + 1) * 44);
  const xLines = Array.from({ length: Math.floor(w / 70) }, (_, i) => (i + 1) * 70);

  return (
    <svg
      className="absolute inset-0 size-full opacity-[0.08]"
      viewBox={viewBox}
      preserveAspectRatio="none"
    >
      {yLines.map((y) => (
        <line key={`y-${y}`} x1="0" y1={y} x2={w} y2={y} stroke="white" strokeWidth="0.5" />
      ))}
      {xLines.map((x) => (
        <line key={`x-${x}`} x1={x} y1="0" x2={x} y2={h} stroke="white" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

function RoomSilhouette({ viewBox }: { viewBox: string }) {
  return (
    <svg
      className="absolute inset-0 size-full opacity-[0.12]"
      viewBox={viewBox}
      preserveAspectRatio="none"
    >
      <rect x="80" y="30" width="540" height="160" rx="4" stroke="white" strokeWidth="1.5" fill="none" />
      <line x1="80" y1="130" x2="300" y2="130" stroke="white" strokeWidth="1" />
      <line x1="300" y1="30" x2="300" y2="190" stroke="white" strokeWidth="1" />
      <rect x="110" y="50" width="60" height="60" stroke="white" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function PlayButton({ large }: { large?: boolean }) {
  const [hover, setHover] = useState(false);
  const size = large ? 72 : 60;

  return (
    <div
      className="z-[1] flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-200"
      style={{
        width: size,
        height: size,
        background: hover ? "rgba(14,124,134,0.45)" : "rgba(255,255,255,0.12)",
        border: "2px solid rgba(255,255,255,0.35)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <MaterialIcon
        name="play_arrow"
        size={large ? 32 : 28}
        className="ml-0.5 text-white"
      />
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClose}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex size-[34px] cursor-pointer items-center justify-center rounded-[9px] border-none transition-colors duration-150"
      style={{ background: hover ? "var(--figma-gray200)" : "var(--figma-gray100)" }}
    >
      <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
    </button>
  );
}

function ActionIconButton({ icon }: { icon: string }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex size-9 cursor-pointer items-center justify-center rounded-[9px] border-none transition-colors duration-150"
      style={{ background: hover ? "var(--figma-gray200)" : "var(--figma-gray100)" }}
    >
      <MaterialIcon name={icon} outlined size={18} className="text-[var(--figma-navy)]" />
    </button>
  );
}
