"use client";

import Link from "next/link";
import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  getHistoricalGallery,
  getHistoricalProject,
} from "@/lib/projects/mock-projects";
import type { HistoricalGalleryItem } from "@/types/project-hub";
import { NAV_ROUTES } from "@/types/navigation";

function GalleryItem({
  img,
  onClick,
}: {
  img: HistoricalGalleryItem;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer overflow-hidden rounded-xl bg-[var(--figma-gray100)] transition-all duration-220"
      style={{
        boxShadow: hover ? "var(--neu-card-hover)" : "var(--neu-card)",
        transform: hover ? "translateY(-3px)" : "none",
      }}
    >
      <div className="relative h-[180px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt={img.alt}
          className="size-full object-cover transition-transform duration-350"
          style={{ transform: hover ? "scale(1.07)" : "scale(1)" }}
        />
        {hover && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(27,42,74,0.30)]">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/95">
              <MaterialIcon name="open_in_full" outlined size={20} className="text-[var(--figma-navy)]" />
            </div>
          </div>
        )}
      </div>
      <div className="bg-white px-3 pt-2 pb-2.5">
        <span className="text-xs text-[var(--figma-gray500)]">{img.caption}</span>
      </div>
    </div>
  );
}

export function HistoricalProjectDetail({ projectId }: { projectId: string }) {
  const project = getHistoricalProject(projectId);
  const gallery = getHistoricalGallery(projectId);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!project) {
    return (
      <div className="px-10 py-8 text-[var(--figma-alert)]">
        Historical project not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] px-10 py-8">
      <Link
        href={`${NAV_ROUTES.projects}?tab=historical`}
        className="mb-6 flex items-center gap-1.5 text-[13px] text-[var(--figma-gray500)] no-underline transition-colors hover:text-[var(--figma-teal)]"
      >
        <MaterialIcon name="arrow_back" outlined size={18} />
        Back to Historical Projects
      </Link>

      <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="m-0 mb-1.5 text-[28px] font-bold text-[var(--figma-navy)]">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-[var(--figma-teal)]">{project.clientName}</span>
            <span className="text-[var(--figma-border)]">·</span>
            <span className="text-[13px] text-[var(--figma-gray500)]">
              {project.startDate} — {project.completionDate}
            </span>
            <span className="text-[var(--figma-border)]">·</span>
            <span className="inline-flex items-center gap-1 rounded-[20px] bg-[#E0F2FE] px-3 py-0.5 text-[11px] font-semibold text-[#0284C7]">
              <MaterialIcon name="category" outlined size={12} />
              {project.type}
            </span>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[20px] bg-[#DCFCE7] px-4 py-2 text-xs font-semibold text-[#3FA66B] neu-raised">
          <MaterialIcon name="done_all" size={15} />
          Completed
        </span>
      </div>

      <div className="neu-card mb-8 rounded-2xl bg-white px-6 py-5">
        <div className="mb-2.5 flex items-center gap-2">
          <MaterialIcon name="article" outlined size={18} className="text-[var(--figma-teal)]" />
          <span className="text-sm font-semibold text-[var(--figma-navy)]">Project Overview</span>
        </div>
        <p className="m-0 text-sm leading-relaxed text-[var(--figma-gray500)]">{project.description}</p>
      </div>

      <div className="mb-2">
        <div className="mb-4 flex items-center gap-2">
          <MaterialIcon name="photo_library" outlined size={18} className="text-[var(--figma-teal)]" />
          <span className="text-base font-semibold text-[var(--figma-navy)]">Project Gallery</span>
          <span className="ml-1 rounded-[10px] bg-[var(--figma-gray100)] px-2 py-0.5 text-[11px] text-[var(--figma-gray500)]">
            {gallery.length} photos
          </span>
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
        >
          {gallery.map((img, idx) => (
            <GalleryItem key={idx} img={img} onClick={() => setLightboxIdx(idx)} />
          ))}
        </div>
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center backdrop-blur-md"
          style={{ background: "rgba(27,42,74,0.88)" }}
          onClick={() => setLightboxIdx(null)}
        >
          <div className="relative max-h-[85vh] max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[lightboxIdx].url.replace("w=700&h=500", "w=1200&h=800")}
              alt={gallery[lightboxIdx].alt}
              className="max-h-[80vh] max-w-[85vw] rounded-xl object-contain"
              style={{ boxShadow: "var(--neu-modal)" }}
            />
            <div className="absolute right-0 bottom-0 left-0 rounded-b-xl bg-gradient-to-t from-black/60 to-transparent px-5 pt-5 pb-4 text-[13px] font-medium text-white">
              {gallery[lightboxIdx].caption}
            </div>
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              className="absolute top-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-full border-none bg-black/50"
            >
              <MaterialIcon name="close" outlined size={18} className="text-white" />
            </button>
            {lightboxIdx > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIdx(lightboxIdx - 1)}
                className="absolute top-1/2 -left-[52px] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-white/15"
              >
                <MaterialIcon name="chevron_left" outlined size={22} className="text-white" />
              </button>
            )}
            {lightboxIdx < gallery.length - 1 && (
              <button
                type="button"
                onClick={() => setLightboxIdx(lightboxIdx + 1)}
                className="absolute top-1/2 -right-[52px] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-white/15"
              >
                <MaterialIcon name="chevron_right" outlined size={22} className="text-white" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
