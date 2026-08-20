"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { OutlineBtn, SectionCard } from "@/components/projects/hub/consultation/consultation-ui";
import { DETAIL_CATEGORIES } from "@/lib/projects/mock-detail";
import { formatLKR } from "@/types/detail";
import type { DetailCategory } from "@/types/detail";
import type { ActiveProjectView } from "@/types/project-hub";

function BoqCategoryCard({ cat, pct }: { cat: DetailCategory; pct: number }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-2xl bg-white px-5 py-5 transition-all duration-200"
      style={{
        boxShadow: hov ? "var(--neu-card-hover)" : "var(--neu-card)",
        transform: hov ? "translateY(-2px)" : "none",
        borderTop: `3px solid ${cat.color}`,
      }}
    >
      <div className="mb-3.5 flex items-center gap-[11px]">
        <div
          className="flex size-[38px] items-center justify-center rounded-[10px] neu-inset"
          style={{ background: cat.accentBg }}
        >
          <MaterialIcon name={cat.icon} outlined size={20} style={{ color: cat.color }} />
        </div>
        <div>
          <div className="text-[13px] font-bold text-[var(--figma-navy)]">{cat.label}</div>
          <div className="text-[10px] text-[var(--figma-gray400)]">
            {cat.files.length} file{cat.files.length !== 1 ? "s" : ""}
          </div>
        </div>
        {cat.complete && (
          <MaterialIcon name="check_circle" size={18} className="ml-auto text-[#3FA66B]" />
        )}
      </div>
      <div className="mb-2.5 text-2xl font-extrabold tracking-tight text-[var(--figma-navy)]">
        {formatLKR(cat.estimate)}
      </div>
      <div className="mb-1.5 h-1.5 overflow-hidden rounded-sm bg-[var(--figma-gray100)]">
        <div
          className="h-full rounded-sm transition-[width] duration-700 ease-out"
          style={{ width: `${pct * 100}%`, background: cat.color }}
        />
      </div>
      <div className="text-[11px] text-[var(--figma-gray400)]">{(pct * 100).toFixed(1)}% of total budget</div>
    </div>
  );
}

export function BoqScreen({ project, onBack }: { project: ActiveProjectView; onBack: () => void }) {
  const cats = DETAIL_CATEGORIES;
  const grand = cats.reduce((s, c) => s + c.estimate, 0);
  const [backHover, setBackHover] = useState(false);

  return (
    <div className="px-10 py-8">
      <button
        type="button"
        onClick={onBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        className="mb-4 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] transition-colors duration-150"
        style={{ color: backHover ? "var(--figma-teal)" : "var(--figma-gray500)" }}
      >
        <MaterialIcon name="arrow_back" outlined size={16} />
        Projects / {project.name} / Detail Drawings / BOQ
      </button>

      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 mb-1 text-[28px] font-bold text-[var(--figma-navy)]">Estimate Breakdown</h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">BOQ summary by category</p>
        </div>
        <OutlineBtn label="Export Summary" icon="download" />
      </div>

      <p className="mb-7 flex items-center gap-1.5 text-[11px] text-[var(--figma-gray400)]">
        <MaterialIcon name="info" outlined size={14} />
        Full BOQ line-item detail available in the Execution phase.
      </p>

      <div className="mb-7 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {cats.map((cat) => (
          <BoqCategoryCard key={cat.id} cat={cat} pct={cat.estimate / grand} />
        ))}
      </div>

      <SectionCard className="px-7 py-7">
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-1 text-[13px] text-[var(--figma-gray500)]">Grand Total Estimate</div>
            <div className="text-[32px] font-extrabold tracking-tight text-[var(--figma-navy)]">{formatLKR(grand)}</div>
          </div>
          <div className="text-right">
            <div className="mb-1 text-[11px] text-[var(--figma-gray400)]">All categories</div>
            <div className="text-xs font-semibold text-[var(--figma-teal)]">
              {cats.length} categories · {cats.reduce((s, c) => s + c.files.length, 0)} drawings uploaded
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex h-[18px] gap-0.5 overflow-hidden rounded-[9px]">
            {cats.map((cat) => {
              const pct = (cat.estimate / grand) * 100;
              return (
                <div
                  key={cat.id}
                  title={`${cat.label}: ${formatLKR(cat.estimate)}`}
                  className="h-full transition-[width] duration-[600ms] ease-out"
                  style={{
                    width: `${pct}%`,
                    background: cat.color,
                    minWidth: pct > 2 ? undefined : 4,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {cats.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5">
              <div className="size-2.5 shrink-0 rounded-sm" style={{ background: cat.color }} />
              <span className="text-[11px] text-[var(--figma-gray500)]">{cat.label.split(",")[0]}</span>
              <span className="text-[11px] font-semibold text-[var(--figma-navy)]">
                {((cat.estimate / grand) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
