"use client";

import { useRef, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { GradientBtn } from "@/components/projects/hub/consultation/consultation-ui";
import { WorkspaceBreadcrumb } from "@/components/projects/hub/shared/workspace-breadcrumb";
import { CONCEPT_AREAS } from "@/lib/projects/mock-concept";
import type { ConceptArea } from "@/types/concept";
import type { ActiveProjectView } from "@/types/project-hub";

function AreaCard({ area, onClick }: { area: ConceptArea; onClick: () => void }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="cursor-pointer rounded-2xl bg-white p-5 transition-all duration-200"
      style={{
        boxShadow: hov ? "var(--neu-card-hover)" : "var(--neu-card)",
        transform: hov ? "translateY(-3px)" : "none",
        border: `1px solid ${hov ? "var(--figma-teal)" : "transparent"}`,
      }}
    >
      <div
        className="mb-3.5 flex size-12 items-center justify-center rounded-[13px] transition-all duration-200"
        style={{
          background: hov ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))" : "var(--figma-gray50)",
          boxShadow: hov ? "var(--neu-raised)" : "var(--neu-inset)",
        }}
      >
        <MaterialIcon
          name={area.icon}
          outlined={!hov}
          size={24}
          className={hov ? "text-white" : "text-[var(--figma-gray400)]"}
        />
      </div>
      <div className="mb-2 text-sm font-bold text-[var(--figma-navy)]">{area.name}</div>
      <div className="flex items-center justify-between">
        <span
          className="rounded-[10px] px-2.5 py-0.5 text-[11px] font-semibold"
          style={{
            color: area.conceptCount > 0 ? "var(--figma-teal)" : "var(--figma-gray400)",
            background: area.conceptCount > 0 ? "rgba(14,124,134,0.08)" : "var(--figma-gray50)",
          }}
        >
          {area.conceptCount} concept{area.conceptCount !== 1 ? "s" : ""}
        </span>
        {area.conceptCount > 0 && (
          <span className="text-[11px] font-medium text-[var(--figma-teal)]">View →</span>
        )}
      </div>
    </div>
  );
}

export function AreaSetupScreen({
  project,
  onSelectArea,
  onBack,
}: {
  project: ActiveProjectView;
  onSelectArea: (areaId: number) => void;
  onBack: () => void;
}) {
  const [areas, setAreas] = useState(CONCEPT_AREAS);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commitAdd = () => {
    if (!newName.trim()) {
      setAdding(false);
      return;
    }
    setAreas((p) => [...p, { id: Date.now(), name: newName.trim(), icon: "room", conceptCount: 0 }]);
    setNewName("");
    setAdding(false);
  };

  const focusInput = () => setTimeout(() => inputRef.current?.focus(), 50);

  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb
        items={["Projects", project.name, "Concept Design"]}
        onBack={onBack}
      />
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-[26px] font-bold text-[var(--figma-navy)]">Concept Design — Areas</h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
            Define the areas for this project before beginning concept work
          </p>
        </div>
      </div>

      {areas.length === 0 && !adding ? (
        <div className="flex flex-col items-center gap-5 px-12 py-20">
          <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
            <rect x="10" y="15" width="80" height="55" rx="8" stroke="var(--figma-border)" strokeWidth="2" fill="var(--figma-gray50)" />
            <rect x="24" y="28" width="26" height="28" rx="3" stroke="var(--figma-gray200)" strokeWidth="1.5" fill="none" />
            <rect x="56" y="28" width="20" height="28" rx="3" stroke="var(--figma-gray200)" strokeWidth="1.5" fill="none" />
          </svg>
          <div className="text-center">
            <div className="mb-1.5 text-[15px] font-semibold text-[var(--figma-navy)]">No areas defined yet</div>
            <div className="text-[13px] text-[var(--figma-gray500)]">Add your first area to begin concept design.</div>
          </div>
          <GradientBtn
            label="Add First Area"
            icon="add"
            onClick={() => {
              setAdding(true);
              focusInput();
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {areas.map((area) => (
            <AreaCard key={area.id} area={area} onClick={() => onSelectArea(area.id)} />
          ))}

          {adding ? (
            <div
              className="flex flex-col gap-2.5 rounded-2xl border-2 border-[var(--figma-teal)] bg-white p-5"
              style={{ boxShadow: "var(--neu-card)" }}
            >
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitAdd();
                  if (e.key === "Escape") setAdding(false);
                }}
                autoFocus
                placeholder="Area name…"
                className="rounded-[9px] border-[1.5px] border-[var(--figma-teal)] bg-white px-3 py-2 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={commitAdd}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-[9px] border-none bg-[var(--figma-teal)] py-[7px] text-xs font-semibold text-white"
                >
                  <MaterialIcon name="check" outlined size={14} />
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setNewName("");
                  }}
                  className="cursor-pointer rounded-[9px] border border-[var(--figma-border)] bg-white px-2.5 py-[7px] text-xs text-[var(--figma-gray400)]"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdding(true);
                focusInput();
              }}
              className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--figma-border)] bg-white p-5 transition-all duration-200 hover:border-[var(--figma-teal)]"
              style={{ boxShadow: "var(--neu-card)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--neu-card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--neu-card)";
              }}
            >
              <div className="flex size-11 items-center justify-center rounded-xl border-2 border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)]">
                <MaterialIcon name="add" outlined size={22} className="text-[var(--figma-gray400)]" />
              </div>
              <span className="text-[13px] font-semibold text-[var(--figma-gray400)]">Add Area</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
