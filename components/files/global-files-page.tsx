"use client";

import { useState } from "react";
import { DemoCaption } from "@/components/demo/demo-caption";
import {
  FOLDER_CFG,
  GALLERY_PHOTOS,
  MOCK_FILES,
  MOCK_MEETINGS,
  type DocFile,
  type FolderType,
  type GalleryPhoto,
  type MeetingMinute,
} from "@/lib/files/mock-documents";

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

// ── FILES BROWSER ─────────────────────────────────────────────────────────────
function FileBrowser() {
  const [activeFolder, setActiveFolder] = useState<FolderType | "all">("all");
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const folderTypes = Object.keys(FOLDER_CFG) as FolderType[];
  const folderCounts = folderTypes.reduce(
    (acc, f) => {
      acc[f] = MOCK_FILES.filter((file) => file.folder === f).length;
      return acc;
    },
    {} as Record<FolderType, number>
  );

  const filtered = MOCK_FILES.filter((f) => {
    const matchFolder = activeFolder === "all" || f.folder === activeFolder;
    const matchSearch =
      !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  });

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
            Marchetti Villa · All project files
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <GradBtn label="Upload File" icon="upload" small />
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Sidebar folders */}
        <div style={{ width: 220, flexShrink: 0 }}>
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
              {MOCK_FILES.length}
            </span>
          </button>

          {folderTypes.map((f) => {
            const cfg = FOLDER_CFG[f];
            const active = activeFolder === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
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
                  background: active
                    ? `${cfg.color}10`
                    : "transparent",
                  boxShadow: active ? S.raised : "none",
                  transition: "all 150ms",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: cfg.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-icons-outlined"
                    style={{ fontSize: 16, color: cfg.color }}
                  >
                    {cfg.icon}
                  </span>
                </div>
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: active ? 700 : 400,
                    color: active ? cfg.color : T.gray500,
                  }}
                >
                  {cfg.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "1px 7px",
                    borderRadius: 8,
                    background: active ? cfg.bg : T.gray100,
                    color: active ? cfg.color : T.gray400,
                  }}
                >
                  {folderCounts[f]}
                </span>
              </button>
            );
          })}
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
                No files in this folder.
              </div>
            ) : (
              filtered.map((file, idx) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isLast={idx === filtered.length - 1}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileRow({
  file,
  isLast,
}: {
  file: DocFile;
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  const cfg = FOLDER_CFG[file.folder];

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
function PhotoGallery() {
  const [filter, setFilter] = useState<
    "all" | "moodboards" | "swatches" | "site"
  >("all");
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  const filtered =
    filter === "all"
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === filter);

  // Split into 3 masonry columns
  const cols: GalleryPhoto[][] = [[], [], []];
  filtered.forEach((p, i) => cols[i % 3].push(p));

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
            Mood boards, swatches, and site documentation
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
            { id: "moodboards", label: "Mood Boards" },
            { id: "swatches", label: "Swatches" },
            { id: "site", label: "Site Photos" },
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

      {/* Masonry grid */}
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

// ── MEETING MINUTES LIST ──────────────────────────────────────────────────────
function MeetingsList({
  onOpenEntry,
}: {
  onOpenEntry: (m: MeetingMinute) => void;
}) {
  const typeIcon = {
    typed: "edit_note",
    pdf: "picture_as_pdf",
    audio: "mic",
  };
  const typeColor = {
    typed: T.teal,
    pdf: "#EF4444",
    audio: "#D97706",
  };

  return (
    <div style={{ padding: "28px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
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
            Meeting Minutes
          </h1>
          <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
            Marchetti Villa · Client & team meeting records
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <GradBtn label="New Minutes" icon="add" small />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {MOCK_MEETINGS.map((m) => (
          <div
            key={m.id}
            onClick={() => onOpenEntry(m)}
            style={{
              background: T.white,
              borderRadius: 16,
              padding: "20px 22px",
              boxShadow: S.card,
              cursor: "pointer",
              transition: "transform 150ms, box-shadow 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "10px 10px 24px rgba(163,177,198,0.50), -8px -8px 18px rgba(255,255,255,0.98)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = S.card;
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: T.navy,
                    marginBottom: 4,
                  }}
                >
                  {m.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: T.gray500,
                  }}
                >
                  <span
                    className="material-icons-outlined"
                    style={{ fontSize: 14 }}
                  >
                    event
                  </span>
                  {m.date}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 10,
                  background: `${typeColor[m.type]}14`,
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{ fontSize: 14, color: typeColor[m.type] }}
                >
                  {typeIcon[m.type]}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: typeColor[m.type],
                    textTransform: "capitalize",
                  }}
                >
                  {m.type}
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: 13,
                color: T.gray500,
                lineHeight: 1.5,
                margin: "0 0 14px",
              }}
            >
              {m.preview}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: T.gray400 }}>Attendees:</span>
              <div style={{ display: "flex", gap: 4 }}>
                {m.attendees.map((a) => (
                  <Avatar
                    key={a.initials}
                    initials={a.initials}
                    color={a.color}
                    size={24}
                    title={a.name}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MEETING ENTRY EDITOR ──────────────────────────────────────────────────────
function MeetingEntry({
  meeting,
  onBack,
}: {
  meeting: MeetingMinute;
  onBack: () => void;
}) {
  const [notes, setNotes] = useState(meeting.preview);
  const [notesFocused, setNotesFocused] = useState(false);
  const [actionItems] = useState([
    {
      id: 1,
      text: "Confirm ceiling height with structural engineer",
      assignee: "Ashan Perera",
      dueDate: "02 Aug 2026",
    },
    {
      id: 2,
      text: "Update stone feature wall width in drawings",
      assignee: "Dilani Silva",
      dueDate: "05 Aug 2026",
    },
  ]);

  return (
    <div style={{ padding: "28px 40px", maxWidth: 860 }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 12,
          color: T.gray500,
          marginBottom: 20,
          padding: 0,
        }}
      >
        <span className="material-icons-outlined" style={{ fontSize: 16 }}>
          arrow_back
        </span>
        Back to Minutes
      </button>

      {/* Title */}
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "22px 24px",
          boxShadow: S.card,
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: T.navy,
            margin: "0 0 8px",
          }}
        >
          {meeting.title}
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: T.gray500,
            }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 14 }}>
              event
            </span>
            {meeting.date}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {meeting.attendees.map((a) => (
              <Avatar
                key={a.initials}
                initials={a.initials}
                color={a.color}
                size={24}
                title={a.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Notes area */}
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "22px 24px",
          boxShadow: S.card,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.navy,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <span
            className="material-icons-outlined"
            style={{ fontSize: 16, color: T.teal }}
          >
            notes
          </span>
          Meeting Notes
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onFocus={() => setNotesFocused(true)}
          onBlur={() => setNotesFocused(false)}
          rows={8}
          placeholder="Type meeting notes here…"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            fontSize: 13,
            fontFamily: "inherit",
            color: T.navy,
            background: T.white,
            lineHeight: 1.7,
            resize: "vertical",
            border: notesFocused
              ? `2px solid ${T.teal}`
              : `1.5px solid ${T.border}`,
            boxShadow: S.inset,
            outline: "none",
            boxSizing: "border-box",
            transition: "all 150ms",
          }}
        />
      </div>

      {/* Action items */}
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "22px 24px",
          boxShadow: S.card,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.navy,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <span
            className="material-icons-outlined"
            style={{ fontSize: 16, color: T.teal }}
          >
            task_alt
          </span>
          Action Items ({actionItems.length})
        </div>
        {actionItems.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderBottom:
                i < actionItems.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: `2px solid ${T.border}`,
                flexShrink: 0,
                boxShadow: S.inset,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: T.navy,
                  marginBottom: 2,
                }}
              >
                {item.text}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.gray400,
                  display: "flex",
                  gap: 10,
                }}
              >
                <span>{item.assignee}</span>
                <span>Due {item.dueDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GradBtn label="Save Minutes" icon="save" />
    </div>
  );
}

// ── GLOBAL SEARCH ─────────────────────────────────────────────────────────────
function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results =
    query.length > 1
      ? MOCK_FILES.filter(
          (f) =>
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            FOLDER_CFG[f.folder].label
              .toLowerCase()
              .includes(query.toLowerCase())
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
        Search across all files, photos, and meeting minutes
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

      {query.length > 1 && results.length === 0 && (
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

      {results.length > 0 && (
        <div
          style={{
            background: T.white,
            borderRadius: 16,
            boxShadow: S.card,
            overflow: "hidden",
            maxWidth: 580,
          }}
        >
          {results.map((file, idx) => (
            <div
              key={file.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 18px",
                borderBottom:
                  idx < results.length - 1 ? `1px solid ${T.border}` : "none",
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
                  {FOLDER_CFG[file.folder].label} · {file.date}
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
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
// Alias for existing import in app/(dashboard)/files/page.tsx
export { DocumentsWorkspace as GlobalFilesPage };

export function DocumentsWorkspace() {
  const [view, setView] = useState<DocsView>("files");
  const [selectedMeeting, setSelectedMeeting] =
    useState<MeetingMinute | null>(null);

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
        }}
      />

      <div style={{ flex: 1 }}>
        {view === "files" && <FileBrowser />}
        {view === "gallery" && <PhotoGallery />}
        {view === "minutes-list" && selectedMeeting && (
          <MeetingEntry
            meeting={selectedMeeting}
            onBack={() => setSelectedMeeting(null)}
          />
        )}
        {view === "minutes-list" && !selectedMeeting && (
          <MeetingsList onOpenEntry={(m) => setSelectedMeeting(m)} />
        )}
        {view === "search" && <GlobalSearch />}
      </div>
    </div>
  );
}
