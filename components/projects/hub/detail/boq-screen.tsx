"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { OutlineBtn, SectionCard } from "@/components/projects/hub/consultation/consultation-ui";
import { useProjectBoqSummary } from "@/hooks/use-boq";
import { useDetailCategories } from "@/hooks/use-detail-categories";
import { useProjectFiles } from "@/hooks/use-project-files";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { matchDetailCategoryFolder } from "@/lib/detail/category-folders";
import { resolveDetailedDrawingsFolder } from "@/lib/files/resolve-folder";
import { DETAIL_CATEGORIES } from "@/lib/projects/mock-detail";
import { formatLKR } from "@/types/detail";
import type { DetailCategoryId } from "@/types/detail";
import { projectExecutionRoute } from "@/types/navigation";
import type { ActiveProjectView } from "@/types/project-hub";

type BoqCardCategory = {
  id: DetailCategoryId;
  label: string;
  icon: string;
  color: string;
  accentBg: string;
  complete: boolean;
  estimate: number;
  fileCount: number;
};

function exportBoqSummaryCsv(
  rows: { label: string; estimate: number; pct: number }[],
  projectName: string,
  grandTotal: number,
) {
  const lines = [
    ["Category", "Estimate (LKR)", "% of total"].join(","),
    ...rows.map((r) =>
      [JSON.stringify(r.label), r.estimate, r.pct.toFixed(1)].join(","),
    ),
    ["Grand Total", grandTotal, "100.0"].join(","),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, "_")}_BOQ_Summary.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function budgetShare(estimate: number, total: number): number {
  if (!(total > 0) || !Number.isFinite(estimate)) return 0;
  return estimate / total;
}

function BoqCategoryCard({ cat, pct }: { cat: BoqCardCategory; pct: number }) {
  const [hov, setHov] = useState(false);
  const safePct = Number.isFinite(pct) ? Math.max(0, pct) : 0;

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
            {cat.fileCount} file{cat.fileCount !== 1 ? "s" : ""}
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
          style={{ width: `${safePct * 100}%`, background: cat.color }}
        />
      </div>
      <div className="text-[11px] text-[var(--figma-gray400)]">
        {(safePct * 100).toFixed(1)}% of total budget
      </div>
    </div>
  );
}

export function BoqScreen({ project, onBack }: { project: ActiveProjectView; onBack: () => void }) {
  const authOff = isAuthDisabled();
  const { buckets, isLoading, error } = useProjectBoqSummary(project.id);
  const { categories: detailCategories } = useDetailCategories(project.id);
  const { folderTree } = useProjectFiles(project.id);

  const detailedRoot = useMemo(
    () => resolveDetailedDrawingsFolder(folderTree),
    [folderTree],
  );

  const fileCountByCategory = useMemo(() => {
    const counts = {} as Record<DetailCategoryId, number>;
    for (const cat of DETAIL_CATEGORIES) {
      if (authOff) {
        counts[cat.id] = cat.files.length;
        continue;
      }
      const path = matchDetailCategoryFolder(detailedRoot, cat.id);
      const fromTree =
        path && folderTree?.fileCounts
          ? folderTree.fileCounts[path]
          : undefined;
      counts[cat.id] = typeof fromTree === "number" ? fromTree : 0;
    }
    return counts;
  }, [authOff, detailedRoot, folderTree]);

  const cats = useMemo((): BoqCardCategory[] => {
    const estimateById = new Map(buckets.map((b) => [b.id, b.estimate]));
    const labelById = new Map(buckets.map((b) => [b.id, b.label]));
    const completeById = new Map(detailCategories.map((c) => [c.id, c.complete]));
    return DETAIL_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: labelById.get(cat.id) ?? cat.label,
      icon: cat.icon,
      color: cat.color,
      accentBg: cat.accentBg,
      complete: completeById.get(cat.id) ?? false,
      // Never fall back to mock estimates — show LKR 0 when cost data is missing.
      estimate: estimateById.get(cat.id) ?? 0,
      fileCount: fileCountByCategory[cat.id] ?? 0,
    }));
  }, [buckets, detailCategories, fileCountByCategory]);

  const estimateSum = cats.reduce((s, c) => s + c.estimate, 0);
  const totalFiles = cats.reduce((s, c) => s + c.fileCount, 0);
  const [backHover, setBackHover] = useState(false);
  const [linkHover, setLinkHover] = useState(false);

  return (
    <div className="px-10 py-8">
      <button
        type="button"
        data-allow-phase-nav
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
        <OutlineBtn
          label="Export Summary"
          icon="download"
          onClick={() => {
            exportBoqSummaryCsv(
              cats.map((c) => ({
                label: c.label,
                estimate: c.estimate,
                pct: budgetShare(c.estimate, estimateSum) * 100,
              })),
              project.name,
              estimateSum,
            );
            toast.success("BOQ summary exported");
          }}
        />
      </div>

      <p className="mb-7 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--figma-gray400)]">
        <MaterialIcon name="info" outlined size={14} />
        Full BOQ line-item detail available in the Execution phase.
        <a
          href={projectExecutionRoute(project.id, "boq")}
          onMouseEnter={() => setLinkHover(true)}
          onMouseLeave={() => setLinkHover(false)}
          className="ml-1 font-semibold no-underline"
          style={{ color: linkHover ? "var(--figma-navy)" : "var(--figma-teal)" }}
        >
          Open Execution BOQ →
        </a>
      </p>

      {isLoading && (
        <p className="mb-4 text-[13px] text-[var(--figma-gray500)]">Loading estimate summary…</p>
      )}
      {error && <p className="mb-4 text-[13px] text-[#EF4444]">{error}</p>}

      <div className="mb-7 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {cats.map((cat) => (
          <BoqCategoryCard
            key={cat.id}
            cat={cat}
            pct={budgetShare(cat.estimate, estimateSum)}
          />
        ))}
      </div>

      <SectionCard className="px-7 py-7">
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-1 text-[13px] text-[var(--figma-gray500)]">Grand Total Estimate</div>
            <div className="text-[32px] font-extrabold tracking-tight text-[var(--figma-navy)]">
              {formatLKR(estimateSum)}
            </div>
          </div>
          <div className="text-right">
            <div className="mb-1 text-[11px] text-[var(--figma-gray400)]">All categories</div>
            <div className="text-xs font-semibold text-[var(--figma-teal)]">
              {cats.length} categories · {totalFiles} drawings uploaded
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex h-[18px] gap-0.5 overflow-hidden rounded-[9px]">
            {cats.map((cat) => {
              const pct = budgetShare(cat.estimate, estimateSum) * 100;
              if (pct <= 0) return null;
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
                {(budgetShare(cat.estimate, estimateSum) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
