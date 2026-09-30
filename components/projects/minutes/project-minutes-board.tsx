"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, FileText, Mic, Plus, Trash2, Upload, X as XIcon } from "lucide-react";
import { toast } from "sonner";

import { useProjectMeetingMinutes } from "@/hooks/use-project-meeting-minutes";
import { useProjectMembers } from "@/hooks/use-project-members";
import { getUserDisplayName } from "@/lib/user/display";
import { useAuthStore } from "@/stores/auth-store";
import type { MeetingActionItem, MeetingMinute } from "@/types/meeting-minutes";

type Mode = "detail" | "create" | "edit";

interface EditAction {
  id: string;
  text: string;
  assignee: string;
  done: boolean;
}

interface EditAttachment {
  id: string;
  name: string;
  url?: string;
  /** Set for files already attached to the saved minute. */
  existingId?: string;
  /** Set for a freshly uploaded (floating) file. */
  token?: string;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function toDateInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function attachmentNameFromUrl(url: string, fallback: string): string {
  try {
    const path = new URL(url, "http://x").pathname;
    const last = path.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : fallback;
  } catch {
    return fallback;
  }
}

export function ProjectMinutesBoard({ projectId }: { projectId: string }) {
  const {
    minutes,
    isLoading,
    error,
    canManage,
    createMinute,
    updateMinute,
    removeMinute,
    setActionItemStatus,
    actionItemUpdating,
    uploadAudio,
    uploadAttachment,
  } = useProjectMeetingMinutes(projectId);

  const currentUser = useAuthStore((s) => s.session?.user ?? null);
  const currentUserName = currentUser ? getUserDisplayName(currentUser) : "";

  const { members } = useProjectMembers();
  const memberNames = useMemo(() => {
    const names = members
      .filter((m) => m.status === "ACTIVE")
      .map((m) => {
        const a = m.assignee;
        if (!a) return "";
        const first = a.firstName ?? a.first_name ?? "";
        const last = a.lastName ?? a.last_name ?? "";
        return [first, last].filter(Boolean).join(" ").trim() || a.email || "";
      })
      .filter(Boolean);
    return Array.from(new Set(names));
  }, [members]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("detail");

  // Editor state
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editAttendees, setEditAttendees] = useState<string[]>([]);
  const [editBody, setEditBody] = useState("");
  const [editActions, setEditActions] = useState<EditAction[]>([]);
  const [editAudio, setEditAudio] = useState<EditAttachment | null>(null);
  const [editPdfs, setEditPdfs] = useState<EditAttachment[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    if (mode !== "detail") return;
    if (minutes.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !minutes.some((m) => m.id === selectedId)) {
      setSelectedId(minutes[0].id);
    }
  }, [minutes, selectedId, mode]);

  const selected = useMemo(
    () => minutes.find((m) => m.id === selectedId) ?? null,
    [minutes, selectedId]
  );

  function openCreate() {
    setEditTitle("");
    setEditDate(new Date().toISOString().slice(0, 10));
    setEditAttendees(currentUserName ? [currentUserName] : []);
    setEditBody("");
    setEditActions([]);
    setEditAudio(null);
    setEditPdfs([]);
    setMode("create");
  }

  function openEdit(m: MeetingMinute) {
    setEditTitle(m.title);
    setEditDate(toDateInput(m.meetingDate));
    setEditAttendees(m.attendees.filter(Boolean));
    setEditBody(m.body ?? "");
    setEditActions(
      (m.actionItems ?? []).map((a, i) => ({
        id: `ea-${i}`,
        text: a.text,
        assignee: a.assignee === "Unassigned" ? "" : a.assignee,
        done: a.status === "COMPLETED",
      }))
    );
    const audio = m.audio_files?.[0];
    setEditAudio(
      audio
        ? {
            id: audio.id,
            name: attachmentNameFromUrl(audio.url, "Audio recording"),
            url: audio.url,
            existingId: audio.id,
          }
        : null,
    );
    setEditPdfs(
      (m.pdf_files ?? []).map((pdf) => ({
        id: pdf.id,
        name: attachmentNameFromUrl(pdf.url, "Document.pdf"),
        url: pdf.url,
        existingId: pdf.id,
      })),
    );
    setMode("edit");
  }

  function cancelEditor() {
    setMode("detail");
  }

  async function publish() {
    if (isSaving) return;
    const attendeeList = editAttendees.map((s) => s.trim()).filter(Boolean);

    if (!editTitle.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    const meetingIso = new Date(editDate || new Date().toISOString().slice(0, 10)).toISOString();
    const actionItems = editActions
      .filter((a) => a.text.trim())
      .map((a) => ({
        text: a.text.trim(),
        assignee: a.assignee.trim() || "Unassigned",
        dueDate: meetingIso,
        status: (a.done ? "COMPLETED" : "PENDING") as "COMPLETED" | "PENDING",
      }));

    const audioId = editAudio?.existingId ?? editAudio?.token;
    const pdfIds = editPdfs
      .map((pdf) => pdf.existingId ?? pdf.token)
      .filter((id): id is string => Boolean(id));

    setIsSaving(true);
    try {
      if (mode === "create") {
        const created = await createMinute({
          title: editTitle.trim(),
          meeting_date: meetingIso,
          attendees: attendeeList,
          body: editBody,
          action_items: actionItems,
          audio_files: audioId ? [audioId] : [],
          pdf_files: pdfIds,
        });
        setSelectedId(created.id);
        toast.success("Meeting minute published");
      } else if (selectedId) {
        await updateMinute(selectedId, {
          title: editTitle.trim(),
          meeting_date: meetingIso,
          attendees: attendeeList,
          body: editBody,
          action_items: actionItems,
          audio_files: audioId ? [{ id: audioId }] : [],
          pdf_files: pdfIds.map((id) => ({ id })),
        });
        toast.success("Changes saved");
      }
      setMode("detail");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save meeting minute");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActionDone(action: MeetingActionItem, index: number) {
    if (!selected || !canManage) return;
    const next = action.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await setActionItemStatus(selected.id, index, next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update action item");
    }
  }

  function addEditorAction() {
    setEditActions((prev) => [
      ...prev,
      { id: `ea-${Date.now()}`, text: "", assignee: "", done: false },
    ]);
  }

  function updateEditorAction(id: string, field: "text" | "assignee", value: string) {
    setEditActions((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  function removeEditorAction(id: string) {
    setEditActions((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleAudioUpload(file: File) {
    setUploadingAudio(true);
    try {
      const token = await uploadAudio(file);
      setEditAudio({
        id: `audio-${token}`,
        name: file.name,
        url: URL.createObjectURL(file),
        token,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      setUploadingAudio(false);
    }
  }

  async function handlePdfUpload(file: File) {
    const name = file.name.toLowerCase();
    const isPdf =
      file.type === "application/pdf" || name.endsWith(".pdf");
    const isWord =
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".doc") ||
      name.endsWith(".docx");
    if (!isPdf && !isWord) {
      toast.error("Please choose a PDF or Word file (.pdf, .doc, .docx)");
      return;
    }
    setUploadingPdf(true);
    try {
      const token = await uploadAttachment(file);
      setEditPdfs((prev) => [
        ...prev,
        {
          id: `pdf-${token}`,
          name: file.name,
          token,
        },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Document upload failed");
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleDelete(m: MeetingMinute) {
    if (!window.confirm(`Delete "${m.title}"? This cannot be undone.`)) return;
    try {
      await removeMinute(m.id);
      toast.success("Meeting minute deleted");
      setMode("detail");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete meeting minute");
    }
  }

  return (
    <div className="project-minutes-board">
      <div className="project-minutes-board__layout">
        {/* LEFT PANEL */}
        <div
          style={{
            width: "280px",
            flexShrink: 0,
            background: "var(--ds-surface-elevated)",
            borderRight: "1px solid var(--ds-separator)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 16px 12px",
              borderBottom: "1px solid var(--figma-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ds-label)" }}>
              Meeting minutes
            </span>
            {canManage && (
              <button
                type="button"
                onClick={openCreate}
                className="gi-gradient-cta"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  borderRadius: "20px",
                  height: "28px",
                  padding: "0 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <Plus size={13} />
                New
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {isLoading && (
              <div style={{ padding: "16px", fontSize: "13px", color: "var(--ds-secondary-label)" }}>Loading…</div>
            )}
            {!isLoading && error && (
              <div style={{ padding: "16px", fontSize: "13px", color: "var(--figma-alert)" }}>{error}</div>
            )}
            {!isLoading && !error && minutes.length === 0 && (
              <div style={{ padding: "16px", fontSize: "13px", color: "var(--ds-secondary-label)" }}>
                No meeting minutes yet.
              </div>
            )}
            {minutes.map((m) => {
              const active = m.id === selectedId && mode !== "create";
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedId(m.id);
                    setMode("detail");
                  }}
                  style={{
                    width: "100%",
                    height: "60px",
                    background: active ? "var(--figma-gray50)" : "transparent",
                    border: "none",
                    borderLeft: active ? "3px solid var(--figma-teal)" : "3px solid transparent",
                    borderBottom: "1px solid var(--figma-border)",
                    cursor: "pointer",
                    padding: "0 14px 0 13px",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--ds-label)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ds-secondary-label)" }}>{fmtDate(m.meetingDate)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, background: "#fff", overflowY: "auto", position: "relative" }}>
          {mode === "detail" && selected && (
            <DetailView
              minute={selected}
              canManage={canManage}
              actionItemUpdating={actionItemUpdating}
              onEdit={() => openEdit(selected)}
              onDelete={() => handleDelete(selected)}
              onToggleAction={toggleActionDone}
            />
          )}
          {mode === "detail" && !selected && !isLoading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "280px",
                padding: "40px 32px",
                textAlign: "center",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--figma-navy)" }}>
                No minute selected
              </div>
              <div style={{ fontSize: "13px", color: "var(--figma-gray500)", maxWidth: "320px" }}>
                {canManage
                  ? "Select a meeting from the list, or click New to create one."
                  : "No meeting minutes have been published yet."}
              </div>
            </div>
          )}
          {(mode === "create" || mode === "edit") && (
            <EditorView
              title={editTitle}
              date={editDate}
              attendees={editAttendees}
              memberOptions={memberNames}
              body={editBody}
              actions={editActions}
              audio={editAudio}
              pdfs={editPdfs}
              uploadingAudio={uploadingAudio}
              uploadingPdf={uploadingPdf}
              isSaving={isSaving}
              isCreate={mode === "create"}
              onTitleChange={setEditTitle}
              onDateChange={setEditDate}
              onAttendeesChange={setEditAttendees}
              onBodyChange={setEditBody}
              onAddAction={addEditorAction}
              onUpdateAction={updateEditorAction}
              onRemoveAction={removeEditorAction}
              onAudioUpload={handleAudioUpload}
              onRemoveAudio={() => setEditAudio(null)}
              onPdfUpload={handlePdfUpload}
              onRemovePdf={(id) => setEditPdfs((prev) => prev.filter((pdf) => pdf.id !== id))}
              onCancel={cancelEditor}
              onPublish={publish}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Detail view ─────────────────────────────────────────── */

function DetailView({
  minute,
  canManage,
  actionItemUpdating,
  onEdit,
  onDelete,
  onToggleAction,
}: {
  minute: MeetingMinute;
  canManage: boolean;
  actionItemUpdating?: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAction: (action: MeetingActionItem, index: number) => void;
}) {
  const audio = minute.audio_files?.[0];
  const pdfFiles = minute.pdf_files ?? [];
  const actionItems = minute.actionItems ?? [];

  return (
    <div style={{ padding: "28px 32px", maxWidth: "720px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "6px",
        }}
      >
        <div style={{ fontSize: "26px", fontWeight: 500, color: "var(--ds-label)", lineHeight: 1.2 }}>
          {minute.title}
        </div>
        {canManage && (
          <div style={{ display: "flex", gap: "8px", flexShrink: 0, marginTop: "4px" }}>
            <button
              onClick={onEdit}
              style={{
                background: "var(--ds-bg)",
                border: "1px solid var(--figma-border)",
                borderRadius: "6px",
                height: "28px",
                padding: "0 12px",
                fontSize: "12px",
                color: "var(--ds-secondary-label)",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              title="Delete meeting minute"
              style={{
                background: "var(--ds-bg)",
                border: "1px solid var(--figma-border)",
                borderRadius: "6px",
                height: "28px",
                width: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--figma-alert)",
                cursor: "pointer",
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <MetaPill label="Date" value={fmtDate(minute.meetingDate)} />
        <MetaPill label="Attendees" value={minute.attendees.join(" · ") || "—"} />
      </div>

      <Divider />

      {audio && (
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              background: "var(--ds-surface-elevated)",
              border: "1px solid var(--ds-separator)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(14,124,134,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mic size={20} color="var(--figma-teal)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--ds-label)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {attachmentNameFromUrl(audio.url, "Audio recording")}
                </div>
                <div style={{ fontSize: "11px", color: "var(--ds-secondary-label)", marginTop: "2px" }}>
                  Audio recording
                </div>
              </div>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls style={{ width: "100%", height: "32px", outline: "none" }} src={audio.url} />
          </div>
        </div>
      )}

      {pdfFiles.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--ds-secondary-label)", marginBottom: "8px" }}>
            Documents
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pdfFiles.map((pdf) => (
              <a
                key={pdf.id}
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "var(--ds-surface-elevated)",
                  border: "1px solid var(--ds-separator)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(14,124,134,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={18} color="var(--figma-teal)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--ds-label)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {attachmentNameFromUrl(pdf.url, "Document")}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ds-secondary-label)", marginTop: "2px" }}>
                    Open document
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {minute.body && (
        <div
          style={{
            fontSize: "14px",
            color: "var(--figma-navy)",
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            marginBottom: "28px",
          }}
        >
          {minute.body}
        </div>
      )}

      {actionItems.length > 0 && (
        <>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ds-label)", marginBottom: "12px" }}>
            Action items
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {actionItems.map((action, index) => {
              const done = action.status === "COMPLETED";
              const updating = actionItemUpdating === `${minute.id}:${index}`;
              return (
                <div
                  key={`${action.text}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "var(--ds-surface-elevated)",
                    borderRadius: "8px",
                    border: "1px solid var(--figma-border)",
                    padding: "10px 14px",
                    opacity: updating ? 0.6 : 1,
                  }}
                >
                  <button
                    onClick={() => canManage && !updating && onToggleAction(action, index)}
                    disabled={!canManage || updating}
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: `2px solid ${done ? "var(--figma-teal)" : "var(--figma-border)"}`,
                      background: done ? "var(--figma-teal)" : "transparent",
                      cursor: canManage && !updating ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    {done && <Check size={10} color="white" strokeWidth={3} />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        color: done ? "var(--ds-secondary-label)" : "var(--ds-label)",
                        textDecoration: done ? "line-through" : "none",
                      }}
                    >
                      {action.text}
                    </div>
                    {action.assignee && action.assignee !== "Unassigned" && (
                      <div style={{ fontSize: "11px", color: "var(--ds-secondary-label)", marginTop: "2px" }}>
                        {action.assignee}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "10px",
          color: "var(--ds-secondary-label)",
          marginBottom: "2px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "var(--ds-secondary-label)" }}>{value}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "var(--ds-separator)", marginBottom: "14px" }} />;
}

/* ── Attendees multi-select (project members) ────────────── */

function AttendeesSelect({
  value,
  options,
  onChange,
  inputStyle,
}: {
  value: string[];
  options: string[];
  onChange: (next: string[]) => void;
  inputStyle: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);

  function toggle(name: string) {
    if (value.includes(name)) onChange(value.filter((n) => n !== name));
    else onChange([...value, name]);
  }

  // Already-selected names that aren't in the member list (e.g. legacy / external).
  const extraSelected = value.filter((n) => !options.includes(n));
  const allOptions = [...options, ...extraSelected];

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          gap: "5px",
          flexWrap: "wrap",
          minHeight: "36px",
          height: "auto",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {value.length === 0 ? (
          <span style={{ color: "var(--ds-secondary-label)" }}>Select attendees…</span>
        ) : (
          value.map((name) => (
            <span
              key={name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "var(--figma-gray100)",
                color: "var(--figma-navy)",
                borderRadius: "6px",
                padding: "2px 6px",
                fontSize: "12px",
              }}
            >
              {name}
              <XIcon
                size={11}
                style={{ cursor: "pointer", color: "var(--figma-gray400)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((n) => n !== name));
                }}
              />
            </span>
          ))
        )}
        <ChevronDown size={14} color="var(--ds-secondary-label)" style={{ marginLeft: "auto", flexShrink: 0 }} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              zIndex: 41,
              background: "var(--ds-surface-elevated)",
              border: "1px solid var(--figma-border)",
              borderRadius: "10px",
              boxShadow: "var(--neu-dropdown)",
              maxHeight: "220px",
              overflowY: "auto",
              padding: "4px",
            }}
          >
            {allOptions.length === 0 ? (
              <div style={{ padding: "10px 12px", fontSize: "12px", color: "var(--ds-secondary-label)" }}>
                No team members assigned to this project.
              </div>
            ) : (
              allOptions.map((name) => {
                const checked = value.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggle(name)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      background: checked ? "var(--figma-gray50)" : "transparent",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "13px",
                      color: "var(--ds-label)",
                    }}
                  >
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        border: `2px solid ${checked ? "var(--figma-teal)" : "var(--figma-border)"}`,
                        background: checked ? "var(--figma-teal)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {checked && <Check size={10} color="white" strokeWidth={3} />}
                    </span>
                    {name}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Editor view ─────────────────────────────────────────── */

function EditorView({
  title,
  date,
  attendees,
  memberOptions,
  body,
  actions,
  audio,
  pdfs,
  uploadingAudio,
  uploadingPdf,
  isSaving,
  isCreate,
  onTitleChange,
  onDateChange,
  onAttendeesChange,
  onBodyChange,
  onAddAction,
  onUpdateAction,
  onRemoveAction,
  onAudioUpload,
  onRemoveAudio,
  onPdfUpload,
  onRemovePdf,
  onCancel,
  onPublish,
}: {
  title: string;
  date: string;
  attendees: string[];
  memberOptions: string[];
  body: string;
  actions: EditAction[];
  audio: EditAttachment | null;
  pdfs: EditAttachment[];
  uploadingAudio: boolean;
  uploadingPdf: boolean;
  isSaving: boolean;
  isCreate: boolean;
  onTitleChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onAttendeesChange: (v: string[]) => void;
  onBodyChange: (v: string) => void;
  onAddAction: () => void;
  onUpdateAction: (id: string, field: "text" | "assignee", value: string) => void;
  onRemoveAction: (id: string) => void;
  onAudioUpload: (file: File) => void;
  onRemoveAudio: () => void;
  onPdfUpload: (file: File) => void;
  onRemovePdf: (id: string) => void;
  onCancel: () => void;
  onPublish: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const inputBase: React.CSSProperties = {
    background: "#fff",
    border: "1.5px solid var(--figma-border)",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "var(--figma-navy)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    boxShadow: "var(--neu-inset)",
  };
  const uploadZoneBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    background: "var(--figma-gray50)",
    border: "2px dashed var(--figma-border)",
    borderRadius: "14px",
    fontSize: "13px",
    color: "var(--figma-gray500)",
    boxShadow: "var(--neu-inset)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", maxWidth: "720px" }}>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Meeting title"
          className="hub-input-focus"
          style={{ ...inputBase, fontSize: "18px", padding: "9px 12px", marginBottom: "12px" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "12px", marginBottom: "14px" }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="hub-input-focus"
              style={inputBase}
            />
          </div>
          <div>
            <label style={labelStyle}>Attendees</label>
            <AttendeesSelect
              value={attendees}
              options={memberOptions}
              onChange={onAttendeesChange}
              inputStyle={inputBase}
            />
          </div>
        </div>

        <Divider />

        <div style={{ marginBottom: "14px" }}>
          <label style={{ ...labelStyle, marginBottom: "6px" }}>Audio Recording (Optional)</label>

          {!audio ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAudioUpload(file);
                  e.target.value = "";
                }}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAudio}
                style={{
                  ...uploadZoneBase,
                  height: "72px",
                  cursor: uploadingAudio ? "default" : "pointer",
                  opacity: uploadingAudio ? 0.7 : 1,
                }}
              >
                <Upload size={18} color="var(--figma-teal)" />
                {uploadingAudio ? "Uploading…" : "Click to upload audio file (MP3, M4A, WAV, etc.)"}
              </button>
            </>
          ) : (
            <div
              style={{
                background: "var(--ds-surface-elevated)",
                border: "1px solid var(--ds-separator)",
                borderRadius: "12px",
                padding: "12px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(14,124,134,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Mic size={18} color="var(--figma-teal)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--ds-label)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {audio.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ds-secondary-label)", marginTop: "2px" }}>
                    Audio file attached
                  </div>
                </div>
                <button
                  onClick={onRemoveAudio}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--figma-gray400)",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                    borderRadius: "4px",
                  }}
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ ...labelStyle, marginBottom: "6px" }}>Documents (Optional)</label>

          {pdfs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
              {pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  style={{
                    background: "var(--ds-surface-elevated)",
                    border: "1px solid var(--ds-separator)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "rgba(14,124,134,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={18} color="var(--figma-teal)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "var(--ds-label)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pdf.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ds-secondary-label)", marginTop: "2px" }}>
                        Document attached
                      </div>
                    </div>
                    <button
                      onClick={() => onRemovePdf(pdf.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--figma-gray400)",
                        display: "flex",
                        alignItems: "center",
                        padding: "4px",
                        borderRadius: "4px",
                      }}
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPdfUpload(file);
              e.target.value = "";
            }}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            disabled={uploadingPdf}
            style={{
              ...uploadZoneBase,
              height: "64px",
              cursor: uploadingPdf ? "default" : "pointer",
              opacity: uploadingPdf ? 0.7 : 1,
            }}
          >
            <Upload size={18} color="var(--figma-teal)" />
            {uploadingPdf ? "Uploading…" : "Click to upload PDF or Word (add multiple if needed)"}
          </button>
        </div>

        <label style={{ ...labelStyle, marginBottom: "6px" }}>Notes (Optional)</label>
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Write meeting notes here or leave blank if using audio only…"
          rows={5}
          className="hub-input-focus"
          style={{ ...inputBase, resize: "vertical", lineHeight: 1.6, marginBottom: "14px" }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ds-label)" }}>Action items</span>
          <button
            type="button"
            onClick={onAddAction}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#fff",
              border: "1.5px solid var(--figma-border)",
              borderRadius: "8px",
              height: "28px",
              padding: "0 10px",
              fontSize: "12px",
              color: "var(--figma-gray500)",
              cursor: "pointer",
            }}
          >
            <Plus size={12} />
            Add item
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {actions.map((action) => (
            <div
              key={action.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#fff",
                borderRadius: "10px",
                border: "1.5px solid var(--figma-border)",
                padding: "8px 12px",
                boxShadow: "var(--neu-inset)",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  border: "2px solid var(--figma-border)",
                  flexShrink: 0,
                }}
              />
              <input
                value={action.text}
                onChange={(e) => onUpdateAction(action.id, "text", e.target.value)}
                placeholder="Action item"
                style={{ flex: 2, background: "none", border: "none", outline: "none", fontSize: "13px", color: "var(--ds-label)" }}
              />
              <input
                value={action.assignee}
                onChange={(e) => onUpdateAction(action.id, "assignee", e.target.value)}
                placeholder="Assignee"
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "12px", color: "var(--ds-secondary-label)" }}
              />
              <button
                type="button"
                onClick={() => onRemoveAction(action.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--figma-gray400)",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {actions.length === 0 && (
            <div style={{ fontSize: "13px", color: "var(--ds-secondary-label)", padding: "10px 0" }}>
              No action items yet. Click &quot;Add item&quot; to add one.
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--figma-border)",
          background: "#fff",
          padding: "12px 32px",
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          style={{
            background: "#fff",
            border: "1.5px solid var(--figma-border)",
            borderRadius: "10px",
            height: "34px",
            padding: "0 16px",
            fontSize: "13px",
            color: "var(--figma-gray500)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={isSaving}
          className="gi-gradient-cta"
          style={{
            borderRadius: "10px",
            height: "34px",
            padding: "0 20px",
            fontSize: "13px",
            cursor: isSaving ? "default" : "pointer",
            fontWeight: 600,
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? "Saving…" : isCreate ? "Publish" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "var(--ds-secondary-label)",
  display: "block",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
