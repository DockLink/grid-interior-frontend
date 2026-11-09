"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useProject } from "@/hooks/use-project";
import { useProjectFiles } from "@/hooks/use-project-files";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { resolveGalleryFolder } from "@/lib/files/resolve-folder";
import { calendarDateFromApi } from "@/lib/projects/calendar-date";
import {
  PHASE_CFG,
  type ProjectPhase,
} from "@/lib/projects/design-tokens";
import {
  getHistoricalGallery,
  getHistoricalProject,
} from "@/lib/projects/mock-projects";
import { resolveProjectMemberProfile } from "@/lib/projects/member-display";
import {
  mapProjectImagesToGallery,
  mapProjectToHistoricalView,
} from "@/lib/projects/map-project-hub";
import { mapProjectMembersList } from "@/lib/projects/map-project-members";
import {
  getTaskStatusLabel,
  getTaskStatusStyle,
} from "@/lib/projects/map-stages";
import { queryKeys } from "@/lib/query/keys";
import { resolveTaskEndDateIso } from "@/lib/tasks/task-dates";
import type { HistoricalGalleryItem } from "@/types/project-hub";
import type { ProjectFile } from "@/types/files";
import {
  PROJECT_LEAD_ROLE,
  type ProjectMember,
} from "@/types/projects";
import type { Task, TaskableStatus } from "@/types/tasks";
import { NAV_ROUTES } from "@/types/navigation";

type HistoricalPhaseRow = {
  id: string;
  name: string;
  order: number;
  startDate: string;
  endDate: string;
  status: TaskableStatus | string;
};

type HistoricalTeamMember = {
  userId: string;
  name: string;
  initials: string;
  roleLabel: string;
  isCoordinator: boolean;
};

function mapStageToHistoricalPhase(stage: Task): HistoricalPhaseRow {
  const startDate = calendarDateFromApi(stage.start_date) || stage.start_date || "";
  const hasEndOrDuration = Boolean(stage.end_date || stage.duration);
  const endDate = hasEndOrDuration
    ? resolveTaskEndDateIso(stage)
    : calendarDateFromApi(stage.end_date) || stage.end_date || "";

  return {
    id: stage.id,
    name: stage.title,
    order: stage.order,
    startDate,
    endDate,
    status: stage.status,
  };
}

function mapActiveTeamMembers(members: ProjectMember[]): HistoricalTeamMember[] {
  return members
    .filter((m) => m.status === "ACTIVE")
    .map((m) => {
      const profile = resolveProjectMemberProfile(m, []);
      const isCoordinator = m.role === PROJECT_LEAD_ROLE;
      return {
        userId: m.user_id,
        name: profile.name,
        initials: profile.initials,
        roleLabel: isCoordinator ? "Project Coordinator" : "Member",
        isCoordinator,
      };
    })
    .sort((a, b) => {
      if (a.isCoordinator !== b.isCoordinator) return a.isCoordinator ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

function formatPhaseDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

function formatPhaseRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return "No dates";
  return `${formatPhaseDate(startDate)} – ${formatPhaseDate(endDate)}`;
}

function phaseCfgForName(name: string) {
  const key = name.trim() as ProjectPhase;
  return PHASE_CFG[key] ?? null;
}

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

function isImageFile(file: ProjectFile): boolean {
  const mime = file.mimeType?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|avif|bmp|heic)$/i.test(file.fileName);
}

const EMPTY_GALLERY_FILES: ProjectFile[] = [];

export function HistoricalProjectDetail({ projectId }: { projectId: string }) {
  const authDisabled = isAuthDisabled();
  const { project: apiProject, isLoading, error } = useProject(projectId);
  const { folderTree, getDownloadUrl } = useProjectFiles(projectId);
  const { tasks: stageTasks, isLoading: stagesLoading } = useProjectTaskables(
    projectId,
    "STAGE",
    { limit: 100 },
  );
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [fileGallery, setFileGallery] = useState<HistoricalGalleryItem[]>([]);

  const {
    data: projectMembers = [],
    isPending: membersLoading,
  } = useQuery({
    queryKey: queryKeys.projects.members(projectId),
    queryFn: async () => {
      const res = await authApiClient<{ members: ProjectMember[] }>(
        `/projects/${projectId}/members`,
      );
      return mapProjectMembersList(res);
    },
    enabled: !authDisabled && Boolean(projectId),
    staleTime: 30_000,
  });

  const phases = useMemo(
    () =>
      stageTasks
        .map(mapStageToHistoricalPhase)
        .sort((a, b) => a.order - b.order),
    [stageTasks],
  );

  const teamMembers = useMemo(
    () => mapActiveTeamMembers(projectMembers),
    [projectMembers],
  );

  const galleryFolder = useMemo(
    () => resolveGalleryFolder(folderTree),
    [folderTree],
  );

  const { data: galleryFiles = EMPTY_GALLERY_FILES } = useQuery({
    queryKey: queryKeys.files.folder(projectId, galleryFolder?.path ?? ""),
    queryFn: async () => {
      const qs = new URLSearchParams({ folderPath: galleryFolder!.path });
      const res = await authApiClient<{ data: ProjectFile[] }>(
        `/projects/${projectId}/files?${qs}`,
      );
      return res.data ?? [];
    },
    enabled: !authDisabled && Boolean(galleryFolder?.path),
    staleTime: 30_000,
  });

  useEffect(() => {
    let cancelled = false;
    async function loadUrls() {
      const images = galleryFiles.filter(isImageFile);
      if (!images.length) {
        if (!cancelled) {
          setFileGallery((prev) => (prev.length === 0 ? prev : []));
        }
        return;
      }
      const items = await Promise.all(
        images.map(async (file) => {
          try {
            const url = await getDownloadUrl(file.id);
            return {
              url,
              alt: file.fileName,
              caption: file.fileName,
            } satisfies HistoricalGalleryItem;
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled) {
        setFileGallery(items.filter((x): x is HistoricalGalleryItem => Boolean(x)));
      }
    }
    void loadUrls();
    return () => {
      cancelled = true;
    };
  }, [galleryFiles, getDownloadUrl]);

  const mockProject = authDisabled ? getHistoricalProject(projectId) : null;
  const mockGallery = authDisabled ? getHistoricalGallery(projectId) : [];

  const project = apiProject
    ? mapProjectToHistoricalView(apiProject)
    : mockProject;

  const gallery = useMemo(() => {
    if (authDisabled) return mockGallery;
    if (fileGallery.length) return fileGallery;
    if (apiProject) return mapProjectImagesToGallery(apiProject);
    return [];
  }, [authDisabled, mockGallery, fileGallery, apiProject]);

  if (isLoading && !project) {
    return <div className="px-10 py-8 text-[var(--figma-gray500)]">Loading project…</div>;
  }

  if (!project) {
    return (
      <div className="px-10 py-8 text-[var(--figma-alert)]">
        {error ?? "Historical project not found."}
      </div>
    );
  }

  const hasCoords =
    project.latitude != null &&
    project.longitude != null &&
    Number.isFinite(project.latitude) &&
    Number.isFinite(project.longitude);
  const coordsLabel = hasCoords
    ? `${project.latitude!.toFixed(4)}, ${project.longitude!.toFixed(4)}`
    : null;
  const mapsHref = hasCoords
    ? `https://www.google.com/maps?q=${project.latitude},${project.longitude}`
    : null;

  const detailItems = [
    project.location
      ? { icon: "location_on" as const, label: "Location", value: project.location }
      : null,
    coordsLabel
      ? {
          icon: "my_location" as const,
          label: "Coordinates",
          value: coordsLabel,
          href: mapsHref ?? undefined,
        }
      : null,
    project.duration
      ? { icon: "schedule" as const, label: "Duration", value: project.duration }
      : null,
    { icon: "calendar_month" as const, label: "Year", value: String(project.year) },
    project.clientEmail
      ? { icon: "mail" as const, label: "Client email", value: project.clientEmail, href: `mailto:${project.clientEmail}` }
      : null,
    project.clientPhone
      ? { icon: "call" as const, label: "Client phone", value: project.clientPhone, href: `tel:${project.clientPhone}` }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="mx-auto max-w-[960px] px-10 py-8">
      <Link
        href={`${NAV_ROUTES.projects}?tab=historical`}
        className="mb-6 flex items-center gap-1.5 text-[13px] text-[var(--figma-gray500)] no-underline transition-colors hover:text-[var(--figma-teal)]"
      >
        <MaterialIcon name="arrow_back" outlined size={18} />
        Back to Historical Projects
      </Link>

      {project.photo ? (
        <div className="mb-7 overflow-hidden rounded-2xl bg-[var(--figma-gray100)]" style={{ boxShadow: "var(--neu-card)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.photo}
            alt={project.photoAlt}
            className="h-[280px] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="m-0 mb-1.5 text-[28px] font-bold text-[var(--figma-navy)]">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {project.code ? (
              <>
                <span className="text-[13px] font-medium text-[var(--figma-gray500)]">{project.code}</span>
                <span className="text-[var(--figma-border)]">·</span>
              </>
            ) : null}
            <span className="text-sm font-medium text-[var(--figma-teal)]">{project.clientName}</span>
            <span className="text-[var(--figma-border)]">·</span>
            <span className="text-[13px] text-[var(--figma-gray500)]">
              {project.startDate} — {project.completionDate}
            </span>
            <span className="text-[var(--figma-border)]">·</span>
            <span className="text-[13px] text-[var(--figma-gray500)]">{project.year}</span>
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

      {detailItems.length > 0 ? (
        <div className="neu-card mb-6 rounded-2xl bg-white px-6 py-5">
          <div className="mb-3.5 flex items-center gap-2">
            <MaterialIcon name="info" outlined size={18} className="text-[var(--figma-teal)]" />
            <span className="text-sm font-semibold text-[var(--figma-navy)]">Project Details</span>
          </div>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
          >
            {detailItems.map((item) => (
              <div key={item.label} className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--figma-gray400)]">
                  <MaterialIcon name={item.icon} outlined size={14} />
                  {item.label}
                </div>
                {"href" in item && item.href ? (
                  <a
                    href={item.href}
                    target={item.label === "Coordinates" ? "_blank" : undefined}
                    rel={item.label === "Coordinates" ? "noopener noreferrer" : undefined}
                    className="block truncate text-sm text-[var(--figma-navy)] no-underline hover:text-[var(--figma-teal)]"
                  >
                    {item.label === "Coordinates" ? `${item.value} · Open in Maps` : item.value}
                  </a>
                ) : (
                  <span className="block truncate text-sm text-[var(--figma-navy)]">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!authDisabled ? (
        <div className="neu-card mb-6 rounded-2xl bg-white px-6 py-5">
          <div className="mb-3.5 flex items-center gap-2">
            <MaterialIcon name="group" outlined size={18} className="text-[var(--figma-teal)]" />
            <span className="text-sm font-semibold text-[var(--figma-navy)]">Team</span>
          </div>
          {membersLoading ? (
            <p className="m-0 text-sm text-[var(--figma-gray400)]">Loading team…</p>
          ) : teamMembers.length === 0 ? (
            <p className="m-0 text-sm text-[var(--figma-gray400)]">No team members assigned.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {teamMembers.map((member) => (
                <li
                  key={member.userId}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--figma-border)] pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--figma-navy)] text-[11px] font-semibold text-white">
                      {member.initials}
                    </span>
                    <span className="truncate text-sm font-medium text-[var(--figma-navy)]">
                      {member.name}
                    </span>
                  </div>
                  <span
                    className="inline-flex shrink-0 items-center rounded-[20px] px-2.5 py-0.5 text-[11px] font-semibold"
                    style={
                      member.isCoordinator
                        ? { background: "#DBEAFE", color: "#1E3A8A" }
                        : { background: "var(--figma-gray100)", color: "var(--figma-gray500)" }
                    }
                  >
                    {member.roleLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {!authDisabled ? (
        <div className="neu-card mb-6 rounded-2xl bg-white px-6 py-5">
          <div className="mb-3.5 flex items-center gap-2">
            <MaterialIcon name="view_timeline" outlined size={18} className="text-[var(--figma-teal)]" />
            <span className="text-sm font-semibold text-[var(--figma-navy)]">Phases</span>
          </div>
          {stagesLoading ? (
            <p className="m-0 text-sm text-[var(--figma-gray400)]">Loading phases…</p>
          ) : phases.length === 0 ? (
            <p className="m-0 text-sm text-[var(--figma-gray400)]">No phase schedule recorded.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {phases.map((phase) => {
                const cfg = phaseCfgForName(phase.name);
                const statusStyle = getTaskStatusStyle(phase.status);
                return (
                  <li
                    key={phase.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--figma-border)] pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {cfg ? (
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <MaterialIcon name={cfg.icon} outlined size={16} />
                        </span>
                      ) : (
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--figma-gray100)] text-[var(--figma-gray500)]">
                          <MaterialIcon name="flag" outlined size={16} />
                        </span>
                      )}
                      <span className="truncate text-sm font-medium text-[var(--figma-navy)]">
                        {phase.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex shrink-0 items-center rounded-[20px] px-2.5 py-0.5 text-[11px] font-semibold"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {getTaskStatusLabel(phase.status)}
                      </span>
                      <span className="text-[13px] text-[var(--figma-gray500)]">
                        {formatPhaseRange(phase.startDate, phase.endDate)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      <div className="neu-card mb-6 rounded-2xl bg-white px-6 py-5">
        <div className="mb-2.5 flex items-center gap-2">
          <MaterialIcon name="article" outlined size={18} className="text-[var(--figma-teal)]" />
          <span className="text-sm font-semibold text-[var(--figma-navy)]">Project Overview</span>
        </div>
        {project.description ? (
          <p className="m-0 text-sm leading-relaxed text-[var(--figma-gray500)]">{project.description}</p>
        ) : (
          <p className="m-0 text-sm text-[var(--figma-gray400)]">No project description provided.</p>
        )}
      </div>

      {project.briefAttachments.length > 0 ? (
        <div className="neu-card mb-6 rounded-2xl bg-white px-6 py-5">
          <div className="mb-3.5 flex items-center gap-2">
            <MaterialIcon name="attach_file" outlined size={18} className="text-[var(--figma-teal)]" />
            <span className="text-sm font-semibold text-[var(--figma-navy)]">Brief Attachments</span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {project.briefAttachments.map((file) => (
              <li key={file.id}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--figma-navy)] no-underline transition-colors hover:text-[var(--figma-teal)]"
                >
                  <MaterialIcon name="description" outlined size={16} className="text-[var(--figma-gray500)]" />
                  {file.fileName}
                  <MaterialIcon name="open_in_new" outlined size={14} className="text-[var(--figma-gray400)]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
            <GalleryItem key={`${img.url}-${idx}`} img={img} onClick={() => setLightboxIdx(idx)} />
          ))}
        </div>
      </div>

      {lightboxIdx !== null && gallery[lightboxIdx] && (
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
