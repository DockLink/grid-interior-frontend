"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, X } from "lucide-react";

import {
  PROJECTS_OVERVIEW_DATA,
  PROJ_STATUS_CONFIG,
  type ProjectOverviewItem,
} from "@/components/dashboard/studio/demo-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PHASES } from "@/lib/projects/design-tokens";
import { NAV_ROUTES, projectRoute } from "@/types/navigation";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...Object.entries(PROJ_STATUS_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  })),
] as const;

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF1F6]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function ProjectRow({ proj }: { proj: ProjectOverviewItem }) {
  const cfg = PROJ_STATUS_CONFIG[proj.status];
  const href = proj.projectId ? projectRoute(proj.projectId) : NAV_ROUTES.projects;
  return (
    <div
      className="grid items-center border-b border-[#E4E9F0] px-6 py-3.5 transition-colors last:border-0 hover:bg-[#F0FAFA]"
      style={{ gridTemplateColumns: "80px 1.6fr 1fr 1fr 110px 110px 120px 64px" }}
    >
      <span className="font-mono text-[11px] font-semibold text-[#5B6B85]">{proj.code}</span>
      <span className="text-[13.5px] font-semibold text-[#16233D]">{proj.name}</span>
      <span className="text-[12px] text-[#5B6B85]">{proj.client}</span>
      <span className="text-[12px] font-medium text-[#16233D]">{proj.phase}</span>
      <span>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
      </span>
      <span className="text-[12px] text-[#5B6B85]">{proj.nextDeadline}</span>
      <div className="pr-4">
        <div className="mb-1.5 flex justify-between text-[10px] text-[#5B6B85]">
          <span>{proj.progress}%</span>
        </div>
        <ProgressBar pct={proj.progress} color={cfg.bar} />
      </div>
      <div>
        <Link
          href={href}
          className="inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#E6F7F7]"
          style={{ borderColor: "#0FA8A0", color: "#0FA8A0" }}
        >
          View
        </Link>
      </div>
    </div>
  );
}

function ProjectCard({ proj }: { proj: ProjectOverviewItem }) {
  const cfg = PROJ_STATUS_CONFIG[proj.status];
  const href = proj.projectId ? projectRoute(proj.projectId) : NAV_ROUTES.projects;
  return (
    <div className="space-y-2 px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[11px] font-semibold text-[#5B6B85]">{proj.code}</div>
          <div className="text-[14px] font-semibold text-[#16233D]">{proj.name}</div>
          <div className="text-[12px] text-[#5B6B85]">{proj.client}</div>
          <div className="text-[11px] text-[#5B6B85]">
            {proj.phase} · {proj.nextDeadline}
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ProgressBar pct={proj.progress} color={cfg.bar} />
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#E6F7F7]"
          style={{ borderColor: "#0FA8A0", color: "#0FA8A0" }}
        >
          View
        </Link>
      </div>
    </div>
  );
}

export function ProjectsOverview({
  items = PROJECTS_OVERVIEW_DATA,
  title = "Projects Overview",
}: {
  items?: ProjectOverviewItem[];
  title?: string;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");

  const phaseOptions = useMemo(() => {
    const fromData = items.map((p) => p.phase).filter(Boolean);
    const merged = Array.from(new Set([...PHASES, ...fromData]));
    return [{ value: "all", label: "All phases" }, ...merged.map((p) => ({ value: p, label: p }))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (phaseFilter !== "all" && p.phase !== phaseFilter) return false;
      return true;
    });
  }, [items, statusFilter, phaseFilter]);

  const hasActiveFilters = statusFilter !== "all" || phaseFilter !== "all";

  function clearFilters() {
    setStatusFilter("all");
    setPhaseFilter("all");
  }

  const filterLabel = hasActiveFilters
    ? [
        statusFilter !== "all"
          ? PROJ_STATUS_CONFIG[statusFilter as keyof typeof PROJ_STATUS_CONFIG]?.label
          : null,
        phaseFilter !== "all" ? phaseFilter : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Filter";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E9F0] bg-white shadow-[0px_4px_16px_rgba(11,37,69,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E9F0] px-6 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#16233D]">{title}</h3>
          <p className="text-[12px] text-[#5B6B85]">
            {hasActiveFilters
              ? `${filteredItems.length} of ${items.length} projects`
              : `${items.length} projects across all studios`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] transition-colors ${
                hasActiveFilters
                  ? "border-[#0FA8A0] bg-[#E6F7F7] text-[#0FA8A0]"
                  : "border-[#E4E9F0] text-[#5B6B85] hover:border-[#0FA8A0] hover:text-[#0FA8A0]"
              }`}
            >
              <Filter className="size-3.5" />
              <span className="max-w-[140px] truncate">{filterLabel}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[220px]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Phase</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={phaseFilter} onValueChange={setPhaseFilter}>
                {phaseOptions.map((opt) => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>

              {hasActiveFilters ? (
                <>
                  <DropdownMenuSeparator />
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left text-sm text-[#5B6B85] hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="size-3.5" />
                    Clear filters
                  </button>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-[#E4E9F0] px-2.5 py-2 text-[#5B6B85] transition-colors hover:border-[#FF6B6B] hover:text-[#FF6B6B]"
              aria-label="Clear filters"
            >
              <X className="size-3.5" />
            </button>
          ) : null}

          <Link
            href={NAV_ROUTES.projects}
            className="inline-flex h-7 items-center rounded-full border border-[#0FA8A0] px-3 text-[0.8rem] font-medium text-[#0FA8A0] transition-colors hover:bg-[#E6F7F7]"
          >
            All Projects
          </Link>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-[14px] font-medium text-[#16233D]">No projects match these filters</p>
          <p className="mt-1 text-[12px] text-[#5B6B85]">Try another status or phase, or clear filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#0FA8A0] px-3 py-2 text-[12px] font-medium text-[#0FA8A0] transition-colors hover:bg-[#E6F7F7]"
          >
            <X className="size-3.5" />
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <div
              className="grid border-b border-[#E4E9F0] px-6 py-2.5 text-[11px] font-semibold tracking-wider text-[#5B6B85] uppercase"
              style={{ gridTemplateColumns: "80px 1.6fr 1fr 1fr 110px 110px 120px 64px" }}
            >
              <span>Code</span>
              <span>Project</span>
              <span>Client</span>
              <span>Phase</span>
              <span>Status</span>
              <span>Next deadline</span>
              <span>Progress</span>
              <span />
            </div>
            {filteredItems.map((proj) => (
              <ProjectRow key={proj.id} proj={proj} />
            ))}
          </div>

          <div className="divide-y divide-[#E4E9F0] md:hidden">
            {filteredItems.map((proj) => (
              <ProjectCard key={proj.id} proj={proj} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
