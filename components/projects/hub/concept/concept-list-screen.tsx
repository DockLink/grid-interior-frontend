"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { GradientBtn, OutlineBtn } from "@/components/projects/hub/consultation/consultation-ui";
import { UploadDropzone } from "@/components/projects/hub/shared/upload-dropzone";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-breadcrumb";
import { CONCEPT_AREAS, CONCEPT_CARDS } from "@/lib/projects/mock-concept";
import type { ConceptCard } from "@/types/concept";
import { MAX_CONCEPTS_PER_AREA } from "@/types/concept";

const SAMPLE_THUMBS = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=280&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=280&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=280&fit=crop&auto=format",
];

function ConceptCardItem({
  concept,
  onFinalize,
}: {
  concept: ConceptCard;
  onFinalize: () => void;
}) {
  const [hov, setHov] = useState(false);
  const isFinalized = concept.confirmStatus === "confirmed";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="overflow-hidden rounded-2xl bg-white transition-all duration-[220ms]"
      style={{
        boxShadow: isFinalized
          ? "0 0 0 2px var(--figma-teal), var(--neu-card-hover)"
          : hov
            ? "var(--neu-card-hover)"
            : "var(--neu-card)",
        transform: hov ? "translateY(-3px)" : "none",
        opacity: isFinalized ? 1 : 0.92,
      }}
    >
      <div className="relative h-40 overflow-hidden bg-[var(--figma-gray100)]">
        {concept.fileType === "jpg" && concept.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={concept.thumb}
            alt={concept.name}
            className="size-full object-cover transition-transform duration-[350ms]"
            style={{ transform: hov ? "scale(1.05)" : "scale(1)" }}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <MaterialIcon
              name={concept.fileType === "pdf" ? "picture_as_pdf" : "image"}
              outlined
              size={36}
              className={concept.fileType === "pdf" ? "text-[#E53935]" : "text-[var(--figma-gray200)]"}
            />
            <span className="text-[11px] text-[var(--figma-gray400)]">
              {concept.fileType === "pdf" ? "PDF concept" : "No preview"}
            </span>
          </div>
        )}

        {isFinalized && (
          <div
            className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-[10px] px-2.5 py-1 text-[10px] font-bold text-white"
            style={{ background: "var(--figma-teal)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
          >
            <MaterialIcon name="check_circle" size={12} className="text-white" />
            Finalized
          </div>
        )}

        <div
          className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full"
          style={{
            background: isFinalized ? "#DCFCE7" : "rgba(255,255,255,0.90)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <MaterialIcon
            name={isFinalized ? "check_circle" : "schedule"}
            size={16}
            className={isFinalized ? "text-[#3FA66B]" : "text-[var(--figma-gray400)]"}
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="mb-1 text-[15px] font-bold text-[var(--figma-navy)]">{concept.name}</div>
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <span className="rounded-[10px] bg-[var(--figma-gray100)] px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-wide text-[var(--figma-gray500)]">
            {concept.fileType}
          </span>
          <span className="truncate text-[11px] text-[var(--figma-gray500)]">{concept.fileName}</span>
          <span className="text-[11px] text-[var(--figma-gray400)]">· {concept.fileSize}</span>
        </div>
        {isFinalized ? (
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--figma-teal)]">
            <MaterialIcon name="verified" size={16} className="text-[var(--figma-teal)]" />
            Client&apos;s finalized option
          </div>
        ) : (
          <OutlineBtn label="Mark as finalized" icon="check_circle" onClick={onFinalize} small color="var(--figma-teal)" />
        )}
      </div>
    </div>
  );
}

export function ConceptListScreen({
  areaId,
  onBack,
}: {
  areaId: number;
  onBack: () => void;
}) {
  const area = CONCEPT_AREAS.find((a) => a.id === areaId) ?? CONCEPT_AREAS[0];
  const [concepts, setConcepts] = useState(() => CONCEPT_CARDS.filter((c) => c.areaId === areaId));
  const [showUpload, setShowUpload] = useState(false);

  const atCap = concepts.length >= MAX_CONCEPTS_PER_AREA;

  const handleFinalize = (id: number) => {
    setConcepts((prev) =>
      prev.map((c) => ({
        ...c,
        confirmStatus: c.id === id ? "confirmed" : "pending",
      })),
    );
  };

  const handleUpload = () => {
    if (atCap) return;
    const nextIndex = concepts.length + 1;
    const isPdf = nextIndex % 3 === 0;
    const newConcept: ConceptCard = {
      id: Date.now(),
      name: `Concept ${nextIndex}`,
      areaId,
      fileName: isPdf ? `Concept_${area.name.replace(/\s+/g, "_")}_${nextIndex}.pdf` : `Concept_${area.name.replace(/\s+/g, "_")}_${nextIndex}.jpg`,
      fileType: isPdf ? "pdf" : "jpg",
      fileSize: isPdf ? "2.8 MB" : "1.6 MB",
      thumb: isPdf ? "" : SAMPLE_THUMBS[(nextIndex - 1) % SAMPLE_THUMBS.length],
      confirmStatus: "pending",
    };
    setConcepts((prev) => [...prev, newConcept]);
    setShowUpload(false);
  };

  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb items={["Concept Design", area.name]} onBack={onBack} />
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[26px] font-bold text-[var(--figma-navy)]">{area.name}</h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
            Up to {MAX_CONCEPTS_PER_AREA} options · showcase the client&apos;s finalized concept
          </p>
        </div>
        {!atCap && (
          <GradientBtn
            label="Add Concept"
            icon="add"
            onClick={() => setShowUpload((v) => !v)}
          />
        )}
      </div>

      {showUpload && !atCap && (
        <div className="mb-6 rounded-2xl bg-white p-5" style={{ boxShadow: "var(--neu-card)" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-semibold text-[var(--figma-navy)]">
              Upload concept option ({concepts.length}/{MAX_CONCEPTS_PER_AREA})
            </div>
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="cursor-pointer border-none bg-transparent p-1 text-[var(--figma-gray400)]"
            >
              <MaterialIcon name="close" size={18} />
            </button>
          </div>
          <UploadDropzone
            label="Upload concept file"
            hint="Drag & drop or click to browse · JPG, PDF"
            onUpload={handleUpload}
            className="mb-0"
          />
        </div>
      )}

      {concepts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-12 py-[60px]">
          <MaterialIcon name="image_not_supported" outlined size={48} className="text-[var(--figma-gray200)]" />
          <div className="text-center">
            <div className="mb-1 text-[15px] font-semibold text-[var(--figma-navy)]">No concepts yet</div>
            <div className="text-[13px] text-[var(--figma-gray500)]">
              Upload up to {MAX_CONCEPTS_PER_AREA} JPG or PDF options for {area.name}.
            </div>
          </div>
          <GradientBtn label="Add Concept" icon="add" onClick={() => setShowUpload(true)} />
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {concepts.map((c) => (
            <ConceptCardItem key={c.id} concept={c} onFinalize={() => handleFinalize(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
