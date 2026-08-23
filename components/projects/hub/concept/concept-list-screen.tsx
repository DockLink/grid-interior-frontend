"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { GradientBtn, OutlineBtn } from "@/components/projects/hub/consultation/consultation-ui";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-breadcrumb";
import { CONCEPT_AREAS, CONCEPT_CARDS } from "@/lib/projects/mock-concept";
import type { ConceptCard, ConceptStage, NonRenderStatus, RenderStatus } from "@/types/concept";

const NR_LABELS: Record<NonRenderStatus, { label: string; color: string; bg: string }> = {
  included: { label: "Included", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)" },
  skipped: { label: "Skipped", color: "var(--figma-gray400)", bg: "var(--figma-gray100)" },
};

const R_LABELS: Record<RenderStatus, { label: string; color: string; bg: string }> = {
  "not-started": { label: "Not Started", color: "var(--figma-gray400)", bg: "var(--figma-gray100)" },
  "in-progress": { label: "In Progress", color: "#D97706", bg: "#FEF3C7" },
  complete: { label: "Complete", color: "#3FA66B", bg: "#DCFCE7" },
};

function ConceptCardItem({
  concept,
  nr,
  r,
  onSelectNR,
  onSelectR,
}: {
  concept: ConceptCard;
  nr: { label: string; color: string; bg: string };
  r: { label: string; color: string; bg: string };
  onSelectNR: () => void;
  onSelectR: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="overflow-hidden rounded-2xl bg-white transition-all duration-[220ms]"
      style={{
        boxShadow: hov ? "var(--neu-card-hover)" : "var(--neu-card)",
        transform: hov ? "translateY(-3px)" : "none",
      }}
    >
      <div className="relative h-40 overflow-hidden bg-[var(--figma-gray100)]">
        {concept.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={concept.thumb}
            alt={concept.name}
            className="size-full object-cover transition-transform duration-[350ms]"
            style={{ transform: hov ? "scale(1.05)" : "scale(1)" }}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <MaterialIcon name="image" outlined size={32} className="text-[var(--figma-gray200)]" />
            <span className="text-[11px] text-[var(--figma-gray400)]">No preview yet</span>
          </div>
        )}
        <div
          className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full"
          style={{
            background: concept.confirmStatus === "confirmed" ? "#DCFCE7" : "rgba(255,255,255,0.90)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <MaterialIcon
            name={concept.confirmStatus === "confirmed" ? "check_circle" : "schedule"}
            size={16}
            className={concept.confirmStatus === "confirmed" ? "text-[#3FA66B]" : "text-[var(--figma-gray400)]"}
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="mb-2.5 text-[15px] font-bold text-[var(--figma-navy)]">{concept.name}</div>
        <div className="mb-3.5 flex flex-wrap gap-2">
          <span
            className="flex items-center gap-1 rounded-[10px] px-2.5 py-[3px] text-[10px] font-semibold"
            style={{ color: nr.color, background: nr.bg }}
          >
            <MaterialIcon name="photo_library" outlined size={11} />
            Non-Render: {nr.label}
          </span>
          <span
            className="flex items-center gap-1 rounded-[10px] px-2.5 py-[3px] text-[10px] font-semibold"
            style={{ color: r.color, background: r.bg }}
          >
            <MaterialIcon name="view_in_ar" outlined size={11} />
            Render: {r.label}
          </span>
        </div>
        <div className="flex gap-2">
          <OutlineBtn label="Non-Render" icon="photo_library" onClick={onSelectNR} small color="var(--figma-gray500)" />
          <GradientBtn label="Render" icon="view_in_ar" onClick={onSelectR} small />
        </div>
      </div>
    </div>
  );
}

export function ConceptListScreen({
  areaId,
  onSelectConcept,
  onBack,
}: {
  areaId: number;
  onSelectConcept: (id: number, stage: ConceptStage) => void;
  onBack: () => void;
}) {
  const area = CONCEPT_AREAS.find((a) => a.id === areaId) ?? CONCEPT_AREAS[0];
  const concepts = CONCEPT_CARDS.filter((c) => c.areaId === areaId);

  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb items={["Concept Design", area.name]} onBack={onBack} />
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-[26px] font-bold text-[var(--figma-navy)]">{area.name}</h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
            {concepts.length} concept{concepts.length !== 1 ? "s" : ""} for this area
          </p>
        </div>
        <GradientBtn label="Add Concept" icon="add" onClick={() => {}} />
      </div>

      {concepts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-12 py-[60px]">
          <MaterialIcon name="image_not_supported" outlined size={48} className="text-[var(--figma-gray200)]" />
          <div className="text-center">
            <div className="mb-1 text-[15px] font-semibold text-[var(--figma-navy)]">No concepts yet</div>
            <div className="text-[13px] text-[var(--figma-gray500)]">Add the first concept for {area.name}.</div>
          </div>
          <GradientBtn label="Add Concept" icon="add" onClick={() => {}} />
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {concepts.map((c) => {
            const nr = NR_LABELS[c.nonRenderStatus];
            const r = R_LABELS[c.renderStatus];
            return (
              <ConceptCardItem
                key={c.id}
                concept={c}
                nr={nr}
                r={r}
                onSelectNR={() => onSelectConcept(c.id, "nonrender")}
                onSelectR={() => onSelectConcept(c.id, "render")}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
