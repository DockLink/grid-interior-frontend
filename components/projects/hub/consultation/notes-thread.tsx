"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useConsultation } from "@/hooks/use-consultation";
import { useHubTeam } from "@/lib/projects/hub-team-context";
import type { ConsultComment } from "@/types/consultation";

export function NotesThread({
  projectId,
  compact = false,
  section,
}: {
  projectId: string;
  compact?: boolean;
  section?: string;
}) {
  const teamMembers = useHubTeam();
  const { notes: remoteNotes, createNote, isAuthOff } = useConsultation(projectId);
  const [comments, setComments] = useState<ConsultComment[]>(
    section ? remoteNotes.slice(0, 2) : remoteNotes,
  );
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setComments(section ? remoteNotes.slice(0, 2) : remoteNotes);
  }, [remoteNotes, section]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const send = () => {
    if (!draft.trim() && !attachment) return;
    const text = draft.trim();
    setDraft("");
    const attachName = attachment?.name;
    setAttachment(null);
    void createNote({ text, attachment_name: attachName }).then((note) => {
      if (isAuthOff && note) setComments((p) => [...p, note]);
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
    e.target.value = "";
  };

  const findMember = (memberId: string) =>
    teamMembers.find((t) => String(t.id) === String(memberId)) ??
    teamMembers[0] ?? {
      id: 0,
      name: "Team",
      role: "Member",
      initials: "TM",
      color: "#0E7C86",
    };

  return (
    <div className="flex flex-col" style={{ height: compact ? 280 : 560 }}>
      <div className="mb-4 flex-1 overflow-y-auto pr-1">
        {comments.map((c, idx) => {
          const m = findMember(c.memberId);
          const isLast = idx === comments.length - 1;

          return (
            <div key={c.id} className="flex gap-3" style={{ marginBottom: isLast ? 0 : 16 }}>
              <div className="flex shrink-0 flex-col items-center">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: m.color }}
                >
                  {m.initials}
                </div>
                {!isLast && (
                  <div
                    className="mt-1.5 min-h-5 flex-1 rounded-sm"
                    style={{ width: 2, background: "var(--figma-border)" }}
                  />
                )}
              </div>
              <div
                className="flex-1 rounded-[14px] bg-white px-4 py-3.5"
                style={{
                  boxShadow: "var(--neu-card)",
                  marginBottom: isLast ? 0 : 4,
                }}
              >
                <div className="mb-2 flex flex-wrap items-baseline gap-2.5">
                  <span className="text-[13px] font-bold text-[var(--figma-navy)]">{m.name}</span>
                  <span className="text-[11px] text-[var(--figma-gray400)]">{m.role}</span>
                  <span className="ml-auto text-[11px] text-[var(--figma-gray400)]">{c.time}</span>
                </div>
                {c.attachmentName && (
                  <div className="mb-2 flex items-center gap-2 rounded-lg border border-[var(--figma-border)] bg-[var(--figma-gray50)] px-3 py-2">
                    <MaterialIcon name="attach_file" size={16} className="text-[var(--figma-gray500)]" />
                    <span className="text-[12px] font-medium text-[var(--figma-navy)] truncate">
                      {c.attachmentName}
                    </span>
                  </div>
                )}
                {c.text && <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">{c.text}</p>}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div
        className="flex flex-col gap-2 rounded-2xl border border-[var(--figma-border)] bg-white px-4 py-3.5"
        style={{ boxShadow: "var(--neu-card)" }}
      >
        {attachment && (
          <div className="flex w-max items-center gap-2 rounded-lg bg-[var(--figma-gray100)] px-3 py-1.5">
            <MaterialIcon name="attach_file" size={14} className="text-[var(--figma-gray500)]" />
            <span className="text-[12px] font-medium text-[var(--figma-navy)] truncate max-w-[200px]">
              {attachment.name}
            </span>
            <button
              onClick={() => setAttachment(null)}
              className="ml-1 flex cursor-pointer items-center justify-center rounded-full border-none bg-transparent hover:bg-[var(--figma-gray200)]"
            >
              <MaterialIcon name="close" size={14} className="text-[var(--figma-gray600)]" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2.5">
          <input
            type="file"
            className="hidden"
            ref={fileRef}
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[9px] border-none bg-[var(--figma-gray100)] transition-colors duration-150 hover:bg-[var(--figma-gray200)]"
          >
            <MaterialIcon name="attach_file" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
          <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Add a note or comment… (Enter to send)"
          rows={2}
          className="box-border flex-1 resize-none rounded-[10px] bg-[var(--figma-gray50)] px-3 py-2 text-[13px] leading-snug text-[var(--figma-navy)] outline-none transition-[border] duration-150"
          style={{
            border: focused ? "1.5px solid var(--figma-teal)" : "1.5px solid var(--figma-border)",
          }}
        />
          <button
            type="button"
            onClick={send}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none transition-all duration-200"
            style={{
              background: (draft.trim() || attachment)
                ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))"
                : "var(--figma-gray200)",
              boxShadow: (draft.trim() || attachment) ? "var(--neu-raised)" : "none",
            }}
          >
            <MaterialIcon
              name="send"
              size={18}
              className={(draft.trim() || attachment) ? "text-white" : "text-[var(--figma-gray400)]"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
