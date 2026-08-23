"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AvatarStack } from "@/components/projects/hub/avatar-stack";
import { HubFilterSelect, HubPagination } from "@/components/projects/hub/hub-filters";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { NeuTabToggle } from "@/components/projects/hub/neu-tab-toggle";
import { NewProjectModal } from "@/components/projects/hub/new-project-modal";
import { PhaseBadge } from "@/components/projects/hub/phase-badge";
import { HubProgressBar } from "@/components/projects/hub/progress-bar";
import { StatusBadge } from "@/components/projects/hub/status-badge";
import { PHASES } from "@/lib/projects/design-tokens";
import {
  filterActiveProjects,
  filterHistoricalProjects,
  getAllActiveProjects,
} from "@/lib/projects/mock-projects";
import type { ActiveProjectView, HistoricalProjectView } from "@/types/project-hub";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PER_PAGE = 8;

type ListTab = "active" | "historical";

function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 px-12 py-20">
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" aria-hidden>
        <rect x="10" y="20" width="100" height="60" rx="8" stroke="var(--figma-border)" strokeWidth="2" fill="var(--figma-gray50)" />
        <rect x="22" y="34" width="36" height="5" rx="2.5" fill="var(--figma-gray200)" />
        <rect x="22" y="44" width="56" height="4" rx="2" fill="var(--figma-gray100)" />
        <rect x="22" y="52" width="44" height="4" rx="2" fill="var(--figma-gray100)" />
        <circle cx="90" cy="24" r="14" fill="var(--figma-gray50)" stroke="var(--figma-border)" strokeWidth="2" />
        <path d="M85 24 L89 28 L95 20" stroke="var(--figma-gray200)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="text-center">
        <div className="mb-1.5 text-base font-semibold text-[var(--figma-navy)]">No projects yet</div>
        <div className="text-[13px] text-[var(--figma-gray500)]">{label}</div>
      </div>
      <button type="button" onClick={onAdd} className="gi-gradient-cta flex cursor-pointer items-center gap-1.5 rounded-[24px] px-[22px] py-2.5 text-[13px] font-semibold">
        <MaterialIcon name="add" outlined size={16} />
        New Project
      </button>
    </div>
  );
}

function HistoricalCard({
  project,
  onClick,
}: {
  project: HistoricalProjectView;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer overflow-hidden rounded-2xl bg-white transition-all duration-220"
      style={{
        boxShadow: hover ? "var(--neu-card-hover)" : "var(--neu-card)",
        transform: hover ? "translateY(-3px)" : "none",
      }}
    >
      <div className="relative h-40 overflow-hidden bg-[var(--figma-gray100)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.photo}
          alt={project.photoAlt}
          className="size-full object-cover transition-transform duration-350"
          style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
        />
        {hover && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(27,42,74,0.35)]">
            <MaterialIcon name="open_in_full" outlined size={32} className="text-white opacity-90" />
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-[20px] bg-[#DCFCE7] px-2.5 py-0.5 text-[10px] font-semibold text-[#3FA66B]">
          <MaterialIcon name="done_all" size={11} />
          Completed
        </div>
      </div>
      <div className="px-4 pt-3.5 pb-4">
        <div className="mb-0.5 text-sm leading-snug font-bold text-[var(--figma-navy)]">{project.name}</div>
        <div className="mb-1.5 text-xs font-medium text-[var(--figma-teal)]">{project.clientName}</div>
        <div className="mb-2.5 line-clamp-2 text-[11px] leading-relaxed text-[var(--figma-gray500)]">
          {project.description}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--figma-gray400)]">
            {project.startDate} — {project.completionDate}
          </span>
          <span className="rounded-[10px] bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-semibold text-[#0284C7]">
            {project.type}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActiveProjectRow({
  project,
  onClick,
}: {
  project: ActiveProjectView;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const progressColor =
    project.status === "Overdue" || project.status === "At Risk" ? "#F26D6D" : "var(--figma-teal)";

  return (
    <TableRow
      className="cursor-pointer border-[var(--figma-border)]"
      style={{ background: hover ? "rgba(14,124,134,0.03)" : "#fff" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <TableCell className="px-4 py-3.5">
        <div className="mb-0.5 text-[13px] font-semibold text-[var(--figma-navy)]">{project.name}</div>
        <div className="text-[11px] text-[var(--figma-gray500)]">{project.projectType}</div>
      </TableCell>
      <TableCell className="px-4 py-3.5">
        <span className="text-[13px] font-medium text-[var(--figma-teal)]">{project.clientName}</span>
      </TableCell>
      <TableCell className="px-4 py-3.5">
        <PhaseBadge phase={project.phase} />
      </TableCell>
      <TableCell className="px-4 py-3.5">
        <StatusBadge status={project.status} />
      </TableCell>
      <TableCell className="px-4 py-3.5">
        <HubProgressBar value={project.progress} color={progressColor} />
      </TableCell>
      <TableCell className="px-4 py-3.5 text-xs whitespace-nowrap text-[var(--figma-gray500)]">
        {project.nextDeadline}
      </TableCell>
      <TableCell className="px-4 py-3.5">
        <AvatarStack teamIds={project.teamIds} />
      </TableCell>
      <TableCell className="px-2 py-3.5">
        <MaterialIcon name="chevron_right" outlined size={18} className="text-[var(--figma-gray400)]" />
      </TableCell>
    </TableRow>
  );
}

export function ProjectsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "historical" ? "historical" : "active";

  const [tab, setTab] = useState<ListTab>(initialTab);
  const [phaseFilter, setPhaseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [page, setPage] = useState(1);
  const [showNewProject, setShowNewProject] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setTab(searchParams.get("tab") === "historical" ? "historical" : "active");
  }, [searchParams]);

  const filteredActive = useMemo(
    () => filterActiveProjects({ search, phase: phaseFilter, status: statusFilter }),
    [search, phaseFilter, statusFilter, refreshKey],
  );

  const filteredHistorical = useMemo(
    () => filterHistoricalProjects({ search, year: yearFilter }),
    [search, yearFilter],
  );

  const totalPages = Math.ceil(filteredActive.length / PER_PAGE);
  const pageSlice = filteredActive.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = getAllActiveProjects().length;

  const statusOptions = ["All", "On Track", "At Risk", "Overdue", "In Progress", "Completed"];

  return (
    <div className="min-h-full px-10 py-8">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[26px] font-bold text-[var(--figma-navy)]">Projects</h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
            All active and historical interior design projects
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewProject(true)}
          className="gi-gradient-cta flex cursor-pointer items-center gap-2 rounded-[24px] px-[22px] py-[11px] text-[13px] font-semibold transition-transform duration-150 hover:scale-[1.01]"
        >
          <MaterialIcon name="add" outlined size={18} />
          New Project
        </button>
      </div>

      <div className="mb-6">
        <NeuTabToggle
          tabs={[
            { id: "active" as ListTab, label: "Active Projects", icon: "bolt" },
            { id: "historical" as ListTab, label: "Historical Projects", icon: "history" },
          ]}
          value={tab}
          onChange={(id) => {
            setTab(id);
            setPage(1);
          }}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative max-w-[300px] min-w-[220px] flex-[1_1_220px]">
          <MaterialIcon
            name="search"
            outlined
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-150"
            style={{ color: searchFocus ? "var(--figma-teal)" : "var(--figma-gray400)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder="Search projects or clients…"
            className="hub-input-focus w-full rounded-[10px] border bg-white py-2 pr-3 pl-9 text-[13px] text-[var(--figma-navy)] outline-none transition-all duration-150"
            style={{
              borderColor: searchFocus ? "var(--figma-teal)" : "var(--figma-border)",
              borderWidth: searchFocus ? 2 : 1.5,
              boxShadow: searchFocus
                ? "var(--neu-inset), 0 0 0 3px rgba(14,124,134,0.08)"
                : "var(--neu-inset)",
            }}
          />
        </div>

        {tab === "active" && (
          <>
            <HubFilterSelect
              value={phaseFilter}
              onChange={(v) => {
                setPhaseFilter(v);
                setPage(1);
              }}
              options={["All", ...PHASES]}
              icon="layers"
              label="Phase"
            />
            <HubFilterSelect
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={statusOptions}
              icon="flag"
              label="Status"
            />
          </>
        )}

        {tab === "historical" && (
          <HubFilterSelect
            value={yearFilter}
            onChange={setYearFilter}
            options={["All", "2026", "2025", "2024", "2023"]}
            icon="calendar_today"
            label="Year"
          />
        )}

        <div className="ml-auto flex items-center text-xs text-[var(--figma-gray400)]">
          {tab === "active" ? filteredActive.length : filteredHistorical.length} result
          {(tab === "active" ? filteredActive.length : filteredHistorical.length) !== 1 ? "s" : ""}
          {tab === "active" && activeCount > 0 ? ` · ${activeCount} active` : ""}
        </div>
      </div>

      {tab === "active" && (
        <>
          {filteredActive.length === 0 ? (
            <EmptyState label="Create your first project to get started." onAdd={() => setShowNewProject(true)} />
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white neu-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--figma-border)] bg-[var(--figma-gray50)] hover:bg-[var(--figma-gray50)]">
                    {["Project", "Client", "Phase", "Status", "Progress", "Next Deadline", "Team", ""].map(
                      (col) => (
                        <TableHead
                          key={col}
                          className="px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap text-[var(--figma-navy)]"
                        >
                          <div className="flex items-center gap-1">
                            {col}
                            {["Project", "Phase", "Status", "Next Deadline"].includes(col) && (
                              <MaterialIcon name="unfold_more" outlined size={13} className="text-[var(--figma-gray400)]" />
                            )}
                          </div>
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageSlice.map((project) => (
                    <ActiveProjectRow
                      key={project.id}
                      project={project}
                      onClick={() => router.push(`/projects/${project.id}`)}
                    />
                  ))}
                </TableBody>
              </Table>
              <HubPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {tab === "historical" && (
        <>
          {filteredHistorical.length === 0 ? (
            <EmptyState
              label="No historical projects found for the selected filters."
              onAdd={() => setShowNewProject(true)}
            />
          ) : (
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            >
              {filteredHistorical.map((project) => (
                <HistoricalCard
                  key={project.id}
                  project={project}
                  onClick={() => router.push(`/projects/historical/${project.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreate={() => {
            setShowNewProject(false);
            setRefreshKey((k) => k + 1);
            setTab("active");
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
