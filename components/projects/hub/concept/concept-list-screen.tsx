"use client";

import { useEffect, useMemo, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { GradientBtn, OutlineBtn } from "@/components/projects/hub/consultation/consultation-ui";
import { UploadDropzone } from "@/components/projects/hub/shared/upload-dropzone";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-breadcrumb";
import { useConcept } from "@/hooks/use-concept";
import { useProjectFiles } from "@/hooks/use-project-files";
import { formatFileSize } from "@/lib/files/format";
import { resolveConceptsFolder } from "@/lib/files/resolve-folder";
import type { ConceptCard, ConceptFileType } from "@/types/concept";
import { MAX_CONCEPTS_PER_AREA } from "@/types/concept";
import type { ProjectFile } from "@/types/files";

const CONCEPT_ACCEPT = ".jpg,.jpeg,.pdf,image/jpeg,application/pdf";

function extractUploadedFileId(uploaded: unknown): string | null {
  if (!uploaded || typeof uploaded !== "object") return null;
  const row = uploaded as Partial<ProjectFile> & { file_id?: string };
  if (typeof row.id === "string" && row.id) return row.id;
  if (typeof row.file_id === "string" && row.file_id) return row.file_id;
  return null;
}

function conceptFileTypeFromFile(file: File): ConceptFileType | null {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  if (name.endsWith(".pdf") || mime === "application/pdf") return "pdf";
  if (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    mime === "image/jpeg"
  ) {
    return "jpg";
  }
  return null;
}

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
          <OutlineBtn
            label="Mark as finalized"
            icon="check_circle"
            onClick={onFinalize}
            small
            color="var(--figma-teal)"
          />
        )}
      </div>
    </div>
  );
}

export function ConceptListScreen({
  projectId,
  areaId,
  onBack,
}: {
  projectId: string;
  areaId: string;
  onBack: () => void;
}) {
  const {
    areas,
    cards,
    createCard,
    confirmCard,
    isAuthOff,
  } = useConcept(projectId);
  const { folderTree, uploadFile, getDownloadUrl } = useProjectFiles(projectId);
  const conceptsFolder = useMemo(
    () => resolveConceptsFolder(folderTree),
    [folderTree],
  );
  const area = areas.find((a) => a.id === areaId) ?? areas[0] ?? {
    id: areaId,
    name: "Area",
    icon: "door_front",
    conceptCount: 0,
  };
  const remoteConcepts = cards.filter((c) => c.areaId === areaId);
  const [concepts, setConcepts] = useState(remoteConcepts);
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setConcepts(remoteConcepts);
  }, [remoteConcepts]);

  const atCap = concepts.length >= MAX_CONCEPTS_PER_AREA;

  const handleFinalize = (id: string) => {
    const previous = concepts;
    setConcepts((prev) =>
      prev.map((c) => ({
        ...c,
        confirmStatus: c.id === id ? "confirmed" : "pending",
      })),
    );
    setActionError(null);
    void (async () => {
      try {
        await confirmCard(id, "confirmed");
        for (const c of previous) {
          if (c.id !== id && c.confirmStatus === "confirmed") {
            await confirmCard(c.id, "pending");
          }
        }
      } catch (err: unknown) {
        setConcepts(previous);
        setActionError(
          err instanceof Error ? err.message : "Failed to finalize concept",
        );
      }
    })();
  };

  const handleUpload = async (files: File[]) => {
    const file = files[0];
    if (!file || atCap || isUploading) return;

    const fileType = conceptFileTypeFromFile(file);
    if (!fileType) {
      setActionError("Only JPG and PDF files are supported.");
      return;
    }

    const nextIndex = concepts.length + 1;
    const thumbUrl =
      fileType === "jpg" ? URL.createObjectURL(file) : "";
    const payloadBase = {
      name: `Concept ${nextIndex}`,
      file_name: file.name,
      file_type: fileType,
      file_size: formatFileSize(file.size),
      thumb_url: thumbUrl,
    };

    setActionError(null);
    setIsUploading(true);
    try {
      let fileId: string | null = null;
      let resolvedThumb = thumbUrl;

      if (!isAuthOff) {
        const folderPath = conceptsFolder?.path;
        if (!folderPath) {
          throw new Error(
            "Concepts folder not found. Provision project folders first.",
          );
        }
        const uploaded = await uploadFile(folderPath, file);
        fileId = extractUploadedFileId(uploaded);
        if (!fileId) {
          throw new Error("Upload succeeded but no file id was returned");
        }
        if (fileType === "jpg") {
          try {
            resolvedThumb = await getDownloadUrl(fileId);
          } catch {
            // Keep object URL preview if download URL is unavailable.
          }
        }
      }

      const created = await createCard(areaId, {
        ...payloadBase,
        thumb_url: resolvedThumb || null,
        file_id: fileId,
      });
      if (created) setConcepts((prev) => [...prev, created]);
      setShowUpload(false);
    } catch (err: unknown) {
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
      setActionError(
        err instanceof Error ? err.message : "Failed to add concept",
      );
    } finally {
      setIsUploading(false);
    }
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

      {actionError ? (
        <div className="mb-4 text-[13px] font-medium text-[var(--figma-alert)]">
          {actionError}
        </div>
      ) : null}

      {showUpload && !atCap && (
        <div className="mb-6 rounded-2xl bg-white p-5" style={{ boxShadow: "var(--neu-card)" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-semibold text-[var(--figma-navy)]">
              Upload concept option ({concepts.length}/{MAX_CONCEPTS_PER_AREA})
            </div>
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              disabled={isUploading}
              className="cursor-pointer border-none bg-transparent p-1 text-[var(--figma-gray400)] disabled:opacity-50"
            >
              <MaterialIcon name="close" size={18} />
            </button>
          </div>
          <UploadDropzone
            label={isUploading ? "Uploading…" : "Upload concept file"}
            hint="Drag & drop or click to browse · JPG, PDF"
            accept={CONCEPT_ACCEPT}
            multiple={false}
            disabled={isUploading}
            onFiles={(files) => void handleUpload(files)}
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
