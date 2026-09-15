"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { GradientBtn, OutlineBtn, SectionCard } from "@/components/projects/hub/consultation/consultation-ui";
import { useProjectFiles } from "@/hooks/use-project-files";
import { useDetailCategories } from "@/hooks/use-detail-categories";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  drawingTypeFromFile,
  formatFileDate,
  formatFileSize,
} from "@/lib/files/map-project-file";
import { resolveDetailedDrawingsFolder } from "@/lib/files/resolve-folder";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import type { DetailCategory, DetailCategoryId, DetailDrawingFile } from "@/types/detail";
import type { ActiveProjectView } from "@/types/project-hub";
import type { ProjectFile, ProjectFolderNode } from "@/types/files";

const TYPE_CONFIG = {
  pdf: { icon: "picture_as_pdf", color: "#EF4444", bg: "#FEE2E2", label: "PDF" },
  dwg: { icon: "architecture", color: "var(--figma-navy)", bg: "var(--figma-gray100)", label: "DWG" },
  img: { icon: "image", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)", label: "IMG" },
} as const;

const CATEGORY_FOLDER_ALIASES: Record<DetailCategoryId, string[]> = {
  electrical: ["electrical"],
  flooring: ["flooring"],
  ceiling: ["ceiling"],
  walls: ["walls", "doors", "windows"],
  furniture: ["furniture", "ff&e", "ffe"],
  interior: ["interior", "elements"],
};

function matchCategoryFolder(
  detailed: ProjectFolderNode | null,
  categoryId: DetailCategoryId,
  label: string,
): string | null {
  if (!detailed) return null;
  const aliases = [
    ...CATEGORY_FOLDER_ALIASES[categoryId],
    label.toLowerCase().split(",")[0]?.trim() ?? "",
  ].filter(Boolean);
  const children = detailed.children ?? [];
  const match = children.find((child) => {
    const name = child.name.replace(/^\d+(\.\d+)*\s+/, "").toLowerCase();
    return aliases.some((a) => name.includes(a));
  });
  return match?.path ?? detailed.path;
}

function mapProjectFileToDetail(file: ProjectFile): DetailDrawingFile {
  return {
    id: file.id,
    name: file.fileName,
    type: drawingTypeFromFile(file),
    size: formatFileSize(file.fileSize),
    date: formatFileDate(file.created_at),
    fileId: file.id,
  };
}

function FileCard({
  file,
  cfg,
  onDelete,
  onOpen,
}: {
  file: DetailDrawingFile;
  cfg: (typeof TYPE_CONFIG)[keyof typeof TYPE_CONFIG];
  onDelete: () => void;
  onOpen?: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="overflow-hidden rounded-[14px] bg-white transition-all duration-200"
      style={{
        boxShadow: hov ? "var(--neu-card-hover)" : "var(--neu-card)",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div className="relative flex h-[94px] items-center justify-center" style={{ background: cfg.bg }}>
        <MaterialIcon name={cfg.icon} outlined size={38} style={{ color: cfg.color }} />
        <span
          className="absolute right-[7px] top-[7px] rounded-md px-[7px] py-0.5 text-[9px] font-bold tracking-wider"
          style={{ color: cfg.color, background: "#fff", border: `1px solid ${cfg.color}` }}
        >
          {cfg.label}
        </span>
        {hov && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[rgba(27,42,74,0.32)]">
            <button
              type="button"
              onClick={onOpen}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(255,255,255,0.9)]"
            >
              <MaterialIcon name="download" outlined size={15} className="text-[var(--figma-navy)]" />
            </button>
            <button
              type="button"
              onClick={onOpen}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(255,255,255,0.9)]"
            >
              <MaterialIcon name="open_in_full" outlined size={15} className="text-[var(--figma-navy)]" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex size-7 cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(242,109,109,0.9)]"
            >
              <MaterialIcon name="delete" outlined size={15} className="text-white" />
            </button>
          </div>
        )}
      </div>
      <div className="px-2.5 py-2">
        <div className="mb-px truncate text-[10px] font-semibold text-[var(--figma-navy)]">{file.name}</div>
        <div className="text-[9px] text-[var(--figma-gray400)]">
          {file.size}
          {file.size !== "—" ? " · " : ""}
          {file.date}
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  cat,
  folderPath,
  liveFiles,
  authDisabled,
  onUpdate,
  onUploadFiles,
  onDeleteLive,
  onOpenLive,
}: {
  cat: DetailCategory;
  folderPath: string | null;
  liveFiles: DetailDrawingFile[];
  authDisabled: boolean;
  onUpdate: (updated: Partial<DetailCategory>) => void;
  onUploadFiles: (files: File[]) => void;
  onDeleteLive: (file: DetailDrawingFile) => void;
  onOpenLive: (file: DetailDrawingFile) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const files = authDisabled ? cat.files : liveFiles;

  const handleDropFiles = (list: FileList | null) => {
    const next = list ? Array.from(list) : [];
    if (next.length) {
      onUploadFiles(next);
      return;
    }
    if (authDisabled) {
      const newFile: DetailDrawingFile = {
        id: Date.now(),
        name: `${cat.label}_New_Drawing.pdf`,
        type: "pdf",
        size: "—",
        date: "Just now",
      };
      onUpdate({ files: [...cat.files, newFile] });
    }
  };

  const deleteFile = (file: DetailDrawingFile) => {
    if (authDisabled || !file.fileId) {
      onUpdate({ files: cat.files.filter((f) => f.id !== file.id) });
      return;
    }
    onDeleteLive(file);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-[11px] neu-inset"
            style={{ background: cat.accentBg }}
          >
            <MaterialIcon name={cat.icon} outlined size={22} style={{ color: cat.color }} />
          </div>
          <div>
            <h3 className="m-0 text-lg font-bold text-[var(--figma-navy)]">{cat.label}</h3>
            <span className="text-xs text-[var(--figma-gray400)]">
              {files.length} file{files.length !== 1 ? "s" : ""} uploaded
              {!authDisabled && folderPath ? (
                <span className="ml-1 text-[var(--figma-gray400)]">· live folder</span>
              ) : null}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onUpdate({ complete: !cat.complete })}
          className="flex cursor-pointer items-center gap-2 rounded-[20px] px-4 py-2 transition-all duration-200"
          style={{
            border: cat.complete ? "none" : "1.5px solid var(--figma-border)",
            background: cat.complete ? "#DCFCE7" : "#fff",
            boxShadow: cat.complete ? "var(--neu-raised)" : "var(--neu-inset)",
          }}
        >
          <MaterialIcon
            name={cat.complete ? "check_circle" : "radio_button_unchecked"}
            outlined={!cat.complete}
            size={16}
            style={{ color: cat.complete ? "#3FA66B" : "var(--figma-gray400)" }}
          />
          <span className="text-xs font-semibold" style={{ color: cat.complete ? "#3FA66B" : "var(--figma-gray500)" }}>
            {cat.complete ? "Category Complete" : "Mark Complete"}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          handleDropFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleDropFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="mb-5 flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] px-6 py-[26px] transition-all duration-200 neu-inset"
        style={{
          border: `2px dashed ${drag ? cat.color : "var(--figma-border)"}`,
          background: drag ? cat.accentBg : "var(--figma-gray50)",
        }}
      >
        <div
          className="flex size-12 items-center justify-center rounded-xl"
          style={{
            background: drag ? cat.accentBg : "var(--figma-gray100)",
            border: drag ? `2px solid ${cat.color}` : "none",
          }}
        >
          <MaterialIcon
            name="upload_file"
            outlined
            size={26}
            style={{ color: drag ? cat.color : "var(--figma-gray400)" }}
          />
        </div>
        <div className="text-center">
          <div className="mb-0.5 text-[13px] font-semibold text-[var(--figma-navy)]">
            Upload {cat.label} Plans, Drawings & Specifications
          </div>
          <div className="text-[11px] text-[var(--figma-gray500)]">Drag & drop or click · PDF, DWG, DXF, PNG, JPG</div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mb-5 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {files.map((f) => (
            <FileCard
              key={f.id}
              file={f}
              cfg={TYPE_CONFIG[f.type]}
              onDelete={() => deleteFile(f)}
              onOpen={() => onOpenLive(f)}
            />
          ))}
        </div>
      )}

      {files.length === 0 && (
        <div className="mb-3 py-4 text-center">
          <span className="text-xs text-[var(--figma-gray400)]">No files uploaded for this category yet.</span>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--figma-gray500)]">
          Category Notes <span className="font-normal">(optional)</span>
        </label>
        <textarea
          value={cat.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          onFocus={() => setNotesFocused(true)}
          onBlur={() => setNotesFocused(false)}
          rows={2}
          placeholder={`Add notes for ${cat.label} drawings…`}
          className="box-border w-full resize-y rounded-[10px] bg-white px-3 py-[9px] text-xs leading-relaxed text-[var(--figma-navy)] outline-none transition-all duration-150 neu-inset"
          style={{
            border: notesFocused ? `2px solid ${cat.color}` : "1.5px solid var(--figma-border)",
            boxShadow: notesFocused ? `var(--neu-inset), 0 0 0 3px ${cat.color}14` : undefined,
          }}
        />
      </div>
    </div>
  );
}

export function DrawingsHubScreen({
  project,
  onBack,
  onDirectorOverview,
  onBoq,
}: {
  project: ActiveProjectView;
  onBack: () => void;
  onDirectorOverview: () => void;
  onBoq?: () => void;
}) {
  const authDisabled = isAuthDisabled();
  const { folderTree, uploadFile, deleteFile, getDownloadUrl } = useProjectFiles(project.id);
  const {
    categories: remoteCategories,
    updateCategory: persistCategory,
    isAuthOff,
  } = useDetailCategories(project.id);
  const detailedRoot = useMemo(
    () => resolveDetailedDrawingsFolder(folderTree),
    [folderTree],
  );

  const [categories, setCategories] = useState(remoteCategories);
  const [activeId, setActiveId] = useState<DetailCategoryId>("electrical");
  const [backHover, setBackHover] = useState(false);
  const [fileCounts, setFileCounts] = useState<Partial<Record<DetailCategoryId, number>>>({});

  useEffect(() => {
    setCategories(remoteCategories);
  }, [remoteCategories]);

  const activeCat = categories.find((c) => c.id === activeId)!;
  const folderPath = authDisabled
    ? null
    : matchCategoryFolder(detailedRoot, activeId, activeCat.label);

  const { data: liveRaw = [], refetch } = useQuery({
    queryKey: queryKeys.files.folder(project.id, folderPath ?? ""),
    queryFn: async () => {
      const qs = new URLSearchParams({ folderPath: folderPath! });
      const res = await authApiClient<{ data: ProjectFile[] }>(
        `/projects/${project.id}/files?${qs}`,
      );
      return res.data ?? [];
    },
    enabled: !authDisabled && Boolean(folderPath),
    staleTime: 20_000,
  });

  const liveFiles = useMemo(() => liveRaw.map(mapProjectFileToDetail), [liveRaw]);

  useEffect(() => {
    if (authDisabled) return;
    setFileCounts((prev) => ({ ...prev, [activeId]: liveFiles.length }));
  }, [authDisabled, activeId, liveFiles.length]);

  const updateCategory = (id: DetailCategoryId, patch: Partial<DetailCategory>) => {
    setCategories((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (!isAuthOff && ("complete" in patch || "notes" in patch)) {
      void persistCategory(id, {
        complete: patch.complete,
        notes: patch.notes,
      });
    }
  };

  async function handleUpload(files: File[]) {
    if (authDisabled) {
      updateCategory(activeId, {
        files: [
          ...activeCat.files,
          ...files.map((file, i) => ({
            id: Date.now() + i,
            name: file.name,
            type: drawingTypeFromFile({ fileName: file.name, mimeType: file.type }),
            size: formatFileSize(file.size),
            date: "Just now",
          })),
        ],
      });
      return;
    }
    if (!folderPath) {
      toast.error("Detailed Drawings folder not found.");
      return;
    }
    try {
      for (const file of files) {
        await uploadFile(folderPath, file);
      }
      await refetch();
      toast.success("Files uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleDeleteLive(file: DetailDrawingFile) {
    if (!file.fileId) return;
    try {
      await deleteFile(file.fileId);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleOpenLive(file: DetailDrawingFile) {
    if (authDisabled || !file.fileId) return;
    try {
      const url = await getDownloadUrl(file.fileId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open file");
    }
  }

  const completeCount = categories.filter((c) => c.complete).length;
  const allComplete = categories.every((c) => c.complete);

  return (
    <div className="px-10 py-8">
      <button
        type="button"
        data-allow-phase-nav
        onClick={onBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        className="mb-4 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] transition-colors duration-150"
        style={{ color: backHover ? "var(--figma-teal)" : "var(--figma-gray500)" }}
      >
        <MaterialIcon name="arrow_back" outlined size={16} />
        Projects / {project.name} / Detail Drawings
      </button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 mb-1 text-[28px] font-bold text-[var(--figma-navy)]">Detail Drawings</h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">Final technical documentation before execution</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onBoq && (
            <OutlineBtn label="Estimate Breakdown" icon="receipt_long" onClick={onBoq} small />
          )}
          <OutlineBtn label="Director Overview" icon="supervisor_account" onClick={onDirectorOverview} small />
          <GradientBtn label="Submit for Review" icon="send" small />
        </div>
      </div>

      <div
        className="mb-6 flex items-center gap-2.5 rounded-xl px-[18px] py-[11px]"
        style={{ background: "rgba(27,42,74,0.03)", border: "1.5px solid rgba(27,42,74,0.12)" }}
      >
        <MaterialIcon name="info" outlined size={17} className="text-[var(--figma-navy)]" />
        <span className="text-[13px] font-medium text-[var(--figma-navy)]">
          Changes at this stage are rare — director review required for any modifications.
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const active = cat.id === activeId;
          const count = authDisabled ? cat.files.length : (fileCounts[cat.id] ?? cat.files.length);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveId(cat.id)}
              className={cn(
                "flex cursor-pointer items-center gap-[7px] rounded-[22px] border-none py-2 pl-2.5 pr-4 transition-all duration-200",
                active ? "gi-gradient-cta text-white" : "bg-white neu-inset",
              )}
              style={{ boxShadow: active ? "var(--neu-raised)" : undefined }}
            >
              <div
                className="flex size-[26px] shrink-0 items-center justify-center rounded-full"
                style={{ background: active ? "rgba(255,255,255,0.18)" : cat.accentBg }}
              >
                <MaterialIcon
                  name={cat.icon}
                  outlined
                  size={14}
                  style={{ color: active ? "#fff" : cat.color }}
                />
              </div>
              <span
                className={cn("whitespace-nowrap text-xs", active ? "font-bold" : "font-medium text-[var(--figma-navy)]")}
              >
                {cat.label.split(",")[0]}
              </span>
              <span
                className="whitespace-nowrap rounded-lg px-[7px] py-px text-[10px] font-semibold"
                style={{
                  color: cat.complete ? "#3FA66B" : active ? "rgba(255,255,255,0.65)" : "var(--figma-gray400)",
                  background: cat.complete
                    ? active
                      ? "rgba(255,255,255,0.22)"
                      : "#DCFCE7"
                    : active
                      ? "rgba(255,255,255,0.10)"
                      : "var(--figma-gray100)",
                }}
              >
                {cat.complete ? "✓ Done" : `${count} file${count !== 1 ? "s" : ""}`}
              </span>
            </button>
          );
        })}
      </div>

      <SectionCard className="mt-1">
        <CategorySection
          cat={activeCat}
          folderPath={folderPath}
          liveFiles={liveFiles}
          authDisabled={authDisabled}
          onUpdate={(patch) => updateCategory(activeId, patch)}
          onUploadFiles={(files) => void handleUpload(files)}
          onDeleteLive={(file) => void handleDeleteLive(file)}
          onOpenLive={(file) => void handleOpenLive(file)}
        />
      </SectionCard>

      <div className="flex flex-wrap items-center gap-4 rounded-[14px] bg-white px-5 py-4" style={{ boxShadow: "var(--neu-card)" }}>
        <span className="mr-1 text-[13px] font-semibold text-[var(--figma-navy)]">Progress:</span>
        {categories.map((cat) => (
          <div
            key={cat.id}
            title={cat.label}
            className="flex size-7 items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: cat.complete ? "#DCFCE7" : "var(--figma-gray100)",
              border: cat.complete ? "2px solid #3FA66B" : "2px solid var(--figma-border)",
            }}
          >
            <MaterialIcon
              name={cat.complete ? "check" : cat.icon}
              outlined={!cat.complete}
              size={14}
              style={{ color: cat.complete ? "#3FA66B" : "var(--figma-gray400)" }}
            />
          </div>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-[var(--figma-gray500)]">
          {completeCount} / {categories.length} categories complete
        </span>
        {allComplete && (
          <span className="rounded-xl bg-[#DCFCE7] px-3.5 py-1 text-xs font-semibold text-[#3FA66B]">
            Ready for director review
          </span>
        )}
      </div>
    </div>
  );
}
