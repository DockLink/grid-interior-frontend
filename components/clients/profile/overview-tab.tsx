"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { CLIENT_PROJECT_STATUS_CFG } from "@/lib/clients/map-client-projects";
import { projectRoute } from "@/types/navigation";
import type { Client, ClientLinkedProject } from "@/types/clients";
import { cn } from "@/lib/utils";

function ContactRow({
  icon,
  label,
  value,
  iconColor,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}) {
  const color = iconColor ?? "var(--figma-teal)";
  return (
    <div className="flex items-start gap-3 border-b border-[var(--figma-border)] py-2.5">
      <div
        className="mt-px flex size-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}12` }}
      >
        <MaterialIcon name={icon} outlined size={16} style={{ color }} />
      </div>
      <div>
        <div className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--figma-gray400)]">
          {label}
        </div>
        <div className="text-[13px] font-medium text-[var(--figma-navy)]">{value || "—"}</div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-xl bg-white p-4 neu-card">
      <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${color}14` }}>
        <MaterialIcon name={icon} outlined size={17} style={{ color }} />
      </div>
      <div className="text-xl font-bold text-[var(--figma-navy)]">{value}</div>
      <div className="text-[11px] text-[var(--figma-gray500)]">{label}</div>
    </div>
  );
}

function MiniProg({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-[72px] overflow-hidden rounded-sm bg-[var(--figma-gray100)]">
        <div className="h-full rounded-sm gi-gradient-cta" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] text-[var(--figma-gray500)]">{value}%</span>
    </div>
  );
}

function ProjectHistoryRow({
  project,
  isLast,
}: {
  project: ClientLinkedProject;
  isLast: boolean;
}) {
  const router = useRouter();
  const [hov, setHov] = useState(false);
  const statusCfg = CLIENT_PROJECT_STATUS_CFG[project.status] ?? CLIENT_PROJECT_STATUS_CFG.active;

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        "cursor-pointer transition-colors duration-120",
        hov ? "bg-[rgba(14,124,134,0.04)]" : "bg-white",
        !isLast && "border-b border-[var(--figma-border)]",
      )}
      onClick={() => router.push(projectRoute(project.id))}
    >
      <td className="px-4 py-3 text-[13px] font-semibold text-[var(--figma-navy)]">{project.name}</td>
      <td className="px-4 py-3 text-[13px] text-[var(--figma-gray500)]">{project.phase}</td>
      <td className="px-4 py-3">
        <MiniProg value={project.progress} />
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ color: statusCfg.color, background: statusCfg.bg }}
        >
          <span className="size-1.5 rounded-full" style={{ background: statusCfg.color }} />
          {statusCfg.label}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--figma-gray500)]">{project.dueDate}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(projectRoute(project.id));
          }}
          className="flex items-center gap-1 rounded-lg border border-[var(--figma-border)] bg-transparent px-3 py-1 text-xs text-[var(--figma-navy)]"
        >
          Open
          <MaterialIcon name="arrow_forward" outlined size={12} />
        </button>
      </td>
    </tr>
  );
}

export function OverviewTab({
  client,
  projects,
  projectsLoading,
}: {
  client: Client;
  projects: ClientLinkedProject[];
  projectsLoading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="rounded-2xl bg-white p-6 neu-card">
        <div className="mb-4 flex items-center gap-2">
          <MaterialIcon name="contact_page" outlined size={18} className="text-[var(--figma-teal)]" />
          <h3 className="m-0 text-[15px] font-semibold text-[var(--figma-navy)]">Contact Details</h3>
        </div>
        <ContactRow icon="person" label="Full Name" value={client.name} />
        <ContactRow icon="business" label="Company" value={client.company} />
        <ContactRow icon="phone" label="Phone" value={client.phone} iconColor="var(--figma-success)" />
        <ContactRow icon="email" label="Email" value={client.email} iconColor="var(--figma-teal)" />
        <ContactRow icon="location_on" label="Address" value={client.address} iconColor="var(--figma-navy)" />
        <ContactRow icon="chat" label="Preferred Contact" value={client.preferredContact} iconColor="#F5A623" />
        <div className="mt-2 pt-2">
          <ContactRow icon="sensors" label="Lead Source" value={client.source} iconColor="var(--figma-navy)" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-white p-6 neu-card">
          <div className="mb-4 flex items-center gap-2">
            <MaterialIcon name="bar_chart" outlined size={18} className="text-[var(--figma-teal)]" />
            <h3 className="m-0 text-[15px] font-semibold text-[var(--figma-navy)]">Quick Stats</h3>
          </div>
          <div className="flex gap-3">
            <StatTile label="Total Projects" value={String(client.linkedProjects)} icon="folder_open" color="var(--figma-navy)" />
            <StatTile label="Active Projects" value={String(client.activeProjects)} icon="task_alt" color="var(--figma-teal)" />
            <StatTile label="Total Invoiced" value={client.totalInvoiced} icon="receipt_long" color="var(--figma-success)" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 neu-card">
          <div className="mb-3 flex items-center gap-2">
            <MaterialIcon name="sticky_note_2" outlined size={18} className="text-[var(--figma-teal)]" />
            <h3 className="m-0 text-[15px] font-semibold text-[var(--figma-navy)]">Notes</h3>
          </div>
          <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">
            {client.notes?.trim() ? client.notes : "No notes yet."}
          </p>
        </div>
      </div>

      <div className="col-span-2 overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
        <div className="flex items-center gap-2 border-b border-[var(--figma-border)] px-5 py-4">
          <MaterialIcon name="history" outlined size={18} className="text-[var(--figma-teal)]" />
          <h3 className="m-0 text-[15px] font-semibold text-[var(--figma-navy)]">Project History</h3>
        </div>
        {projectsLoading ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--figma-gray500)]">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--figma-gray500)]">
            No projects linked to this client yet.
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--figma-gray50)]">
                {["Project Name", "Phase", "Progress", "Status", "Date", ""].map((col) => (
                  <th
                    key={col}
                    className="border-b border-[var(--figma-border)] px-4 py-2.5 text-left text-xs font-semibold tracking-wide text-[var(--figma-navy)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <ProjectHistoryRow key={p.id} project={p} isLast={i === projects.length - 1} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
