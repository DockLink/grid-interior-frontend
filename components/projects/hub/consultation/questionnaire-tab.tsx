"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";

import { NeuTextarea, SectionCard, SectionTitle } from "./consultation-ui";

export function QuestionnaireTab() {
  const [propType, setPropType] = useState<string>("Owned");
  const [limits, setLimits] = useState(
    "Existing load-bearing wall on the east side cannot be removed. Building regulations require a minimum ceiling height of 2.7m throughout.",
  );
  const [furniture, setFurniture] = useState(
    "Dining table (timber, 6-seater), original hardwood floor on ground level, entrance console.",
  );
  const [prefs, setPrefs] = useState(
    "Contemporary style with warm, natural tones. Strong preference for integrated storage and hidden joinery. Client dislikes clutter — clean lines preferred throughout.",
  );
  const [saved, setSaved] = useState(true);

  const autosave =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v);
      setSaved(false);
      setTimeout(() => setSaved(true), 800);
    };

  return (
    <div>
      <div className="mb-5 flex items-center justify-end gap-1.5">
        {saved ? (
          <>
            <MaterialIcon name="check_circle" size={14} style={{ color: "#3FA66B" }} />
            <span className="text-[11px] font-medium text-[#3FA66B]">All changes saved</span>
          </>
        ) : (
          <>
            <MaterialIcon name="sync" outlined size={14} className="text-[var(--figma-gray400)]" />
            <span className="text-[11px] text-[var(--figma-gray400)]">Saving…</span>
          </>
        )}
        <span className="text-[11px] text-[var(--figma-gray400)]">· Auto-save enabled</span>
      </div>

      <SectionCard>
        <SectionTitle icon="home_work" title="Property Type" />
        <div className="flex flex-wrap gap-2.5">
          {["Rented", "Owned", "Leased"].map((opt) => {
            const active = propType === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => autosave(() => setPropType(opt))(opt)}
                className="cursor-pointer rounded-3xl px-[22px] py-[9px] text-[13px] transition-all duration-150"
                style={{
                  border: active ? "2px solid var(--figma-teal)" : "1.5px solid var(--figma-border)",
                  background: active ? "rgba(14,124,134,0.07)" : "#fff",
                  color: active ? "var(--figma-teal)" : "var(--figma-gray500)",
                  fontWeight: active ? 700 : 400,
                  boxShadow: active ? "var(--neu-raised)" : "none",
                }}
              >
                {active && (
                  <MaterialIcon name="check" size={14} className="mr-1.5 align-middle" />
                )}
                {opt}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="block" title="Project Limitations" />
        <NeuTextarea
          value={limits}
          onChange={autosave(setLimits)}
          placeholder="Describe any structural, regulatory, or client-imposed limitations…"
          rows={3}
        />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="chair" title="Furniture to Retain" />
        <NeuTextarea
          value={furniture}
          onChange={autosave(setFurniture)}
          placeholder="List items the client wants to keep…"
          rows={3}
        />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="favorite_border" title="Client Preferences & Requirements" />
        <NeuTextarea
          value={prefs}
          onChange={autosave(setPrefs)}
          placeholder="Document style preferences, must-haves, and special requirements…"
          rows={4}
        />
      </SectionCard>
    </div>
  );
}
