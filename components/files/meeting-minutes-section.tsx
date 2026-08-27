"use client";

import { useMemo, useRef, useState } from "react";
import { DemoCaption } from "@/components/demo/demo-caption";
import {
  FOLDER_CFG,
  MOCK_FILES,
  type DocFile,
  type MeetingAttachment,
  type MeetingAttachmentKind,
  type MeetingMinute,
} from "@/lib/files/mock-documents";
import {
  getActiveProject,
  getAllActiveProjects,
} from "@/lib/projects/mock-projects";

const T = {
  navy: "#1B2A4A",
  teal: "#0E7C86",
  alert: "#F26D6D",
  border: "#E5E7EB",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
};

const S = {
  raised:
    "6px 6px 14px rgba(163,177,198,0.45), -4px -4px 10px rgba(255,255,255,0.90)",
  raisedHover:
    "9px 9px 20px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.95)",
  card: "8px 8px 20px rgba(163,177,198,0.40), -6px -6px 14px rgba(255,255,255,0.95)",
  inset:
    "inset 3px 3px 8px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.90)",
};

const MINUTE_DOC_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectMinuteDocKind(file: File): MeetingAttachmentKind | null {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return "word";
  }
  return null;
}

function attachmentFromUpload(file: File): MeetingAttachment | null {
  const kind = detectMinuteDocKind(file);
  if (!kind) return null;
  return {
    id: `upload-${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    name: file.name,
    kind,
    size: formatBytes(file.size),
    url: URL.createObjectURL(file),
    source: "upload",
  };
}

function attachmentFromDocFile(file: DocFile): MeetingAttachment {
  const name = file.name.toLowerCase();
  const kind: MeetingAttachmentKind =
    name.endsWith(".doc") || name.endsWith(".docx") ? "word" : "pdf";
  return {
    id: `import-${file.id}-${crypto.randomUUID()}`,
    name: file.name,
    kind,
    size: file.size,
    url: file.url,
    source: "import",
  };
}

function resolveMinuteType(
  attachments: MeetingAttachment[],
  fallback: MeetingMinute["type"] = "typed",
): MeetingMinute["type"] {
  if (attachments.some((a) => a.kind === "word")) return "word";
  if (attachments.some((a) => a.kind === "pdf")) return "pdf";
  return fallback;
}

function formatMeetingDate(d = new Date()) {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

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
      type="button"
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

function MinuteAttachmentsPanel({
  attachments,
  projectFilter,
  onChange,
}: {
  attachments: MeetingAttachment[];
  projectFilter: string;
  onChange: (next: MeetingAttachment[]) => void;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importable = useMemo(() => {
    return MOCK_FILES.filter((f) => {
      if (!matchesProject(f.projectId, projectFilter)) return false;
      const name = f.name.toLowerCase();
      return (
        f.type === "pdf" ||
        name.endsWith(".pdf") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx")
      );
    });
  }, [projectFilter]);

  const addUploads = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (incoming.length === 0) return;
    const added: MeetingAttachment[] = [];
    const rejected: string[] = [];
    for (const file of incoming) {
      const att = attachmentFromUpload(file);
      if (att) added.push(att);
      else rejected.push(file.name);
    }
    if (added.length > 0) onChange([...attachments, ...added]);
    setError(
      rejected.length > 0
        ? `Unsupported file: ${rejected.join(", ")}. Use PDF or Word (.doc, .docx).`
        : null,
    );
  };

  const importDoc = (file: DocFile) => {
    if (attachments.some((a) => a.name === file.name && a.source === "import")) {
      setError(`${file.name} is already attached.`);
      return;
    }
    onChange([...attachments, attachmentFromDocFile(file)]);
    setError(null);
    setShowImport(false);
  };

  const removeAttachment = (id: string) => {
    const removed = attachments.find((a) => a.id === id);
    if (removed?.url?.startsWith("blob:")) URL.revokeObjectURL(removed.url);
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
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
          attach_file
        </span>
        Documents (PDF / Word)
      </div>

      <p style={{ fontSize: 12, color: T.gray500, margin: "0 0 14px" }}>
        Upload PDF or Word files, or import an existing document from the project
        files library.
      </p>

      {attachments.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {attachments.map((att) => (
            <div
              key={att.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.gray50,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: att.kind === "pdf" ? "#FEE2E2" : "#E0E7FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{
                    fontSize: 18,
                    color: att.kind === "pdf" ? "#EF4444" : T.navy,
                  }}
                >
                  {att.kind === "pdf" ? "picture_as_pdf" : "description"}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.navy,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {att.name}
                </div>
                <div style={{ fontSize: 11, color: T.gray400, marginTop: 2 }}>
                  {att.kind.toUpperCase()}
                  {att.size ? ` · ${att.size}` : ""}
                  {` · ${att.source === "import" ? "Imported" : "Uploaded"}`}
                </div>
              </div>
              {att.url && (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.teal,
                    textDecoration: "none",
                  }}
                >
                  Open
                </a>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.gray400,
                  padding: 4,
                  display: "flex",
                }}
                aria-label={`Remove ${att.name}`}
              >
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={uploadRef}
        type="file"
        accept={MINUTE_DOC_ACCEPT}
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) addUploads(e.target.files);
          e.target.value = "";
        }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 14px",
            borderRadius: 10,
            border: `1.5px dashed ${T.teal}`,
            background: "#F0FDFA",
            color: T.teal,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>
            upload_file
          </span>
          Upload PDF / Word
        </button>
        <button
          type="button"
          onClick={() => setShowImport((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 14px",
            borderRadius: 10,
            border: `1.5px solid ${T.border}`,
            background: T.white,
            color: T.navy,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>
            drive_folder_upload
          </span>
          Import from files
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 10, fontSize: 12, color: T.alert }}>{error}</div>
      )}

      {showImport && (
        <div
          style={{
            marginTop: 14,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            maxHeight: 220,
            overflowY: "auto",
            background: T.gray50,
          }}
        >
          {importable.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12, color: T.gray400 }}>
              No PDF or Word documents available for this project filter.
            </div>
          ) : (
            importable.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => importDoc(file)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  border: "none",
                  borderBottom: `1px solid ${T.border}`,
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{ fontSize: 18, color: "#EF4444" }}
                >
                  picture_as_pdf
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.navy,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </div>
                  <div style={{ fontSize: 11, color: T.gray400 }}>
                    {FOLDER_CFG[file.folder]?.label ?? file.folder} · {file.size}
                    {projectFilter === "all"
                      ? ` · ${projectLabel(file.projectId)}`
                      : ""}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.teal }}>
                  Add
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function MeetingsList({
  meetings,
  onOpenEntry,
  onNewMinutes,
  projectFilter,
}: {
  meetings: MeetingMinute[];
  onOpenEntry: (m: MeetingMinute) => void;
  onNewMinutes: () => void;
  projectFilter: string;
}) {
  const [q, setQ] = useState("");
  const typeIcon: Record<MeetingMinute["type"], string> = {
    typed: "edit_note",
    pdf: "picture_as_pdf",
    word: "description",
    audio: "mic",
  };
  const typeColor: Record<MeetingMinute["type"], string> = {
    typed: T.teal,
    pdf: "#EF4444",
    word: "#1B2A4A",
    audio: "#D97706",
  };

  const filtered = meetings.filter((m) => {
    if (!matchesProject(m.projectId, projectFilter)) return false;
    if (!q.trim()) return true;
    const hay = `${m.title} ${m.preview} ${m.keyDecisions}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

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
            {projectFilterSubtitle(
              projectFilter,
              "Client & team meeting records",
            )}
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <GradBtn label="New Minutes" icon="add" small onClick={onNewMinutes} />
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search minutes, decisions, notes…"
        style={{
          width: "100%",
          maxWidth: 420,
          marginBottom: 18,
          padding: "10px 14px",
          borderRadius: 10,
          border: `1.5px solid ${T.border}`,
          fontFamily: "inherit",
          fontSize: 13,
          boxShadow: S.inset,
          outline: "none",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: T.gray400,
              fontSize: 13,
            }}
          >
            No minutes for this project. Click &quot;New Minutes&quot; to add one.
          </div>
        ) : (
          filtered.map((m) => (
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
                    {projectFilter === "all" && (
                      <>
                        <span style={{ color: T.gray400 }}>·</span>
                        {projectLabel(m.projectId)}
                      </>
                    )}
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
                  margin: "0 0 10px",
                }}
              >
                {m.preview}
              </p>
              {m.keyDecisions && (
                <div
                  style={{
                    fontSize: 12,
                    color: T.navy,
                    background: "#F0FDFA",
                    borderRadius: 10,
                    padding: "8px 12px",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontWeight: 700, color: T.teal }}>
                    Key decisions:{" "}
                  </span>
                  {m.keyDecisions}
                </div>
              )}

              {(m.attachments?.length ?? 0) > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 12,
                    fontSize: 11,
                    color: T.gray500,
                  }}
                >
                  <span
                    className="material-icons-outlined"
                    style={{ fontSize: 14, color: T.teal }}
                  >
                    attach_file
                  </span>
                  {m.attachments!.length} attached document
                  {m.attachments!.length === 1 ? "" : "s"}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: T.gray400 }}>Attendees:</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {m.attendees.map((a) => (
                    <Avatar
                      key={`${a.initials}-${a.name}`}
                      initials={a.initials}
                      color={a.color}
                      size={24}
                      title={a.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function MeetingEntry({
  meeting,
  projectFilter,
  onBack,
  onSave,
}: {
  meeting: MeetingMinute | null;
  projectFilter: string;
  onBack: () => void;
  onSave: (minute: MeetingMinute) => void;
}) {
  const isCreate = meeting === null;
  const [title, setTitle] = useState(meeting?.title ?? "");
  const [date, setDate] = useState(meeting?.date ?? formatMeetingDate());
  const [attendeeText, setAttendeeText] = useState(
    meeting?.attendees.map((a) => a.name).join(", ") ?? "Priya Nair",
  );
  const [notes, setNotes] = useState(meeting?.preview ?? "");
  const [notesFocused, setNotesFocused] = useState(false);
  const [decisions, setDecisions] = useState(meeting?.keyDecisions ?? "");
  const [decisionsFocused, setDecisionsFocused] = useState(false);
  const [attachments, setAttachments] = useState<MeetingAttachment[]>(
    meeting?.attachments ?? [],
  );
  const [actionItems, setActionItems] = useState(
    isCreate
      ? ([] as { id: number; text: string; assignee: string; dueDate: string }[])
      : [
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
        ],
  );
  const [titleError, setTitleError] = useState<string | null>(null);

  function handleSave() {
    if (!title.trim()) {
      setTitleError("Please enter a meeting title");
      return;
    }
    setTitleError(null);

    const attendees = attendeeText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name, i) => ({
        name,
        initials: initialsFromName(name),
        color: ["#7C3AED", "#0891B2", "#EC4899", "#D97706", "#059669"][i % 5],
      }));

    const resolvedProjectId =
      meeting?.projectId ??
      (projectFilter !== "all"
        ? projectFilter
        : getAllActiveProjects()[0]?.id ?? "mock-1");

    const next: MeetingMinute = {
      id: meeting?.id ?? Date.now(),
      title: title.trim(),
      date: date.trim() || formatMeetingDate(),
      attendees:
        attendees.length > 0
          ? attendees
          : [{ initials: "PN", color: "#7C3AED", name: "Priya Nair" }],
      type: resolveMinuteType(attachments, meeting?.type ?? "typed"),
      preview: notes.trim() || "No notes recorded.",
      keyDecisions: decisions.trim(),
      projectId: resolvedProjectId,
      attachments,
    };
    onSave(next);
  }

  const attachmentProjectFilter =
    meeting?.projectId ?? (projectFilter !== "all" ? projectFilter : "all");

  return (
    <div style={{ padding: "28px 40px", maxWidth: 860 }}>
      <button
        type="button"
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

      <div
        style={{
          background: T.white,
          borderRadius: 16,
          padding: "22px 24px",
          boxShadow: S.card,
          marginBottom: 16,
        }}
      >
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(null);
          }}
          placeholder="Meeting title"
          style={{
            width: "100%",
            fontSize: 20,
            fontWeight: 700,
            color: T.navy,
            margin: "0 0 12px",
            border: "none",
            outline: "none",
            fontFamily: "inherit",
            background: "transparent",
            boxSizing: "border-box",
          }}
        />
        {titleError && (
          <div style={{ fontSize: 12, color: T.alert, marginBottom: 10 }}>
            {titleError}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: T.gray400,
                display: "block",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Date
            </label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="22 Jul 2026"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                border: `1.5px solid ${T.border}`,
                fontSize: 13,
                fontFamily: "inherit",
                color: T.navy,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: T.gray400,
                display: "block",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Attendees
            </label>
            <input
              value={attendeeText}
              onChange={(e) => setAttendeeText(e.target.value)}
              placeholder="Comma-separated names"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                border: `1.5px solid ${T.border}`,
                fontSize: 13,
                fontFamily: "inherit",
                color: T.navy,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      <MinuteAttachmentsPanel
        attachments={attachments}
        projectFilter={attachmentProjectFilter}
        onChange={setAttachments}
      />

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
            gavel
          </span>
          Key Decisions
        </div>
        <textarea
          value={decisions}
          onChange={(e) => setDecisions(e.target.value)}
          onFocus={() => setDecisionsFocused(true)}
          onBlur={() => setDecisionsFocused(false)}
          rows={4}
          placeholder="Record key decisions…"
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
            border: decisionsFocused
              ? `2px solid ${T.teal}`
              : `1.5px solid ${T.border}`,
            boxShadow: S.inset,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

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
            justifyContent: "space-between",
            gap: 7,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              className="material-icons-outlined"
              style={{ fontSize: 16, color: T.teal }}
            >
              task_alt
            </span>
            Action Items ({actionItems.length})
          </div>
          <button
            type="button"
            onClick={() =>
              setActionItems((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  text: "",
                  assignee: "",
                  dueDate: formatMeetingDate(),
                },
              ])
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: T.gray500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span className="material-icons-outlined" style={{ fontSize: 14 }}>
              add
            </span>
            Add item
          </button>
        </div>
        {actionItems.length === 0 ? (
          <div style={{ fontSize: 13, color: T.gray400 }}>
            No action items yet.
          </div>
        ) : (
          actionItems.map((item, i) => (
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
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <input
                  value={item.text}
                  onChange={(e) =>
                    setActionItems((prev) =>
                      prev.map((a) =>
                        a.id === item.id ? { ...a, text: e.target.value } : a,
                      ),
                    )
                  }
                  placeholder="Action item"
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    color: T.navy,
                    fontFamily: "inherit",
                    background: "transparent",
                    width: "100%",
                  }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    value={item.assignee}
                    onChange={(e) =>
                      setActionItems((prev) =>
                        prev.map((a) =>
                          a.id === item.id
                            ? { ...a, assignee: e.target.value }
                            : a,
                        ),
                      )
                    }
                    placeholder="Assignee"
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: 11,
                      color: T.gray400,
                      fontFamily: "inherit",
                      background: "transparent",
                      flex: 1,
                    }}
                  />
                  <input
                    value={item.dueDate}
                    onChange={(e) =>
                      setActionItems((prev) =>
                        prev.map((a) =>
                          a.id === item.id
                            ? { ...a, dueDate: e.target.value }
                            : a,
                        ),
                      )
                    }
                    placeholder="Due date"
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: 11,
                      color: T.gray400,
                      fontFamily: "inherit",
                      background: "transparent",
                      width: 110,
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setActionItems((prev) => prev.filter((a) => a.id !== item.id))
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.gray400,
                  padding: 4,
                  display: "flex",
                }}
              >
                <span className="material-icons-outlined" style={{ fontSize: 18 }}>
                  delete
                </span>
              </button>
            </div>
          ))
        )}
      </div>

      <GradBtn
        label={isCreate ? "Publish Minutes" : "Save Minutes"}
        icon="save"
        onClick={handleSave}
      />
    </div>
  );
}
