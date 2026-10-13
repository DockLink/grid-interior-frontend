"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DemoCaption } from "@/components/demo/demo-caption";
import {
  GALLERY_CATEGORY_META,
  GALLERY_PHOTOS,
  type GalleryPhoto,
  type GalleryPhotoCategory,
} from "@/lib/files/mock-documents";
import { useProjectFiles } from "@/hooks/use-project-files";
import { FileUploadDialog } from "@/components/projects/files/file-upload-dialog";
import { resolveGalleryFolder } from "@/lib/files/resolve-folder";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isImageProjectFile, formatFileDate } from "@/lib/files/map-project-file";
import { useAuth } from "@/hooks/use-auth";
import { useHubTeam } from "@/lib/projects/hub-team-context";
import type { ProjectFile, ProjectFolderNode } from "@/types/files";

const T = {
  navy: "#1B2A4A",
  teal: "#0E7C86",
  tealLight: "#138f9b",
  alert: "#F26D6D",
  success: "#3FA66B",
  border: "#E5E7EB",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
};

const S = {
  raised:
    "6px 6px 14px rgba(163,177,198,0.45), -4px -4px 10px rgba(255,255,255,0.90)",
  inset:
    "inset 3px 3px 8px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.90)",
  card: "8px 8px 20px rgba(163,177,198,0.40), -6px -6px 14px rgba(255,255,255,0.95)",
  raisedHover:
    "9px 9px 20px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.95)",
};

function GradBtn({
  label,
  icon,
  onClick,
  small = false,
}: {
  label: string;
  icon?: string;
  onClick?: () => void;
  small?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: small ? "8px 18px" : "11px 24px",
        borderRadius: 24,
        border: "none",
        background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
        color: T.white,
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: hov ? S.raisedHover : S.raised,
        transform: hov ? "scale(1.01)" : "scale(1)",
        transition: "all 150ms",
      }}
    >
      {icon && (
        <span
          className="material-icons-outlined"
          style={{ fontSize: small ? 14 : 16 }}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}

function Avatar({
  initials,
  color,
  size = 28,
  title = "",
}: {
  initials: string;
  color: string;
  size?: number;
  title?: string;
}) {
  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: S.raised,
      }}
    >
      <span style={{ fontSize: size * 0.36, fontWeight: 700, color: T.white }}>
        {initials}
      </span>
    </div>
  );
}

function collectFolderPaths(node: ProjectFolderNode | null): string[] {
  if (!node) return [];
  const paths = [node.path];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      paths.push(...collectFolderPaths(child));
    }
  }
  return paths;
}

function inferCategory(file: ProjectFile): GalleryPhotoCategory {
  const lower = (file.fileName + " " + file.folderPath).toLowerCase();
  if (lower.includes("underway") || lower.includes("wip") || lower.includes("progress")) {
    return "underway";
  }
  if (
    lower.includes("completion") ||
    lower.includes("complete") ||
    lower.includes("after") ||
    lower.includes("finish")
  ) {
    return "completion";
  }
  return "site";
}

function formatMonth(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  } catch {}
  return "Recent Photos";
}

export function ProjectGalleryBoard({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [filter, setFilter] = useState<"all" | GalleryPhotoCategory>("all");
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const {
    folderTree,
    treeLoading,
    provisionFolders,
    uploadFile,
    createFolder,
    getDownloadUrl,
    deleteFile,
    reloadTree,
  } = useProjectFiles(projectId);

  const galleryFolder = resolveGalleryFolder(folderTree);

  const [uploadTargetOverride, setUploadTargetOverride] = useState<{
    path: string;
    name: string;
  } | null>(null);
  const uploadTarget = uploadTargetOverride ?? galleryFolder;

  const qc = useQueryClient();
  const { user } = useAuth();
  const teamMembers = useHubTeam();

  useEffect(() => {
    if (!treeLoading && (!folderTree || folderTree.tree.length === 0)) {
      void provisionFolders();
    }
  }, [treeLoading, folderTree, provisionFolders]);

  const handleUploadClick = async () => {
    if (uploadTarget) {
      setShowUpload(true);
      return;
    }
    try {
      const newFolder = await createFolder("5.0 Site Photos", null);
      setUploadTargetOverride({ path: newFolder.path, name: newFolder.name });
      setShowUpload(true);
    } catch {
      // If folder already exists or creation throws 400, reload tree and fallback gracefully
      await reloadTree();
      const resolved = resolveGalleryFolder(folderTree);
      if (resolved) {
        setUploadTargetOverride({ path: resolved.path, name: resolved.name });
      } else {
        setUploadTargetOverride({ path: "5.0 Site Photos", name: "Site Photos" });
      }
      setShowUpload(true);
    }
  };

  const folderPaths = useMemo(() => {
    if (galleryFolder) {
      const paths = collectFolderPaths(galleryFolder);
      if (paths.length > 0) return paths;
    }
    if (uploadTargetOverride) {
      return [uploadTargetOverride.path];
    }
    return ["5.0 Site Photos"];
  }, [galleryFolder, uploadTargetOverride]);

  const {
    data: remoteFolderFiles = [],
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useQuery({
    queryKey: ["project-gallery-files", projectId, folderPaths],
    queryFn: async () => {
      if (!folderPaths.length) return [];
      const results = await Promise.all(
        folderPaths.map(async (fp) => {
          try {
            const qs = new URLSearchParams({ folderPath: fp });
            const res = await authApiClient<{ data: ProjectFile[] }>(
              `/projects/${projectId}/files?${qs}`,
            );
            return res.data ?? [];
          } catch {
            return [];
          }
        }),
      );
      const map = new Map<string, ProjectFile>();
      for (const f of results.flat()) {
        map.set(f.id, f);
      }
      return Array.from(map.values());
    },
    enabled: Boolean(projectId) && folderPaths.length > 0,
    staleTime: 5_000,
  });

  const imageFiles = useMemo(() => {
    return remoteFolderFiles.filter(isImageProjectFile);
  }, [remoteFolderFiles]);

  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const missing = imageFiles.filter((f) => !photoUrls[f.id]);
    if (missing.length === 0) return;

    void (async () => {
      const entries = await Promise.all(
        missing.map(async (file) => {
          try {
            const url = await getDownloadUrl(file.id);
            return [file.id, url] as const;
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled) {
        setPhotoUrls((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const entry of entries) {
            if (entry && !next[entry[0]]) {
              next[entry[0]] = entry[1];
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageFiles, getDownloadUrl, photoUrls]);

  const livePhotos: GalleryPhoto[] = useMemo(() => {
    return imageFiles.map((f) => {
      const member = teamMembers.find(
        (m) => String(m.id) === String(f.uploadedById),
      );
      const userFullName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : "";
      const uploaderName =
        member?.name ?? (userFullName || user?.email || "Team Member");
      const uploaderInitials =
        member?.initials ??
        (user?.first_name
          ? `${user.first_name[0]}${user.last_name ? user.last_name[0] : ""}`.toUpperCase()
          : "TM");
      const uploaderColor = member?.color ?? T.teal;

      return {
        id: f.id,
        url: photoUrls[f.id] || "",
        category: inferCategory(f),
        uploaderName,
        uploaderInitials,
        uploaderColor,
        date: formatFileDate(f.created_at),
        month: formatMonth(f.created_at),
        projectId,
      };
    });
  }, [imageFiles, photoUrls, teamMembers, user, projectId]);

  const scopedMock = useMemo(() => {
    return GALLERY_PHOTOS.filter((p) => p.projectId === projectId);
  }, [projectId]);

  const allPhotos = useMemo(() => {
    return [...livePhotos, ...scopedMock];
  }, [livePhotos, scopedMock]);

  const filtered =
    filter === "all" ? allPhotos : allPhotos.filter((p) => p.category === filter);

  const grouped = filtered.reduce<Record<string, GalleryPhoto[]>>((acc, p) => {
    (acc[p.month] ??= []).push(p);
    return acc;
  }, {});
  const months = Object.keys(grouped);

  const handleDeletePhoto = async (photo: GalleryPhoto) => {
    if (typeof photo.id !== "string") {
      toast.info("Sample demo photo cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      await deleteFile(photo.id);
      toast.success("Photo deleted successfully");
      await qc.invalidateQueries({
        queryKey: ["project-gallery-files", projectId],
      });
      await refetchFiles();
    } catch {
      toast.error("Failed to delete photo");
    }
  };

  return (
    <div style={{ padding: "28px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.navy,
              margin: "0 0 4px",
            }}
          >
            Image Gallery
          </h1>
          <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
            {projectName} · Site pictures, work in progress, and completion photos
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <GradBtn
          label="Upload Photos"
          icon="add_a_photo"
          small
          onClick={() => void handleUploadClick()}
        />
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {(
          [
            { id: "all", label: "All" },
            { id: "site", label: GALLERY_CATEGORY_META.site.label },
            { id: "underway", label: GALLERY_CATEGORY_META.underway.label },
            { id: "completion", label: GALLERY_CATEGORY_META.completion.label },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "7px 16px",
              borderRadius: 18,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: filter === f.id ? 700 : 400,
              background:
                filter === f.id
                  ? `linear-gradient(135deg, ${T.navy}, ${T.teal})`
                  : T.white,
              color: filter === f.id ? T.white : T.gray500,
              boxShadow: filter === f.id ? S.raised : S.inset,
              transition: "all 180ms",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filesLoading && allPhotos.length === 0 ? (
        <div
          style={{
            padding: "50px 20px",
            textAlign: "center",
            color: T.gray500,
            fontSize: 13,
          }}
        >
          <span
            className="material-icons-outlined"
            style={{ fontSize: 32, color: T.teal, display: "block", marginBottom: 8 }}
          >
            hourglass_top
          </span>
          Loading image gallery...
        </div>
      ) : months.length === 0 ? (
        <div
          style={{
            padding: "50px 20px",
            textAlign: "center",
            background: T.white,
            borderRadius: 16,
            boxShadow: S.card,
            color: T.gray500,
          }}
        >
          <span
            className="material-icons-outlined"
            style={{ fontSize: 44, color: T.teal, marginBottom: 8, display: "block" }}
          >
            add_photo_alternate
          </span>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: T.navy,
              marginBottom: 4,
            }}
          >
            No photos in this gallery yet
          </div>
          <p style={{ fontSize: 13, color: T.gray400, margin: "0 0 16px" }}>
            Upload site pictures, work in progress photos, or completion images.
          </p>
          <GradBtn
            label="Upload Photos"
            icon="add_a_photo"
            small
            onClick={() => void handleUploadClick()}
          />
        </div>
      ) : (
        months.map((month) => {
          const photos = grouped[month] ?? [];
          const cols: GalleryPhoto[][] = [[], [], []];
          photos.forEach((p, i) => cols[i % 3].push(p));
          return (
            <div key={month} style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.navy,
                  marginBottom: 12,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {month}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                {cols.map((col, ci) => (
                  <div
                    key={ci}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {col.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => {
                          if (photo.url) setLightbox(photo);
                        }}
                        style={{
                          borderRadius: 16,
                          overflow: "hidden",
                          cursor: photo.url ? "zoom-in" : "default",
                          boxShadow: S.card,
                          position: "relative",
                          background: T.gray100,
                          minHeight: 180,
                        }}
                      >
                        {photo.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photo.url}
                            alt={photo.category}
                            style={{
                              width: "100%",
                              height: "auto",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              height: 180,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: T.gray400,
                              fontSize: 12,
                            }}
                          >
                            Loading preview...
                          </div>
                        )}
                        <span
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            padding: "3px 8px",
                            borderRadius: 8,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: GALLERY_CATEGORY_META[photo.category].badgeBg,
                            color: "white",
                          }}
                        >
                          {GALLERY_CATEGORY_META[photo.category].badge}
                        </span>

                        {typeof photo.id === "string" && (
                          <button
                            type="button"
                            title="Delete photo"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDeletePhoto(photo);
                            }}
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              background: "rgba(0,0,0,0.6)",
                              border: "none",
                              color: "white",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "background 150ms",
                            }}
                          >
                            <span
                              className="material-icons-outlined"
                              style={{ fontSize: 16 }}
                            >
                              delete
                            </span>
                          </button>
                        )}

                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "20px 12px 10px",
                            background:
                              "linear-gradient(to top, rgba(27,42,74,0.75), transparent)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Avatar
                            initials={photo.uploaderInitials}
                            color={photo.uploaderColor}
                            size={22}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: "white",
                              fontWeight: 600,
                            }}
                          >
                            {photo.uploaderName}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              color: "rgba(255,255,255,0.6)",
                              marginLeft: "auto",
                            }}
                          >
                            {photo.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(12,12,14,0.88)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.14)",
              border: "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.category}
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}
          />
        </div>
      )}

      {/* Upload dialog */}
      {showUpload && uploadTarget && (
        <FileUploadDialog
          open={showUpload}
          onOpenChange={(open) => {
            setShowUpload(open);
            if (!open) {
              void qc.invalidateQueries({
                queryKey: ["project-gallery-files", projectId],
              });
              void refetchFiles();
            }
          }}
          folderPath={uploadTarget.path}
          folderLabel={uploadTarget.name}
          isVersioned={false}
          accept="image/*"
          onUpload={async (folderPath, file, onProgress) => {
            const res = await uploadFile(folderPath, file, undefined, onProgress);
            await qc.invalidateQueries({
              queryKey: ["project-gallery-files", projectId],
            });
            await refetchFiles();
            return res;
          }}
        />
      )}
    </div>
  );
}
