"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DemoCaption } from "@/components/demo/demo-caption";
import {
  MeetingEntry,
  MeetingsList,
} from "@/components/files/meeting-minutes-section";
import { FolderNameDialog } from "@/components/projects/files/folder-name-dialog";
import {
  FOLDER_CFG,
  FOLDER_TREE,
  GALLERY_CATEGORY_META,
  GALLERY_PHOTOS,
  MOCK_FILES,
  MOCK_MEETINGS,
  cloneFolderTree,
  flattenFolders,
  folderCfgFromTree,
  folderMatches,
  insertFolderNode,
  type DocFile,
  type FolderCfg,
  type FolderNode,
  type FolderType,
  type GalleryPhoto,
  type GalleryPhotoCategory,
  type MeetingMinute,
} from "@/lib/files/mock-documents";
import {
  getActiveProject,
  getAllActiveProjects,
} from "@/lib/projects/mock-projects";
import { projectTabRoute } from "@/types/navigation";

// ── Design tokens ─────────────────────────────────────────────────────────────
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
  raisedHover:
    "9px 9px 20px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.95)",
  card: "8px 8px 20px rgba(163,177,198,0.40), -6px -6px 14px rgba(255,255,255,0.95)",
  inset:
    "inset 3px 3px 8px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.90)",
  modal:
    "16px 16px 40px rgba(163,177,198,0.45), -10px -10px 28px rgba(255,255,255,0.95)",
  dropdown:
    "12px 12px 30px rgba(163,177,198,0.40), -8px -8px 20px rgba(255,255,255,0.95)",
};

function matchesProject(projectId: string, filter: string) {
  return filter === "all" || projectId === filter;
}

function projectLabel(projectId: string) {
  return getActiveProject(projectId)?.name ?? "Project";
}

function projectFilterSubtitle(filter: string, suffix: string) {
  if (filter === "all") return `All projects · ${suffix}`;
  return `${projectLabel(filter)} · ${suffix}`;
}

type DocsView =
  | "files"
  | "gallery"
  | "minutes-list"
  | "minutes-entry"
  | "search";

// ── Shared primitives ─────────────────────────────────────────────────────────
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

// File type icon
function FileTypeChip({ type }: { type: DocFile["type"] }) {
  const cfg = {
    pdf: { label: "PDF", color: "#EF4444", bg: "#FEE2E2" },
    dwg: { label: "DWG", color: "#1B2A4A", bg: "#E0E7FF" },
    img: { label: "IMG", color: "#8B5CF6", bg: "#EDE9FE" },
    xls: { label: "XLS", color: "#059669", bg: "#DCFCE7" },
    audio: { label: "MP3", color: "#D97706", bg: "#FEF3C7" },
  }[type];
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        padding: "2px 6px",
        borderRadius: 5,
        color: cfg.color,
        background: cfg.bg,
        letterSpacing: "0.06em",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ── NAV TABS ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "files" as DocsView, label: "Files", icon: "folder_open" },
  { id: "gallery" as DocsView, label: "Photo Gallery", icon: "photo_library" },
  { id: "minutes-list" as DocsView, label: "Meeting Minutes", icon: "article" },
  { id: "search" as DocsView, label: "Search", icon: "search" },
];

function TabBar({
  view,
  setView,
}: {
  view: DocsView;
  setView: (v: DocsView) => void;
}) {
  const activeId =
    view === "minutes-entry"
      ? "minutes-list"
      : view;
  return (
    <div
      style={{
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 40px",
        display: "flex",
        gap: 2,
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "13px 18px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              borderBottom: active
                ? `2.5px solid ${T.teal}`
                : "2.5px solid transparent",
              color: active ? T.teal : T.gray500,
              fontWeight: active ? 700 : 400,
              fontSize: 13,
              transition: "all 150ms",
              marginBottom: -1,
              whiteSpace: "nowrap",
            }}
          >
            <span
              className="material-icons-outlined"
              style={{ fontSize: 16 }}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ProjectFilterBar({
  projectFilter,
  onChange,
}: {
  projectFilter: string;
  onChange: (id: string) => void;
}) {
  const projects = getAllActiveProjects();
  const chips = [
    { id: "all", label: "All projects" },
    ...projects.map((p) => ({ id: p.id, label: p.name })),
  ];

  return (
    <div
      style={{
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        padding: "10px 40px 12px",
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        flexShrink: 0,
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.gray400,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginRight: 6,
        }}
      >
        Project
      </span>
      {chips.map((chip) => {
        const active = projectFilter === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 18,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: active ? 700 : 400,
              background: active
                ? `linear-gradient(135deg, ${T.navy}, ${T.teal})`
                : T.white,
              color: active ? T.white : T.gray500,
              boxShadow: active ? S.raised : S.inset,
              transition: "all 180ms",
            }}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

// ── FILES BROWSER ─────────────────────────────────────────────────────────────
function FileBrowser({ projectFilter }: { projectFilter: string }) {
  const canCreateFolders = projectFilter !== "all";
  const [activeFolder, setActiveFolder] = useState<FolderType | "all">("all");
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const [treesByProject, setTreesByProject] = useState<Record<string, FolderNode[]>>({});
  const [folderDialog, setFolderDialog] = useState<
    | { type: "create-root" }
    | { type: "create-sub"; parentPath: string }
    | null
  >(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    drawings: true,
    designs: true,
    approved: false,
    admin: true,
  });

  const tree =
    projectFilter === "all"
      ? FOLDER_TREE
      : (treesByProject[projectFilter] ?? FOLDER_TREE);
  const liveCfg = { ...FOLDER_CFG, ...folderCfgFromTree(tree) };

  useEffect(() => {
    if (activeFolder === "all") return;
    const ids = new Set(flattenFolders(tree).map((n) => n.id));
    if (!ids.has(activeFolder)) setActiveFolder("all");
  }, [projectFilter, tree, activeFolder]);

  const scopedFiles = MOCK_FILES.filter((f) =>
    matchesProject(f.projectId, projectFilter),
  );

  const filtered = scopedFiles.filter((f) => {
    const matchFolder = folderMatches(f.folder, activeFolder);
    const matchSearch =
      !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  });

  const grouped =
    projectFilter === "all"
      ? (() => {
          const order = getAllActiveProjects().map((p) => p.id);
          const map = new Map<string, DocFile[]>();
          for (const f of filtered) {
            const list = map.get(f.projectId) ?? [];
            list.push(f);
            map.set(f.projectId, list);
          }
          const ids = [
            ...order.filter((id) => map.has(id)),
            ...[...map.keys()].filter((id) => !order.includes(id)),
          ];
          return ids.map((id) => ({ projectId: id, files: map.get(id)! }));
        })()
      : null;

  const countFor = (id: string) =>
    scopedFiles.filter((f) => folderMatches(f.folder, id)).length;

  function handleFolderSubmit(name: string) {
    if (projectFilter === "all" || !folderDialog) return;
    const parentId =
      folderDialog.type === "create-root" ? null : folderDialog.parentPath;
    setTreesByProject((prev) => {
      const current = prev[projectFilter] ?? cloneFolderTree();
      return {
        ...prev,
        [projectFilter]: insertFolderNode(current, parentId, name),
      };
    });
    if (folderDialog.type === "create-sub") {
      setExpanded((p) => ({ ...p, [folderDialog.parentPath]: true }));
    }
    setFolderDialog(null);
  }

  const renderNode = (node: FolderNode, depth = 0) => {
    const active = activeFolder === node.id;
    const hasChildren = Boolean(node.children?.length);
    const open = expanded[node.id] ?? false;
    const hovered = hoveredFolder === node.id;
    return (
      <div key={node.id}>
        <div
          onMouseEnter={() => setHoveredFolder(node.id)}
          onMouseLeave={() => setHoveredFolder((id) => (id === node.id ? null : id))}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 2,
            borderRadius: 10,
            background: active ? `${node.color}10` : "transparent",
            boxShadow: active ? S.raised : "none",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveFolder(node.id);
              if (hasChildren) setExpanded((p) => ({ ...p, [node.id]: !open }));
            }}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: `8px 4px 8px ${10 + depth * 12}px`,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: "transparent",
            }}
          >
            {hasChildren ? (
              <span className="material-icons-outlined" style={{ fontSize: 16, color: T.gray400 }}>
                {open ? "expand_more" : "chevron_right"}
              </span>
            ) : (
              <span style={{ width: 16 }} />
            )}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: node.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span className="material-icons-outlined" style={{ fontSize: 14, color: node.color }}>
                {node.icon}
              </span>
            </div>
            <span
              style={{
                flex: 1,
                textAlign: "left",
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: active ? node.color : T.gray500,
              }}
            >
              {node.label}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: 8,
                background: active ? node.bg : T.gray100,
                color: active ? node.color : T.gray400,
              }}
            >
              {countFor(node.id)}
            </span>
          </button>
          {canCreateFolders && (
            <button
              type="button"
              title="New subfolder"
              onClick={() =>
                setFolderDialog({ type: "create-sub", parentPath: node.id })
              }
              style={{
                width: 26,
                height: 26,
                marginRight: 4,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                background: "transparent",
                color: T.teal,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: hovered || active ? 1 : 0,
                flexShrink: 0,
              }}
            >
              <span className="material-icons-outlined" style={{ fontSize: 16 }}>
                create_new_folder
              </span>
            </button>
          )}
        </div>
        {hasChildren && open && node.children!.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  const emptyMessage =
    scopedFiles.length === 0
      ? "No files for this project."
      : "No files in this folder.";

  return (
    <div style={{ padding: "28px 40px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
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
            Documents & Files
          </h1>
          <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
            {projectFilterSubtitle(projectFilter, "All project files")}
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            title={
              canCreateFolders
                ? "New folder"
                : "Select a project to create a folder"
            }
            disabled={!canCreateFolders}
            onClick={() => {
              if (canCreateFolders) setFolderDialog({ type: "create-root" });
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 18px",
              borderRadius: 24,
              border: `1.5px solid ${T.border}`,
              background: T.white,
              color: canCreateFolders ? T.navy : T.gray400,
              fontSize: 12,
              fontWeight: 600,
              cursor: canCreateFolders ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              boxShadow: S.raised,
              opacity: canCreateFolders ? 1 : 0.55,
            }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 14 }}>
              create_new_folder
            </span>
            New folder
          </button>
          <GradBtn label="Upload File" icon="upload" small />
        </div>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Sidebar folders */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: T.gray400,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Folders
          </div>

          {/* All files */}
          <button
            type="button"
            onClick={() => setActiveFolder("all")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              marginBottom: 4,
              background:
                activeFolder === "all"
                  ? `linear-gradient(135deg, ${T.navy}12, ${T.teal}12)`
                  : "transparent",
              boxShadow: activeFolder === "all" ? S.raised : "none",
            }}
          >
            <span
              className="material-icons-outlined"
              style={{
                fontSize: 18,
                color: activeFolder === "all" ? T.teal : T.gray400,
              }}
            >
              folder_open
            </span>
            <span
              style={{
                flex: 1,
                textAlign: "left",
                fontSize: 13,
                fontWeight: activeFolder === "all" ? 700 : 400,
                color: activeFolder === "all" ? T.navy : T.gray500,
              }}
            >
              All Files
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "1px 7px",
                borderRadius: 8,
                background: `${T.teal}14`,
                color: T.teal,
              }}
            >
              {scopedFiles.length}
            </span>
          </button>

          {tree.map((n) => renderNode(n))}
        </div>

        {/* File list */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span
              className="material-icons-outlined"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                color: focused ? T.teal : T.gray400,
                pointerEvents: "none",
              }}
            >
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search files…"
              style={{
                width: "100%",
                padding: "9px 14px 9px 38px",
                borderRadius: 10,
                fontSize: 13,
                fontFamily: "inherit",
                color: T.navy,
                background: T.white,
                border: focused
                  ? `2px solid ${T.teal}`
                  : `1.5px solid ${T.border}`,
                boxShadow: S.inset,
                outline: "none",
                boxSizing: "border-box",
                transition: "all 150ms",
              }}
            />
          </div>

          {/* File table */}
          <div
            style={{
              background: T.white,
              borderRadius: 16,
              boxShadow: S.card,
              overflow: "hidden",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "36px 1fr 80px 100px 100px 48px",
                padding: "10px 16px",
                background: T.gray50,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              {["", "Name", "Size", "Date", "Uploaded By", ""].map((h, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: T.gray500,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: T.gray400,
                  fontSize: 13,
                }}
              >
                {emptyMessage}
              </div>
            ) : grouped ? (
              grouped.map((group, gi) => (
                <div key={group.projectId}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      background: T.gray50,
                      borderTop: gi === 0 ? "none" : `1px solid ${T.border}`,
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: T.navy,
                      }}
                    >
                      {projectLabel(group.projectId)}
                    </span>
                    <Link
                      href={projectTabRoute(group.projectId, "files")}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: T.teal,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Open documents
                      <span className="material-icons-outlined" style={{ fontSize: 14 }}>
                        chevron_right
                      </span>
                    </Link>
                  </div>
                  {group.files.map((file, idx) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      isLast={
                        gi === grouped.length - 1 &&
                        idx === group.files.length - 1
                      }
                      showProject
                      folderCfg={liveCfg}
                    />
                  ))}
                </div>
              ))
            ) : (
              filtered.map((file, idx) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isLast={idx === filtered.length - 1}
                  folderCfg={liveCfg}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <FolderNameDialog
        open={folderDialog !== null}
        onOpenChange={(open) => {
          if (!open) setFolderDialog(null);
        }}
        title={
          folderDialog?.type === "create-sub" ? "New subfolder" : "New folder"
        }
        description={
          folderDialog?.type === "create-sub"
            ? `Create a subfolder in ${liveCfg[folderDialog.parentPath]?.label ?? "this folder"}.`
            : "Create a main folder for this project."
        }
        placeholder="Folder name"
        confirmLabel="Create"
        onSubmit={handleFolderSubmit}
      />
    </div>
  );
}

function FileRow({
  file,
  isLast,
  showProject = false,
  folderCfg = FOLDER_CFG,
}: {
  file: DocFile;
  isLast: boolean;
  showProject?: boolean;
  folderCfg?: Record<string, FolderCfg>;
}) {
  const [hov, setHov] = useState(false);
  const cfg = folderCfg[file.folder] ?? FOLDER_CFG[file.folder] ?? {
    label: file.folder,
    icon: "folder",
    color: T.gray500,
    bg: T.gray100,
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 80px 100px 100px 48px",
        padding: "12px 16px",
        alignItems: "center",
        background: hov ? `rgba(14,124,134,0.03)` : T.white,
        borderBottom: isLast ? "none" : `1px solid ${T.border}`,
        transition: "background 150ms",
        cursor: "pointer",
      }}
    >
      {/* Type chip */}
      <div>
        <FileTypeChip type={file.type} />
      </div>

      {/* Name */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: T.navy,
            marginBottom: 2,
          }}
        >
          {file.name}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            color: cfg.color,
            background: cfg.bg,
            padding: "1px 8px",
            borderRadius: 6,
          }}
        >
          <span
            className="material-icons-outlined"
            style={{ fontSize: 10 }}
          >
            {cfg.icon}
          </span>
          {cfg.label}
        </div>
        {showProject && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              color: T.gray500,
              marginLeft: 6,
            }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 11 }}>
              folder_open
            </span>
            {projectLabel(file.projectId)}
          </div>
        )}
      </div>

      {/* Size */}
      <div style={{ fontSize: 12, color: T.gray500 }}>{file.size}</div>

      {/* Date */}
      <div style={{ fontSize: 12, color: T.gray500 }}>{file.date}</div>

      {/* Uploader */}
      <div>
        <Avatar
          initials={file.uploader.initials}
          color={file.uploader.color}
          size={26}
        />
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 4,
          opacity: hov ? 1 : 0,
          transition: "opacity 150ms",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            borderRadius: 6,
            color: T.teal,
            display: "flex",
          }}
        >
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>
            download
          </span>
        </button>
      </div>
    </div>
  );
}

// ── PHOTO GALLERY ─────────────────────────────────────────────────────────────
function PhotoGallery({ projectFilter }: { projectFilter: string }) {
  const [filter, setFilter] = useState<"all" | GalleryPhotoCategory>("all");
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  const scoped = GALLERY_PHOTOS.filter((p) =>
    matchesProject(p.projectId, projectFilter),
  );
  const filtered =
    filter === "all" ? scoped : scoped.filter((p) => p.category === filter);

  const grouped = filtered.reduce<Record<string, GalleryPhoto[]>>((acc, p) => {
    (acc[p.month] ??= []).push(p);
    return acc;
  }, {});
  const months = Object.keys(grouped);

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
            Photo Gallery
          </h1>
          <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
            {projectFilterSubtitle(
              projectFilter,
              "Site pictures, work in progress, and completion photos",
            )}
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <GradBtn label="Upload Photos" icon="add_a_photo" small />
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

      {months.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: T.gray400,
            fontSize: 13,
          }}
        >
          No photos for this project.
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
                onClick={() => setLightbox(photo)}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  cursor: "zoom-in",
                  boxShadow: S.card,
                  position: "relative",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.category}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
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
                  <span style={{ fontSize: 11, color: "white", fontWeight: 600 }}>
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
    </div>
  );
}

// ── GLOBAL SEARCH ─────────────────────────────────────────────────────────────
function GlobalSearch({
  projectFilter,
  meetings,
}: {
  projectFilter: string;
  meetings: MeetingMinute[];
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const fileResults =
    query.length > 1
      ? MOCK_FILES.filter(
          (f) =>
            matchesProject(f.projectId, projectFilter) &&
            (f.name.toLowerCase().includes(query.toLowerCase()) ||
              (FOLDER_CFG[f.folder]?.label ?? "")
                .toLowerCase()
                .includes(query.toLowerCase())),
        )
      : [];
  const minuteResults =
    query.length > 1
      ? meetings.filter(
          (m) =>
            matchesProject(m.projectId, projectFilter) &&
            `${m.title} ${m.preview} ${m.keyDecisions}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
      : [];

  return (
    <div style={{ padding: "40px 40px" }}>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: T.navy,
          margin: "0 0 4px",
        }}
      >
        Search Documents
      </h1>
      <p style={{ fontSize: 12, color: T.gray500, margin: "0 0 28px" }}>
        {projectFilterSubtitle(
          projectFilter,
          "Search across all files, photos, and meeting minutes",
        )}
      </p>

      {/* Large search bar */}
      <div style={{ position: "relative", maxWidth: 580, marginBottom: 24 }}>
        <span
          className="material-icons-outlined"
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 22,
            color: focused ? T.teal : T.gray400,
            pointerEvents: "none",
          }}
        >
          search
        </span>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search files, photos, minutes…"
          style={{
            width: "100%",
            padding: "14px 16px 14px 52px",
            borderRadius: 14,
            fontSize: 15,
            fontFamily: "inherit",
            color: T.navy,
            background: T.white,
            border: focused
              ? `2px solid ${T.teal}`
              : `1.5px solid ${T.border}`,
            boxShadow: focused ? `0 0 0 4px ${T.teal}18` : S.card,
            outline: "none",
            boxSizing: "border-box",
            transition: "all 200ms",
          }}
        />
      </div>

      {query.length > 1 && fileResults.length === 0 && minuteResults.length === 0 && (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: T.gray400,
            fontSize: 13,
          }}
        >
          No results for &quot;{query}&quot;
        </div>
      )}

      {fileResults.length > 0 && (
        <div
          style={{
            background: T.white,
            borderRadius: 16,
            boxShadow: S.card,
            overflow: "hidden",
            maxWidth: 580,
          }}
        >
          {fileResults.map((file, idx) => (
            <div
              key={file.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 18px",
                borderBottom:
                  idx < fileResults.length - 1 ? `1px solid ${T.border}` : "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = `rgba(14,124,134,0.04)`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = T.white)
              }
            >
              <FileTypeChip type={file.type} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.navy,
                    marginBottom: 2,
                  }}
                >
                  {file.name}
                </div>
                <div style={{ fontSize: 11, color: T.gray400 }}>
                  {(FOLDER_CFG[file.folder]?.label ?? file.folder)}
                  {projectFilter === "all" ? ` · ${projectLabel(file.projectId)}` : ""}
                  {" · "}
                  {file.date}
                </div>
              </div>
              <span
                className="material-icons-outlined"
                style={{ fontSize: 16, color: T.gray400 }}
              >
                chevron_right
              </span>
            </div>
          ))}
        </div>
      )}

      {minuteResults.length > 0 && (
        <div
          style={{
            background: T.white,
            borderRadius: 16,
            boxShadow: S.card,
            overflow: "hidden",
            maxWidth: 580,
            marginTop: 16,
          }}
        >
          {minuteResults.map((m, idx) => (
            <div
              key={m.id}
              style={{
                padding: "13px 18px",
                borderBottom: idx < minuteResults.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{m.title}</div>
              <div style={{ fontSize: 11, color: T.gray400 }}>
                Minutes
                {projectFilter === "all" ? ` · ${projectLabel(m.projectId)}` : ""}
                {" · "}
                {m.date}
              </div>
              <div style={{ fontSize: 12, color: T.gray500, marginTop: 4 }}>{m.keyDecisions}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
// Alias for existing import in app/(dashboard)/files/page.tsx
export { DocumentsWorkspace as GlobalFilesPage };

export function DocumentsWorkspace() {
  const [view, setView] = useState<DocsView>("files");
  const [meetings, setMeetings] = useState<MeetingMinute[]>(() => [...MOCK_MEETINGS]);
  const [selectedMeeting, setSelectedMeeting] =
    useState<MeetingMinute | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");

  function handleProjectFilter(id: string) {
    setProjectFilter(id);
    if (selectedMeeting && id !== "all" && selectedMeeting.projectId !== id) {
      setSelectedMeeting(null);
      setIsCreating(false);
    }
  }

  function handleSaveMinute(minute: MeetingMinute) {
    setMeetings((prev) => {
      const exists = prev.some((m) => m.id === minute.id);
      if (exists) return prev.map((m) => (m.id === minute.id ? minute : m));
      return [minute, ...prev];
    });
    setSelectedMeeting(minute);
    setIsCreating(false);
  }

  const showEditor = view === "minutes-list" && (isCreating || selectedMeeting);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        fontFamily: "inherit",
      }}
    >
      <TabBar
        view={view}
        setView={(v) => {
          setView(v);
          setSelectedMeeting(null);
          setIsCreating(false);
        }}
      />
      <ProjectFilterBar
        projectFilter={projectFilter}
        onChange={handleProjectFilter}
      />

      <div style={{ flex: 1 }}>
        {view === "files" && <FileBrowser projectFilter={projectFilter} />}
        {view === "gallery" && <PhotoGallery projectFilter={projectFilter} />}
        {showEditor && (
          <MeetingEntry
            key={isCreating ? "create" : selectedMeeting?.id}
            meeting={isCreating ? null : selectedMeeting}
            projectFilter={projectFilter}
            onBack={() => {
              setSelectedMeeting(null);
              setIsCreating(false);
            }}
            onSave={handleSaveMinute}
          />
        )}
        {view === "minutes-list" && !showEditor && (
          <MeetingsList
            meetings={meetings}
            projectFilter={projectFilter}
            onOpenEntry={(m) => {
              setIsCreating(false);
              setSelectedMeeting(m);
            }}
            onNewMinutes={() => {
              setSelectedMeeting(null);
              setIsCreating(true);
            }}
          />
        )}
        {view === "search" && (
          <GlobalSearch projectFilter={projectFilter} meetings={meetings} />
        )}
      </div>
    </div>
  );
}
