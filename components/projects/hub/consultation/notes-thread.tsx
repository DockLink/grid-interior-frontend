"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { SAMPLE_COMMENTS } from "@/lib/projects/mock-consultation";
import { TEAM_MEMBERS } from "@/lib/projects/mock-projects";
import type { ConsultComment } from "@/types/consultation";

export function NotesThread({ compact = false }: { compact?: boolean }) {
  const [comments, setComments] = useState<ConsultComment[]>(SAMPLE_COMMENTS);
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const send = () => {
    if (!draft.trim()) return;
    setComments((p) => [
      ...p,
      {
        id: Date.now(),
        memberId: 1,
        text: draft.trim(),
        time: "Just now",
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex flex-col" style={{ height: compact ? 480 : 560 }}>
      <div className="mb-4 flex-1 overflow-y-auto pr-1">
        {comments.map((c, idx) => {
          const m = TEAM_MEMBERS.find((t) => t.id === c.memberId);
          if (!m) return null;
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
                <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">{c.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div
        className="flex items-end gap-2.5 rounded-2xl border border-[var(--figma-border)] bg-white px-4 py-3.5"
        style={{ boxShadow: "var(--neu-card)" }}
      >
        <button
          type="button"
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
            background: draft.trim()
              ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))"
              : "var(--figma-gray200)",
            boxShadow: draft.trim() ? "var(--neu-raised)" : "none",
          }}
        >
          <MaterialIcon
            name="send"
            size={18}
            className={draft.trim() ? "text-white" : "text-[var(--figma-gray400)]"}
          />
        </button>
      </div>
    </div>
  );
}
