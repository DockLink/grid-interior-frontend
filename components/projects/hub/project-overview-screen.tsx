"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { PhaseStepper } from "@/components/projects/hub/phase-stepper";
import { StatTile } from "@/components/projects/hub/stat-tile";
import {
  PHASE_WORKSPACES,
  WS_STATUS_CFG,
  type PhaseWorkspace,
} from "@/lib/projects/design-tokens";
import { getActiveProject, TEAM_MEMBERS } from "@/lib/projects/mock-projects";
import type { HubActivityItem } from "@/types/project-hub";
import {
  projectConceptRoute,
  projectConsultationRoute,
  projectDetailRoute,
  projectExecutionRoute,
  projectLayoutRoute,
  projectTabRoute,
  projectThreeDRoute,
} from "@/types/navigation";

function TeamAvatar({ memberId }: { memberId: number }) {
  const [hover, setHover] = useState(false);
  const member = TEAM_MEMBERS.find((t) => t.id === memberId);
  if (!member) return null;

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="flex size-11 cursor-default items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white transition-all duration-150"
        style={{
          background: member.color,
          boxShadow: hover ? "var(--neu-raised)" : "var(--neu-card)",
        }}
      >
        {member.initials}
      </div>
      {hover && (
        <div
          className="pointer-events-none absolute bottom-[110%] left-1/2 z-10 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap text-white"
          style={{ background: "var(--figma-navy)", boxShadow: "var(--neu-dropdown)" }}
        >
          <div className="font-bold">{member.name}</div>
          <div className="opacity-70">{member.role}</div>
        </div>
      )}
    </div>
  );
}

function ActivityRow({ item }: { item: HubActivityItem }) {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--figma-border)] py-2.5 last:border-b-0">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
        style={{ background: `${item.iconColor}15` }}
      >
        <MaterialIcon name={item.icon} outlined size={16} style={{ color: item.iconColor }} />
      </div>
      <div className="flex-1">
        <div className="text-[13px] leading-snug text-[var(--figma-navy)]">{item.text}</div>
        <div className="mt-0.5 text-[11px] text-[var(--figma-gray400)]">{item.time}</div>
      </div>
    </div>
  );
}

function QuickLink({
  icon,
  label,
  color,
  bg,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  bg: string;
  onClick?: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className="flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3 transition-all duration-150"
      style={{
        background: hover ? `${color}08` : "#fff",
        borderColor: hover ? color : "var(--figma-border)",
      }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px]" style={{ background: bg }}>
        <MaterialIcon name={icon} outlined size={17} style={{ color }} />
      </div>
      <span className="text-[13px] font-medium text-[var(--figma-navy)]">{label}</span>
      <MaterialIcon name="chevron_right" outlined size={16} className="ml-auto text-[var(--figma-gray200)]" />
    </div>
  );
}

function MapThumbnail({ location }: { location: string }) {
  return (
    <div className="relative flex h-[110px] items-center justify-center overflow-hidden rounded-xl border border-[var(--figma-border)] bg-gradient-to-br from-[#e8f4f8] to-[#d1eaf0]">
      <svg className="absolute inset-0 size-full opacity-30" viewBox="0 0 280 110" preserveAspectRatio="none">
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#0E7C86" strokeWidth="0.5" />
        ))}
        {[56, 112, 168, 224].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="110" stroke="#0E7C86" strokeWidth="0.5" />
        ))}
        <path d="M0,35 Q70,25 140,38 Q210,48 280,35" stroke="#0E7C86" strokeWidth="2.5" fill="none" opacity="0.7" />
        <path d="M105,0 Q110,55 105,110" stroke="#1B2A4A" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
      <div
        className="relative z-[1] size-[22px] rounded-[50%_50%_50%_0] neu-raised"
        style={{
          transform: "rotate(-45deg)",
          background: "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))",
        }}
      >
        <div className="absolute rounded-full bg-white" style={{ inset: 3, transform: "rotate(45deg)" }} />
      </div>
      <div className="absolute right-0 bottom-0 left-0 bg-[rgba(27,42,74,0.55)] px-2.5 py-1.5">
        <span className="text-[10px] font-medium text-white">{location}</span>
      </div>
    </div>
  );
}

function PhaseWorkspaceCard({
  ws,
  onOpen,
}: {
  ws: (typeof PHASE_WORKSPACES)[number];
  onOpen: () => void;
}) {
  const [hover, setHover] = useState(false);
  const sc = WS_STATUS_CFG[ws.status] ?? WS_STATUS_CFG.Upcoming;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="flex cursor-pointer flex-col gap-2.5 rounded-[14px] bg-white px-[18px] py-4 transition-all duration-180"
      style={{
        boxShadow: hover ? "var(--neu-card-hover)" : "var(--neu-card)",
        transform: hover ? "translateY(-2px)" : "none",
        borderLeft: `3px solid ${ws.color}`,
      }}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-[9px] neu-inset"
            style={{ background: ws.bg }}
          >
            <MaterialIcon name={ws.icon} outlined size={18} style={{ color: ws.color }} />
          </div>
          <span className="text-sm font-bold text-[var(--figma-navy)]">{ws.label}</span>
        </div>
        <span
          className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
          style={{ background: sc.bg, color: sc.color }}
        >
          {ws.status}
        </span>
      </div>
      <p className="m-0 text-[11px] leading-relaxed text-[var(--figma-gray500)]">{ws.desc}</p>
      <div
        className="flex items-center gap-1 text-[11px] font-semibold transition-colors duration-150"
        style={{ color: hover ? ws.color : "var(--figma-gray400)" }}
      >
        Open Workspace
        <MaterialIcon name="arrow_forward" outlined size={14} />
      </div>
    </div>
  );
}


export function ProjectOverviewScreen({ projectId }: { projectId: string }) {
  const router = useRouter();
  const project = getActiveProject(projectId);

  if (!project) {
    return (
      <div className="px-10 py-8 text-[var(--figma-gray500)]">
        Project not found. Return to the projects list.
      </div>
    );
  }

  const quickLinks = [
    {
      icon: "description",
      label: "Documents",
      color: "#0284C7",
      bg: "#E0F2FE",
      onClick: () => router.push(projectTabRoute(projectId, "files")),
    },
    {
      icon: "timeline",
      label: "Timeline",
      color: "#0E7C86",
      bg: "#CCFBF1",
      onClick: () => router.push(projectTabRoute(projectId, "timeline")),
    },
    {
      icon: "map",
      label: "Site Location",
      color: "#D97706",
      bg: "#FEF3C7",
      onClick: () => {
        document.getElementById("hub-site-location")?.scrollIntoView({ behavior: "smooth" });
      },
    },
    ...(project.phase === "Execution"
      ? [
          {
            icon: "receipt_long",
            label: "BOQ",
            color: "#1B2A4A",
            bg: "#E2E8F0",
            onClick: () => router.push(projectExecutionRoute(projectId, "boq")),
          },
        ]
      : []),
  ];

  const openWorkspace = (phase: PhaseWorkspace) => {
    const routes: Record<PhaseWorkspace, (id: string) => string> = {
      consultation: projectConsultationRoute,
      concept: projectConceptRoute,
      layout: projectLayoutRoute,
      threed: projectThreeDRoute,
      detail: projectDetailRoute,
      execution: projectExecutionRoute,
    };
    router.push(routes[phase](projectId));
  };

  return (
    <div className="px-10 py-7">
      <PhaseStepper currentPhaseIndex={project.phaseIndex} />

      <div className="mb-6 flex flex-wrap gap-4">
        <StatTile
          icon="schedule"
          label="Days Active"
          value={String(project.daysActive)}
          sub={`Since ${project.startDate}`}
          color="#0E7C86"
        />
        <StatTile
          icon="task_alt"
          label="Tasks Completed"
          value={`${project.tasksDone} / ${project.tasksTotal}`}
          sub={`${project.tasksTotal ? Math.round((project.tasksDone / project.tasksTotal) * 100) : 0}% done`}
          color="#3FA66B"
        />
        <StatTile
          icon="people"
          label="Team Size"
          value={String(project.teamIds.length)}
          sub="assigned members"
          color="#7C3AED"
        />
        <StatTile
          icon="event"
          label="Next Deadline"
          value={project.nextDeadline}
          sub={project.status === "Overdue" ? "Overdue!" : "Upcoming"}
          color={project.status === "Overdue" ? "#F26D6D" : "#1B2A4A"}
        />
      </div>

      <div className="neu-card mb-6 rounded-2xl bg-white px-6 py-[18px]">
        <div className="mb-3.5 flex items-center gap-2">
          <MaterialIcon name="group" outlined size={18} className="text-[var(--figma-teal)]" />
          <span className="text-sm font-semibold text-[var(--figma-navy)]">Assigned Team</span>
        </div>
        <div className="flex flex-wrap gap-3.5">
          {project.teamIds.map((id) => (
            <TeamAvatar key={id} memberId={id} />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3.5 flex items-center gap-2">
          <MaterialIcon name="workspaces" outlined size={18} className="text-[var(--figma-teal)]" />
          <span className="text-sm font-bold text-[var(--figma-navy)]">Project Workspaces</span>
          <span className="ml-1 text-[11px] text-[var(--figma-gray400)]">Click any workspace to open it</span>
        </div>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {PHASE_WORKSPACES.map((ws) => (
            <PhaseWorkspaceCard key={ws.id} ws={ws} onOpen={() => openWorkspace(ws.id)} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="neu-card rounded-2xl bg-white px-6 py-[18px]">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MaterialIcon name="history" outlined size={18} className="text-[var(--figma-teal)]" />
              <span className="text-sm font-semibold text-[var(--figma-navy)]">Recent Activity</span>
            </div>
            <Link
              href={projectTabRoute(projectId, "files")}
              className="cursor-pointer text-[11px] font-medium text-[var(--figma-teal)] no-underline hover:underline"
            >
              View all
            </Link>
          </div>
          {project.activity.map((item, idx) => (
            <ActivityRow key={idx} item={item} />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="neu-card rounded-2xl bg-white px-6 py-[18px]">
            <div className="mb-3.5 flex items-center gap-2">
              <MaterialIcon name="apps" outlined size={18} className="text-[var(--figma-teal)]" />
              <span className="text-sm font-semibold text-[var(--figma-navy)]">Quick Links</span>
            </div>
            <div className="flex flex-col gap-2">
              {quickLinks.map((l) => (
                <QuickLink key={l.label} {...l} />
              ))}
            </div>
          </div>
          <div id="hub-site-location">
            <MapThumbnail location={project.location} />
            <p className="mt-2 text-[11px] text-[var(--figma-gray400)]">
              {project.distanceKm} km from GRID Interior, Dehiwala
              {project.distanceKm <= 10
                ? " · eligible for free consultation"
                : " · paid consultation only"}
            </p>
          </div>
          <div className="neu-card rounded-2xl bg-white px-6 py-[18px]">
            <div className="mb-3 flex items-center gap-2">
              <MaterialIcon name="description" outlined size={18} className="text-[var(--figma-teal)]" />
              <span className="text-sm font-semibold text-[var(--figma-navy)]">Client Brief</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--figma-border)] bg-[var(--figma-gray50)] px-3 py-2.5">
              <MaterialIcon name="picture_as_pdf" outlined size={18} className="text-[#EF4444]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-[var(--figma-navy)]">
                  Client_Brief_Marchetti.pdf
                </div>
                <div className="text-[11px] text-[var(--figma-gray400)]">2.2 MB · 05 Jul 2026</div>
              </div>
            </div>
            <button
              type="button"
              className="mt-3 cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[var(--figma-teal)]"
            >
              Upload brief document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
