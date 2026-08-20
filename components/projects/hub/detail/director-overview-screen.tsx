"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { StatTile } from "@/components/projects/hub/stat-tile";
import { DIRECTOR_PROJECTS } from "@/lib/projects/mock-detail";
import { cn } from "@/lib/utils";
import type { DetailCategoryId, DirectorProject } from "@/types/detail";
import type { ActiveProjectView } from "@/types/project-hub";

const CAT_IDS: DetailCategoryId[] = ["electrical", "flooring", "ceiling", "walls", "furniture", "interior"];

const CAT_ICONS: Record<DetailCategoryId, string> = {
  electrical: "bolt",
  flooring: "layers",
  ceiling: "roofing",
  walls: "door_front",
  furniture: "chair",
  interior: "palette",
};

const STATUS_CFG = {
  awaiting: { label: "Awaiting Review", color: "#D97706", bg: "#FEF3C7" },
  complete: { label: "Complete", color: "#3FA66B", bg: "#DCFCE7" },
} as const;

const SORT_LABELS = { days: "Days in Phase", name: "Project Name" } as const;

function DirectorProjectRow({
  proj,
  statusLabel,
  statusColor,
  statusBg,
  isLast,
}: {
  proj: DirectorProject;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  const [reviewHover, setReviewHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="grid items-center px-5 py-4 transition-colors duration-150"
      style={{
        gridTemplateColumns: "2fr 1.5fr 180px 100px 60px 120px",
        borderBottom: isLast ? "none" : "1px solid var(--figma-border)",
        background: hov ? "var(--figma-gray50)" : "#fff",
      }}
    >
      <div>
        <div className="text-sm font-bold text-[var(--figma-navy)]">{proj.name}</div>
        <div className="text-[11px] text-[var(--figma-gray400)]">ID #{proj.id.toString().padStart(4, "0")}</div>
      </div>

      <div className="text-[13px] text-[var(--figma-gray700)]">{proj.client}</div>

      <div className="flex gap-[5px]">
        {CAT_IDS.map((cid) => {
          const done = proj.categories[cid];
          return (
            <div
              key={cid}
              title={cid}
              className="flex size-[22px] items-center justify-center rounded-full transition-all duration-200"
              style={{
                background: done ? "#DCFCE7" : "var(--figma-gray100)",
                border: done ? "2px solid #3FA66B" : "2px solid var(--figma-border)",
              }}
            >
              <MaterialIcon
                name={done ? "check" : CAT_ICONS[cid]}
                outlined={!done}
                size={11}
                style={{ color: done ? "#3FA66B" : "var(--figma-gray400)" }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-[5px]">
        <MaterialIcon
          name="schedule"
          outlined
          size={14}
          style={{ color: proj.daysInPhase > 15 ? "var(--figma-alert)" : "var(--figma-gray400)" }}
        />
        <span
          className="text-[13px] font-semibold"
          style={{ color: proj.daysInPhase > 15 ? "var(--figma-alert)" : "var(--figma-navy)" }}
        >
          {proj.daysInPhase}d
        </span>
      </div>

      <div
        title={proj.designer.name}
        className="flex size-8 items-center justify-center rounded-full"
        style={{ background: proj.designer.color, boxShadow: "var(--neu-raised)" }}
      >
        <span className="text-[11px] font-bold text-white">{proj.designer.initials}</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="whitespace-nowrap rounded-[10px] px-[9px] py-[3px] text-[10px] font-semibold"
          style={{ color: statusColor, background: statusBg }}
        >
          {statusLabel}
        </span>
        {proj.status === "awaiting" && (
          <button
            type="button"
            onMouseEnter={() => setReviewHover(true)}
            onMouseLeave={() => setReviewHover(false)}
            className="flex cursor-pointer items-center gap-[3px] border-none bg-transparent p-0 text-[11px] font-semibold text-[var(--figma-teal)]"
            style={{ textDecoration: reviewHover ? "underline" : "none" }}
          >
            Review
            <MaterialIcon name="open_in_new" outlined size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export function DirectorOverviewScreen({
  project,
  onBack,
}: {
  project: ActiveProjectView;
  onBack: () => void;
}) {
  const [sort, setSort] = useState<"days" | "name">("days");
  const [statusFilter, setStatusFilter] = useState<"all" | "awaiting" | "complete">("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [backHover, setBackHover] = useState(false);

  const filtered = DIRECTOR_PROJECTS.filter((p) => statusFilter === "all" || p.status === statusFilter).sort((a, b) =>
    sort === "days" ? b.daysInPhase - a.daysInPhase : a.name.localeCompare(b.name),
  );

  const totalProjects = DIRECTOR_PROJECTS.length;
  const awaitingReview = DIRECTOR_PROJECTS.filter((p) => p.status === "awaiting").length;
  const avgDays = Math.round(DIRECTOR_PROJECTS.reduce((s, p) => s + p.daysInPhase, 0) / totalProjects);

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
        Projects / {project.name} / Detail Drawings / Director Overview
      </button>

      <div className="mb-7">
        <h1 className="m-0 mb-1 text-[28px] font-bold text-[var(--figma-navy)]">
          Detail Drawings — Director Overview
        </h1>
        <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
          All active projects currently in detail drawing review
        </p>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile icon="folder_open" label="Total Projects in Phase" value={String(totalProjects)} color="var(--figma-navy)" />
        <StatTile icon="pending_actions" label="Awaiting Director Review" value={String(awaitingReview)} color="#D97706" />
        <StatTile icon="schedule" label="Avg. Days in Phase" value={`${avgDays} days`} color="var(--figma-teal)" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex cursor-pointer items-center gap-2 rounded-[20px] border-[1.5px] border-[var(--figma-border)] bg-white px-4 py-2 text-xs font-medium text-[var(--figma-navy)]"
              style={{ boxShadow: "var(--neu-raised)" }}
            >
              <MaterialIcon name="sort" outlined size={15} className="text-[var(--figma-gray400)]" />
              Sort by: <strong>{SORT_LABELS[sort]}</strong>
              <MaterialIcon name="expand_more" outlined size={15} className="text-[var(--figma-gray400)]" />
            </button>
            {sortOpen && (
              <div
                className="absolute left-0 top-[110%] z-50 min-w-[170px] rounded-xl border border-[var(--figma-border)] bg-white py-1.5"
                style={{ boxShadow: "var(--neu-dropdown)" }}
              >
                {(Object.entries(SORT_LABELS) as [typeof sort, string][]).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSort(k);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 border-none px-3.5 py-2 text-left text-[13px]",
                      sort === k ? "bg-[var(--figma-gray50)] font-semibold text-[var(--figma-teal)]" : "bg-transparent font-normal text-[var(--figma-navy)]",
                    )}
                  >
                    {sort === k && <MaterialIcon name="check" size={14} className="text-[var(--figma-teal)]" />}
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {(["all", "awaiting", "complete"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={cn(
                "cursor-pointer rounded-[18px] border-none px-4 py-[7px] text-xs transition-all duration-200",
                statusFilter === f ? "gi-gradient-cta font-bold text-white" : "bg-white font-normal text-[var(--figma-gray500)] neu-inset",
              )}
              style={{ boxShadow: statusFilter === f ? "var(--neu-raised)" : undefined }}
            >
              {f === "all" ? "All" : f === "awaiting" ? "Awaiting Review" : "Complete"}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--figma-gray400)]">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: "var(--neu-card)" }}>
        <div
          className="grid px-5 py-3"
          style={{
            gridTemplateColumns: "2fr 1.5fr 180px 100px 60px 120px",
            background: "var(--figma-gray50)",
            borderBottom: "1px solid var(--figma-border)",
          }}
        >
          {["Project", "Client", "Category Progress", "Days in Phase", "Designer", "Status"].map((h) => (
            <span
              key={h}
              className="text-[11px] font-semibold uppercase tracking-wider text-[var(--figma-gray500)]"
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.map((proj, idx) => {
          const s = STATUS_CFG[proj.status];
          return (
            <DirectorProjectRow
              key={proj.id}
              proj={proj}
              statusLabel={s.label}
              statusColor={s.color}
              statusBg={s.bg}
              isLast={idx === filtered.length - 1}
            />
          );
        })}

        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center">
            <MaterialIcon name="folder_off" outlined size={36} className="mx-auto mb-2 block text-[var(--figma-gray200)]" />
            <span className="text-[13px] text-[var(--figma-gray400)]">No projects match the current filter.</span>
          </div>
        )}
      </div>
    </div>
  );
}
