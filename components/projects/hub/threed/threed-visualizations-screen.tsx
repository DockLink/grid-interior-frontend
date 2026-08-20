"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { ClientConfirmationWidget } from "@/components/projects/hub/shared/client-confirmation-widget";
import { TimelineWidget } from "@/components/projects/hub/shared/timeline-widget";
import { WalkthroughCard, WalkthroughModal } from "@/components/projects/hub/shared/walkthrough-modal";
import {
  AreaTabs,
  GradientBtn,
  SectionCard,
  SectionTitle,
  WorkspaceBreadcrumb,
} from "@/components/projects/hub/shared/workspace-ui";
import { THREED_AREAS, THREED_RENDER_GALLERY } from "@/lib/projects/mock-threed";
import type { ActiveProjectView } from "@/types/project-hub";
import type { ThreeDRenderImage } from "@/types/threed";

function RenderThumb({
  img,
  onClick,
  onDelete,
}: {
  img: ThreeDRenderImage;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative cursor-pointer overflow-hidden rounded-[14px] bg-[var(--figma-gray100)] transition-all duration-[180ms]"
      style={{ boxShadow: hover ? "var(--neu-raised)" : "var(--neu-card)" }}
    >
      <div className="relative h-[170px] overflow-hidden">
        {img.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.caption}
            className="size-full object-cover transition-transform duration-300"
            style={{ transform: hover ? "scale(1.07)" : "scale(1)" }}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <MaterialIcon name="image" outlined size={32} className="text-[var(--figma-gray200)]" />
          </div>
        )}
        {hover && (
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-[rgba(27,42,74,0.35)]">
            <button
              type="button"
              onClick={onClick}
              className="flex size-[34px] cursor-pointer items-center justify-center rounded-full border-none bg-white/90"
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
        <div className="bg-white px-2.5 py-[7px]">
          <span className="text-[10px] text-[var(--figma-gray500)]">{img.caption}</span>
        </div>
      )}
    </div>
  );
}

export function ThreeDVisualizationsScreen({
  project,
  onBack,
}: {
  project: ActiveProjectView;
  onBack: () => void;
}) {
  const [activeArea, setActiveArea] = useState(1);
  const [gallery, setGallery] = useState(THREED_RENDER_GALLERY);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [finalUploaded, setFinalUploaded] = useState(false);

  const area = THREED_AREAS.find((a) => a.id === activeArea)!;
  const shortName = project.name.split(" ")[0] ?? project.name;

  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb
        items={["Projects", project.name, "3D Design"]}
        onBack={onBack}
      />

      <div className="mb-6">
        <h1 className="mb-1 text-[28px] font-bold text-[var(--figma-navy)]">3D Design</h1>
        <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
          Full visualisation of the confirmed layout · Upload renders and virtual walkthrough per area
        </p>
      </div>

      <AreaTabs areas={THREED_AREAS} activeId={activeArea} setActiveId={setActiveArea} />

      <SectionCard>
        <SectionTitle
          icon="photo_library"
          title={`${area.name} — 3D Renders`}
          right={
            <GradientBtn
              label="Upload Renders"
              icon="upload"
              small
              onClick={() =>
                setGallery((prev) => [...prev, { id: Date.now(), url: "", caption: "New render" }])
              }
            />
          }
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5">
          {gallery.map((img, idx) => (
            <RenderThumb
              key={img.id}
              img={img}
              onClick={() => setLightbox(idx)}
              onDelete={() => setGallery((prev) => prev.filter((i) => i.id !== img.id))}
            />
          ))}
        </div>
      </SectionCard>

      <WalkthroughCard onExpand={() => setShowWalkthrough(true)} />

      <TimelineWidget
        phase="3D Design"
        initialDays="14"
        startDate="11 Aug 2026"
        startDateIso="2026-08-11"
        badgeVariant="teal"
      />

      <SectionCard>
        <SectionTitle icon="verified" title="Final 3D Files" />
        {finalUploaded ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#3FA66B] bg-[#DCFCE7] px-[18px] py-3">
              <MaterialIcon name="task_alt" size={20} className="text-[#3FA66B]" />
              <div>
                <div className="text-[13px] font-semibold text-[#3FA66B]">Final files uploaded</div>
                <div className="text-[11px] text-[var(--figma-gray500)]">
                  3D_{shortName}_Final.zip · 3 files · 47.2 MB · 29 Jul 2026
                </div>
              </div>
            </div>
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-0 text-xs text-[var(--figma-teal)] underline"
            >
              Replace files
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-[13px] text-[var(--figma-gray500)]">
              Upload the final 3D model files (OBJ, FBX, MAX, or packaged renders) after the walkthrough is approved.
            </p>
            <GradientBtn label="Upload Final Files" icon="upload_file" onClick={() => setFinalUploaded(true)} />
          </div>
        )}
      </SectionCard>

      <ClientConfirmationWidget
        phase="3D Design"
        nextPhase="Detail Drawings"
        defaultFeedback="Client approved the 3D renders and walkthrough. Minor lighting adjustment requested for the lobby east view."
      />

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
              style={{ boxShadow: "var(--neu-modal, 0 24px 48px rgba(27,42,74,0.18))" }}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-4 text-xs font-medium text-white">
              {gallery[lightbox].caption}
            </div>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-2.5 top-2.5 flex size-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/50"
            >
              <MaterialIcon name="close" outlined size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {showWalkthrough && (
        <WalkthroughModal
          onClose={() => setShowWalkthrough(false)}
          projectName={shortName}
          variant="threed"
        />
      )}
    </div>
  );
}
