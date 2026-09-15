"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { useProject } from "@/hooks/use-project";
import { useProjectFiles } from "@/hooks/use-project-files";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  folderChildrenAsAreas,
  resolveThreedFolder,
} from "@/lib/files/resolve-folder";
import { isImageProjectFile } from "@/lib/files/map-project-file";
import { THREED_AREAS, THREED_RENDER_GALLERY } from "@/lib/projects/mock-threed";
import { queryKeys } from "@/lib/query/keys";
import type { ActiveProjectView } from "@/types/project-hub";
import type { ThreeDArea, ThreeDRenderImage } from "@/types/threed";
import type { ProjectFile } from "@/types/files";

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
  const authDisabled = isAuthDisabled();
  const { project: apiProject } = useProject(project.id);
  const { folderTree, uploadFile, deleteFile, getDownloadUrl } = useProjectFiles(project.id);
  const threedFolder = useMemo(() => resolveThreedFolder(folderTree), [folderTree]);

  const liveAreas = useMemo(() => {
    if (authDisabled || !threedFolder) return null;
    const children = folderChildrenAsAreas(threedFolder);
    if (children.length === 1 && children[0]?.path === threedFolder.path) {
      return [{ id: 0, name: "All", path: threedFolder.path }];
    }
    return children.map((c, idx) => ({ id: idx + 1, name: c.name, path: c.path }));
  }, [authDisabled, threedFolder]);

  const areas: (ThreeDArea & { path?: string })[] = authDisabled
    ? THREED_AREAS
    : liveAreas ?? [{ id: 0, name: "All", path: threedFolder?.path }];
  const [activeArea, setActiveArea] = useState<number | string>(areas[0]?.id ?? 1);
  const [gallery, setGallery] = useState(() => (isAuthDisabled() ? THREED_RENDER_GALLERY : []));
  const [liveGallery, setLiveGallery] = useState<ThreeDRenderImage[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [finalUploaded, setFinalUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!areas.some((a) => a.id === activeArea)) {
      setActiveArea(areas[0]?.id ?? 1);
    }
  }, [areas, activeArea]);

  const area = areas.find((a) => a.id === activeArea) ?? areas[0]!;
  const folderPath =
    ("path" in area && area.path) || threedFolder?.path || "";

  const { data: folderFiles = [], refetch } = useQuery({
    queryKey: queryKeys.files.folder(project.id, folderPath),
    queryFn: async () => {
      const qs = new URLSearchParams({ folderPath });
      const res = await authApiClient<{ data: ProjectFile[] }>(
        `/projects/${project.id}/files?${qs}`,
      );
      return res.data ?? [];
    },
    enabled: !authDisabled && Boolean(folderPath),
    staleTime: 20_000,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const images = folderFiles.filter(isImageProjectFile);
      if (!images.length) {
        if (!cancelled) setLiveGallery([]);
        return;
      }
      const items = await Promise.all(
        images.map(async (file) => {
          try {
            const url = await getDownloadUrl(file.id);
            return {
              id: file.id,
              url,
              caption: file.fileName,
              fileId: file.id,
            } as ThreeDRenderImage;
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled) {
        setLiveGallery(items.filter((x): x is ThreeDRenderImage => x != null));
      }
    }
    if (!authDisabled) void load();
    return () => {
      cancelled = true;
    };
  }, [folderFiles, getDownloadUrl, authDisabled]);

  const displayGallery = authDisabled ? gallery : liveGallery;
  const shortName = project.name.split(" ")[0] ?? project.name;
  const vimeoUrl = apiProject?.vimeo_url ?? null;

  async function handleUpload() {
    if (authDisabled) {
      setGallery((prev) => [...prev, { id: Date.now(), url: "", caption: "New render" }]);
      return;
    }
    if (!folderPath) {
      toast.error("3Ds folder not found. Provision project folders first.");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      const files = input.files ? Array.from(input.files) : [];
      if (!files.length) return;
      setUploading(true);
      try {
        for (const file of files) {
          await uploadFile(folderPath, file);
        }
        await refetch();
        toast.success("Renders uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function handleDelete(img: ThreeDRenderImage) {
    if (authDisabled || !img.fileId) {
      setGallery((prev) => prev.filter((i) => i.id !== img.id));
      return;
    }
    try {
      await deleteFile(img.fileId);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

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

      <AreaTabs areas={areas} activeId={activeArea} setActiveId={setActiveArea} />

      <SectionCard>
        <SectionTitle
          icon="photo_library"
          title={`${area.name} — 3D Renders`}
          right={
            <GradientBtn
              label={uploading ? "Uploading…" : "Upload Renders"}
              icon="upload"
              small
              onClick={() => void handleUpload()}
            />
          }
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5">
          {displayGallery.map((img, idx) => (
            <RenderThumb
              key={img.id}
              img={img}
              onClick={() => setLightbox(idx)}
              onDelete={() => void handleDelete(img)}
            />
          ))}
        </div>
        {!authDisabled && displayGallery.length === 0 ? (
          <p className="mt-3 text-center text-[13px] text-[var(--figma-gray400)]">
            No renders in this folder yet.
          </p>
        ) : null}
      </SectionCard>

      <WalkthroughCard onExpand={() => setShowWalkthrough(true)} />

      <TimelineWidget
        phase="3D Design"
        projectId={project.id}
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
        nextPhase="Execution"
        defaultFeedback="Client approved the 3D renders and walkthrough. Minor lighting adjustment requested for the lobby east view."
        localOnly
      />

      {lightbox !== null && displayGallery[lightbox]?.url && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center backdrop-blur-md"
          style={{ background: "rgba(27,42,74,0.85)" }}
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayGallery[lightbox].url.replace("w=600&h=400", "w=1100&h=740")}
              alt={displayGallery[lightbox].caption}
              className="max-h-[80vh] max-w-[85vw] rounded-xl object-contain"
              style={{ boxShadow: "var(--neu-modal, 0 24px 48px rgba(27,42,74,0.18))" }}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-4 text-xs font-medium text-white">
              {displayGallery[lightbox].caption}
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
          vimeoUrl={vimeoUrl}
        />
      )}
    </div>
  );
}
