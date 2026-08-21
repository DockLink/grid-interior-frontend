"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { ClientPresentationWidget } from "@/components/projects/hub/concept/concept-presentation-widget";
import { RevisionTrackerWidget } from "@/components/projects/hub/concept/concept-revision-widget";
import { StageTabToggle } from "@/components/projects/hub/concept/concept-ui";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-breadcrumb";
import {
  GradientBtn,
  SectionCard,
  SectionTitle,
} from "@/components/projects/hub/consultation/consultation-ui";
import { TimelineWidget } from "@/components/projects/hub/shared/timeline-widget";
import { CONCEPT_AREAS, CONCEPT_CARDS, CONCEPT_RENDER_GALLERY } from "@/lib/projects/mock-concept";
import { TEAM_MEMBERS } from "@/lib/projects/mock-projects";
import type { ConceptRenderImage } from "@/types/concept";

function RenderThumb({
  img,
  onClick,
  onDelete,
}: {
  img: ConceptRenderImage;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative cursor-pointer overflow-hidden rounded-xl bg-[var(--figma-gray100)] transition-all duration-[180ms]"
      style={{ boxShadow: hov ? "var(--neu-raised)" : "var(--neu-card)" }}
    >
      <div className="relative h-[150px] overflow-hidden">
        {img.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.caption}
            className="size-full object-cover transition-transform duration-300"
            style={{ transform: hov ? "scale(1.07)" : "scale(1)" }}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <MaterialIcon name="image" outlined size={30} className="text-[var(--figma-gray200)]" />
          </div>
        )}
        {hov && (
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-[rgba(27,42,74,0.35)]">
            <button
              type="button"
              onClick={onClick}
              className="flex size-[34px] cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(255,255,255,0.9)]"
            >
              <MaterialIcon name="open_in_full" outlined size={17} className="text-[var(--figma-navy)]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex size-[34px] cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(242,109,109,0.9)]"
            >
              <MaterialIcon name="delete" outlined size={17} className="text-white" />
            </button>
          </div>
        )}
      </div>
      {img.caption && (
        <div className="bg-white px-2.5 py-1.5">
          <span className="text-[10px] text-[var(--figma-gray500)]">{img.caption}</span>
        </div>
      )}
    </div>
  );
}

export function ConceptRenderScreen({
  conceptId,
  onBack,
  onSwitchToNonRender,
  onOpenWalkthrough,
}: {
  conceptId: number;
  onBack: () => void;
  onSwitchToNonRender: () => void;
  onOpenWalkthrough: () => void;
}) {
  const concept = CONCEPT_CARDS.find((c) => c.id === conceptId) ?? CONCEPT_CARDS[0];
  const area = CONCEPT_AREAS.find((a) => a.id === concept.areaId) ?? CONCEPT_AREAS[0];
  const [gallery, setGallery] = useState(CONCEPT_RENDER_GALLERY);
  const [finalUploaded, setFinalUploaded] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb items={["Concept Design", area.name, concept.name]} onBack={onBack} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-bold text-[var(--figma-navy)]">
          {concept.name} — {area.name}
        </h1>
        <StageTabToggle stage="render" setStage={(s) => s === "nonrender" && onSwitchToNonRender()} />
      </div>

      <SectionCard>
        <SectionTitle
          icon="photo_library"
          title="Render Gallery"
          right={
            <GradientBtn
              label="Upload Renders"
              icon="upload"
              small
              onClick={() => setGallery((p) => [...p, { id: Date.now(), url: "", caption: "New render" }])}
            />
          }
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
          {gallery.map((img, idx) => (
            <RenderThumb
              key={img.id}
              img={img}
              onClick={() => setLightbox(idx)}
              onDelete={() => setGallery((p) => p.filter((i) => i.id !== img.id))}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle
          icon="smart_display"
          title="Virtual Walkthrough"
          right={
            <button
              type="button"
              onClick={onOpenWalkthrough}
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-xs font-semibold text-[var(--figma-teal)]"
            >
              <MaterialIcon name="open_in_full" outlined size={15} />
              Expand
            </button>
          }
        />
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenWalkthrough}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenWalkthrough();
            }
          }}
          className="relative flex h-[200px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[14px] transition-opacity duration-150 hover:opacity-85"
          style={{ background: "linear-gradient(135deg, #0d1f38, #162d52)" }}
        >
          <svg
            className="absolute inset-0 size-full opacity-[0.08]"
            viewBox="0 0 700 200"
            preserveAspectRatio="none"
          >
            {[40, 80, 120, 160].map((y) => (
              <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="white" strokeWidth="0.5" />
            ))}
            {[70, 140, 210, 280, 350, 420, 490, 560, 630].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="white" strokeWidth="0.5" />
            ))}
          </svg>
          <div className="z-[1] flex size-[52px] items-center justify-center rounded-full border-2 border-[rgba(255,255,255,0.30)] bg-[rgba(255,255,255,0.12)]">
            <MaterialIcon name="play_arrow" size={26} className="ml-0.5 text-white" />
          </div>
          <span className="z-[1] text-[13px] font-medium text-[rgba(255,255,255,0.75)]">
            Click to open virtual walkthrough
          </span>
        </div>
      </SectionCard>

      <RevisionTrackerWidget />
      <ClientPresentationWidget />
      <TimelineWidget phase="Concept Design" initialDays="10" badgeVariant="teal" />
      <SectionCard className="px-5 py-4">
        <SectionTitle icon="group" title="Team Assignment" />
        <div className="flex flex-wrap items-center gap-2">
          {TEAM_MEMBERS.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-[7px] rounded-[20px] border-[1.5px] border-[var(--figma-border)] bg-[var(--figma-gray50)] py-1.5 pl-1.5 pr-3 neu-inset"
            >
              <div
                className="flex size-[26px] items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: member.color }}
              >
                {member.initials}
              </div>
              <span className="text-xs font-medium text-[var(--figma-navy)]">{member.name}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="verified" title="Final Confirmed Presentation" />
        {finalUploaded ? (
          <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#3FA66B] bg-[#DCFCE7] px-4 py-3.5">
            <MaterialIcon name="check_circle" size={22} className="text-[#3FA66B]" />
            <div>
              <div className="text-[13px] font-semibold text-[#3FA66B]">Final file uploaded</div>
              <div className="text-[11px] text-[var(--figma-gray500)]">
                Final_Concept1_Lobby_Confirmed.pdf · Uploaded 28 Jul 2026
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-3.5 text-[13px] text-[var(--figma-gray500)]">
              Upload the final confirmed presentation file after receiving client sign-off.
            </p>
            <GradientBtn
              label="Upload Final Confirmed Presentation"
              icon="upload_file"
              onClick={() => setFinalUploaded(true)}
            />
          </div>
        )}
      </SectionCard>

      {lightbox !== null && gallery[lightbox]?.url && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center backdrop-blur-md"
          style={{ background: "rgba(27,42,74,0.85)" }}
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[lightbox].url.replace("w=600&h=400", "w=1100&h=740")}
              alt={gallery[lightbox].caption}
              className="max-h-[80vh] max-w-[85vw] rounded-xl object-contain"
              style={{ boxShadow: "var(--neu-modal)" }}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-[rgba(0,0,0,0.55)] to-transparent px-4 pb-3 pt-4 text-xs font-medium text-white">
              {gallery[lightbox].caption}
            </div>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-2.5 top-2.5 flex size-8 cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(0,0,0,0.5)]"
            >
              <MaterialIcon name="close" outlined size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
