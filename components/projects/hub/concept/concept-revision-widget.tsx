"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { SectionCard, SectionTitle } from "@/components/projects/hub/consultation/consultation-ui";
import { CONCEPT_REVISION_LOG } from "@/lib/projects/mock-concept";
import type { ConceptRevisionEntry } from "@/types/concept";

const FREE_LIMIT = 2;

export function RevisionTrackerWidget() {
  const [revisions, setRevisions] = useState<ConceptRevisionEntry[]>(CONCEPT_REVISION_LOG);
  const [noteInput, setNoteInput] = useState("");
  const [adding, setAdding] = useState(false);

  const addRevision = () => {
    if (!noteInput.trim()) return;
    const chargeable = revisions.length >= FREE_LIMIT;
    setRevisions((p) => [
      ...p,
      {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        note: noteInput.trim(),
        chargeable,
      },
    ]);
    setNoteInput("");
    setAdding(false);
  };

  return (
    <SectionCard>
      <SectionTitle
        icon="history"
        title="Revisions"
        right={<span className="text-[11px] text-[var(--figma-gray400)]">2 free revisions included</span>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {revisions.map((rev, idx) => {
          const chargeable = idx >= FREE_LIMIT;
          return (
            <div key={rev.id} className="flex shrink-0 items-center gap-1">
              <div
                className="flex size-8 items-center justify-center rounded-full transition-all duration-[180ms]"
                style={{
                  background: chargeable ? "#FEE2E2" : "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))",
                  border: chargeable ? "2px solid var(--figma-alert)" : "none",
                  boxShadow: chargeable ? "none" : "var(--neu-raised)",
                }}
              >
                <span
                  className="text-[11px] font-bold"
                  style={{ color: chargeable ? "var(--figma-alert)" : "#fff" }}
                >
                  {idx + 1}
                </span>
              </div>
              {chargeable && (
                <span
                  className="rounded-lg px-1.5 py-0.5 text-[9px] font-bold tracking-wide"
                  style={{
                    color: "var(--figma-alert)",
                    background: "#FEE2E2",
                    border: "1px solid var(--figma-alert)",
                  }}
                >
                  CHARGEABLE
                </span>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-[var(--figma-border)] bg-white transition-all duration-150 neu-inset hover:border-[var(--figma-teal)]"
        >
          <MaterialIcon name="add" outlined size={16} className="text-[var(--figma-teal)]" />
        </button>
      </div>

      {adding && (
        <div className="mb-4 flex animate-in fade-in slide-in-from-top-1 gap-2 duration-150">
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRevision()}
            placeholder="Brief revision note…"
            autoFocus
            className="flex-1 rounded-[9px] border-[1.5px] border-[var(--figma-teal)] bg-white px-3 py-2 text-xs text-[var(--figma-navy)] outline-none neu-inset"
          />
          <button
            type="button"
            onClick={addRevision}
            className="cursor-pointer rounded-[9px] border-none px-3.5 py-2 text-xs font-semibold text-white gi-gradient-cta"
            style={{ boxShadow: "var(--neu-raised)" }}
          >
            Log
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="cursor-pointer rounded-[9px] border-[1.5px] border-[var(--figma-border)] bg-white px-2.5 py-2 text-xs text-[var(--figma-gray500)]"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col">
        {revisions.map((rev, idx) => {
          const isLast = idx === revisions.length - 1;
          const chargeable = idx >= FREE_LIMIT;
          return (
            <div
              key={rev.id}
              className="flex items-start gap-3 py-2.5"
              style={{ borderBottom: isLast ? "none" : "1px solid var(--figma-border)" }}
            >
              <span className="w-20 shrink-0 pt-px text-[11px] text-[var(--figma-gray400)]">{rev.date}</span>
              <span className="flex-1 text-xs leading-relaxed text-[var(--figma-navy)]">{rev.note}</span>
              {chargeable && (
                <span
                  className="shrink-0 rounded-lg px-1.5 py-0.5 text-[9px] font-bold tracking-wide"
                  style={{
                    color: "var(--figma-alert)",
                    background: "#FEE2E2",
                    border: "1px solid var(--figma-alert)",
                  }}
                >
                  CHARGEABLE
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--figma-gray400)]">
        <MaterialIcon name="info" outlined size={13} />
        2 free revisions included. Additional revisions are chargeable.
      </div>
    </SectionCard>
  );
}
