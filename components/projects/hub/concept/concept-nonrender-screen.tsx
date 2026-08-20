"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  OutlineBtn,
  PillSwitch,
  SectionCard,
  SectionTitle,
} from "@/components/projects/hub/consultation/consultation-ui";
import { ClientPresentationWidget } from "@/components/projects/hub/concept/concept-presentation-widget";
import { StageTabToggle } from "@/components/projects/hub/concept/concept-ui";
import { UploadDropzone } from "@/components/projects/hub/shared/upload-dropzone";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-breadcrumb";
import { CONCEPT_AREAS, CONCEPT_CARDS, CONCEPT_NONRENDER_FILES } from "@/lib/projects/mock-concept";
import type { ConceptNonRenderFile } from "@/types/concept";

function FileThumb({ file, onDelete }: { file: ConceptNonRenderFile; onDelete: () => void }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative overflow-hidden rounded-[10px] bg-[var(--figma-gray50)] transition-all duration-[180ms]"
      style={{ boxShadow: hov ? "var(--neu-raised)" : "var(--neu-card)" }}
    >
      <div className="relative h-24 overflow-hidden">
        {file.type === "img" && file.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.url} alt={file.name} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-[var(--figma-gray100)]">
            <MaterialIcon
              name={file.type === "pdf" ? "picture_as_pdf" : "insert_drive_file"}
              outlined
              size={28}
              className="text-[var(--figma-gray400)]"
            />
          </div>
        )}
        {hov && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[rgba(27,42,74,0.40)]">
            <button
              type="button"
              onClick={onDelete}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(242,109,109,0.9)]"
            >
              <MaterialIcon name="delete" outlined size={14} className="text-white" />
            </button>
          </div>
        )}
      </div>
      <div className="px-2 py-1.5">
        <div className="truncate text-[10px] font-medium text-[var(--figma-navy)]">{file.name}</div>
        <div className="text-[9px] text-[var(--figma-gray400)]">{file.size}</div>
      </div>
    </div>
  );
}

export function ConceptNonRenderScreen({
  conceptId,
  onBack,
  onSwitchToRender,
}: {
  conceptId: number;
  onBack: () => void;
  onSwitchToRender: () => void;
}) {
  const concept = CONCEPT_CARDS.find((c) => c.id === conceptId) ?? CONCEPT_CARDS[0];
  const area = CONCEPT_AREAS.find((a) => a.id === concept.areaId) ?? CONCEPT_AREAS[0];
  const [included, setIncluded] = useState(concept.nonRenderStatus === "included");
  const [files, setFiles] = useState(CONCEPT_NONRENDER_FILES);
  const [walkthroughLink, setWalkthroughLink] = useState("https://my.matterport.com/show/?m=XbKfNBKjnR9");
  const [linkFocused, setLinkFocused] = useState(false);

  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb items={["Concept Design", area.name, concept.name]} onBack={onBack} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold text-[var(--figma-navy)]">
            {concept.name} — {area.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PillSwitch on={included} setOn={setIncluded} label="Include Non-Render Stage" />
          <StageTabToggle stage="nonrender" setStage={(s) => s === "render" && onSwitchToRender()} />
        </div>
      </div>

      {!included ? (
        <SectionCard className="py-10 text-center">
          <MaterialIcon name="photo_library" outlined size={40} className="mb-3 block text-[var(--figma-gray200)]" />
          <div className="mb-1.5 text-sm font-semibold text-[var(--figma-navy)]">
            Non-render stage skipped for this concept
          </div>
          <div className="mb-5 text-[13px] text-[var(--figma-gray500)]">
            Enable the toggle above to include the non-render stage and upload design direction files.
          </div>
          <OutlineBtn label="Enable Non-Render Stage" icon="add" onClick={() => setIncluded(true)} />
        </SectionCard>
      ) : (
        <>
          <SectionCard>
            <SectionTitle
              icon="upload_file"
              title="Design Direction Files"
              right={
                <span className="text-[11px] text-[var(--figma-gray400)]">
                  {files.length} file{files.length !== 1 ? "s" : ""}
                </span>
              }
            />
            <UploadDropzone
              label="Upload Moodboards, Sketches, or References"
              onUpload={() => {
                setFiles((p) => [
                  ...p,
                  { id: Date.now(), name: "new_file.jpg", type: "img", size: "—", date: "Just now", url: "" },
                ]);
              }}
            />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
              {files.map((f) => (
                <FileThumb key={f.id} file={f} onDelete={() => setFiles((p) => p.filter((x) => x.id !== f.id))} />
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle icon="smart_display" title="Virtual Walkthrough Link" />
            <div className="relative">
              <MaterialIcon
                name="link"
                outlined
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: linkFocused ? "var(--figma-teal)" : "var(--figma-gray400)" }}
              />
              <input
                value={walkthroughLink}
                onChange={(e) => setWalkthroughLink(e.target.value)}
                onFocus={() => setLinkFocused(true)}
                onBlur={() => setLinkFocused(false)}
                placeholder="Paste virtual walkthrough URL…"
                className="box-border w-full rounded-[10px] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[var(--figma-navy)] outline-none transition-all duration-150"
                style={{
                  border: linkFocused ? "2px solid var(--figma-teal)" : "1.5px solid var(--figma-border)",
                  boxShadow: linkFocused
                    ? "var(--neu-inset), 0 0 0 3px rgba(14,124,134,0.08)"
                    : "var(--neu-inset)",
                }}
              />
            </div>
          </SectionCard>

          <ClientPresentationWidget />
        </>
      )}
    </div>
  );
}
