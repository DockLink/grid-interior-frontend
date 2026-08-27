"use client";

import { useState } from "react";
import Link from "next/link";

import { DemoCaption } from "@/components/demo/demo-caption";
import {
  ClientAvatar,
  ClientStatusBadge,
  GradientButton,
  OutlineButton,
} from "@/components/clients/client-ui";
import {
  CommLogAttachmentChips,
  CommLogAttachmentPicker,
  currentCommLogTime,
  formatCommLogDate,
  revokeAttachmentUrls,
} from "@/components/clients/comm-log-attachments";
import { FollowUpPanel } from "@/components/clients/follow-up-panel";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { CLIENTS, COMM_LOG, type Client, type CommLogAttachment, type CommLogEntry } from "@/lib/clients/mock-clients";
import { NAV_ROUTES, clientCommLogRoute } from "@/types/navigation";
import { cn } from "@/lib/utils";

type Tab = "overview" | "comms" | "projects" | "documents" | "invoices";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "person" },
  { id: "comms", label: "Communication Log", icon: "forum" },
  { id: "projects", label: "Linked Projects", icon: "folder_open" },
  { id: "documents", label: "Documents", icon: "description" },
  { id: "invoices", label: "Invoices", icon: "receipt_long" },
];

const LINKED_PROJECTS = [
  { name: "Marchetti Residence — Apt A", phase: "Design Development", status: "on-track", date: "Sep 30, 2025", progress: 68 },
  { name: "Marchetti Penthouse", phase: "Procurement", status: "at-risk", date: "Aug 15, 2025", progress: 44 },
  { name: "Marchetti Country House", phase: "Handover", status: "completed", date: "Jun 1, 2025", progress: 100 },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  "on-track": { label: "On Track", color: "#3FA66B", bg: "rgba(63,166,107,0.10)" },
  "at-risk": { label: "At Risk", color: "#F5A623", bg: "rgba(245,166,35,0.10)" },
  completed: { label: "Completed", color: "#3FA66B", bg: "rgba(63,166,107,0.10)" },
};

export function ClientProfileScreen({
  clientId,
  initialTab = "overview",
}: {
  clientId: number;
  initialTab?: Tab;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [entries, setEntries] = useState<CommLogEntry[]>(COMM_LOG);
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];

  return (
    <div className="min-h-full px-9 py-6">
      <DemoCaption className="mb-4" />

      <Link
        href={NAV_ROUTES.clients}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-[var(--figma-teal)] no-underline"
      >
        <MaterialIcon name="arrow_back" outlined size={16} />
        Back to Clients
      </Link>

      <div className="mb-5 flex items-start gap-6 rounded-2xl bg-white p-7 neu-card">
        <ClientAvatar initials={client.initials} color={client.color} size={80} />

        <div className="flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-2xl font-bold text-[var(--figma-navy)]">{client.name}</h1>
            <ClientStatusBadge status={client.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex items-center gap-1">
              <MaterialIcon name="business" outlined size={15} className="text-[var(--figma-teal)]" />
              <span className="text-sm text-[var(--figma-gray500)]">{client.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MaterialIcon name="email" outlined size={15} className="text-[var(--figma-gray400)]" />
              <span className="text-[13px] text-[var(--figma-gray500)]">{client.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <MaterialIcon name="phone" outlined size={15} className="text-[var(--figma-gray400)]" />
              <span className="text-[13px] text-[var(--figma-gray500)]">{client.phone}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--figma-gray500)]">
            <div className="flex items-center gap-1">
              <MaterialIcon name="schedule" outlined size={14} />
              Last contact: {client.lastContact}
            </div>
            <div className="h-3.5 w-px bg-[var(--figma-border)]" />
            <div className="flex items-center gap-1">
              <MaterialIcon name="sensors" outlined size={14} />
              {client.source}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-[10px] border border-[var(--figma-border)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--figma-navy)] neu-raised"
          >
            <MaterialIcon name="edit" outlined size={16} />
            Edit
          </button>
          <GradientButton icon="notifications_active" size="sm" onClick={() => setShowFollowUp(true)}>
            Set Reminder
          </GradientButton>
        </div>
      </div>

      <div className="mb-6 inline-flex gap-1 rounded-xl border border-[var(--figma-border)] bg-[var(--figma-gray50)] p-1 neu-inset">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-[9px] border-none px-4 py-2 text-[13px] transition-all duration-200",
                isActive ? "bg-white font-semibold text-[var(--figma-navy)] neu-raised" : "bg-transparent font-normal text-[var(--figma-gray500)]",
              )}
            >
              <MaterialIcon
                name={tab.icon}
                outlined={!isActive}
                size={16}
                className={isActive ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
              />
              {tab.label}
              {isActive && tab.id === "comms" ? (
                <span className="rounded-lg bg-[var(--figma-teal)] px-1 py-px text-[10px] font-bold text-white">
                  {entries.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && <OverviewTab client={client} />}
      {activeTab === "comms" && (
        <CommLogTab
          clientId={clientId}
          entries={entries}
          onLog={() => setShowLogModal(true)}
        />
      )}
      {activeTab === "projects" && <LinkedProjectsTab />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "invoices" && <InvoicesTab />}

      {showLogModal ? (
        <LogCommModal
          onClose={() => setShowLogModal(false)}
          onSave={(entry) => {
            setEntries((prev) => [entry, ...prev]);
            setShowLogModal(false);
          }}
          nextId={Math.max(0, ...entries.map((e) => e.id)) + 1}
          clientName={client.name}
        />
      ) : null}
      {showFollowUp ? <FollowUpPanel clientId={clientId} onClose={() => setShowFollowUp(false)} /> : null}
    </div>
  );
}

function ContactRow({ icon, label, value, iconColor }: { icon: string; label: string; value: string; iconColor?: string }) {
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
        <div className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--figma-gray400)]">{label}</div>
        <div className="text-[13px] font-medium text-[var(--figma-navy)]">{value}</div>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
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

function OverviewTab({ client }: { client: Client }) {
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
            {client.notes ??
              "Long-standing client since 2022. Prefers thorough written briefings before each phase. Has referred 2 new clients (Visconti, Romano). Always pays within 7 days of invoice."}
          </p>
        </div>
      </div>

      <div className="col-span-2 overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
        <div className="flex items-center gap-2 border-b border-[var(--figma-border)] px-5 py-4">
          <MaterialIcon name="history" outlined size={18} className="text-[var(--figma-teal)]" />
          <h3 className="m-0 text-[15px] font-semibold text-[var(--figma-navy)]">Project History</h3>
        </div>
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
            {LINKED_PROJECTS.map((p, i) => (
              <ProjectRow key={p.name} project={p} statusCfg={STATUS_CFG[p.status]} isLast={i === LINKED_PROJECTS.length - 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectRow({
  project: p,
  statusCfg: s,
  isLast,
}: {
  project: (typeof LINKED_PROJECTS)[0];
  statusCfg: (typeof STATUS_CFG)[string];
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        "cursor-pointer transition-colors duration-120",
        hov ? "bg-[rgba(14,124,134,0.04)]" : "bg-white",
        !isLast && "border-b border-[var(--figma-border)]",
      )}
    >
      <td className="px-4 py-3 text-[13px] font-semibold text-[var(--figma-navy)]">{p.name}</td>
      <td className="px-4 py-3 text-[13px] text-[var(--figma-gray500)]">{p.phase}</td>
      <td className="px-4 py-3">
        <MiniProg value={p.progress} />
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ color: s.color, background: s.bg }}
        >
          <span className="size-1.5 rounded-full" style={{ background: s.color }} />
          {s.label}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--figma-gray500)]">{p.date}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg border border-[var(--figma-border)] bg-transparent px-3 py-1 text-xs text-[var(--figma-navy)]"
        >
          Open
          <MaterialIcon name="arrow_forward" outlined size={12} />
        </button>
      </td>
    </tr>
  );
}

function CommLogTab({
  clientId,
  entries,
  onLog,
}: {
  clientId: number;
  entries: CommLogEntry[];
  onLog: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "call" | "email" | "meeting">("all");
  const filtered = entries.filter((e) => filter === "all" || e.type === filter);
  const ICON_CFG = {
    call: { icon: "phone", color: "var(--figma-success)", bg: "rgba(63,166,107,0.10)" },
    email: { icon: "email", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)" },
    meeting: { icon: "groups", color: "var(--figma-navy)", bg: "rgba(27,42,74,0.09)" },
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "call", "email", "meeting"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border-none px-4 py-1.5 text-xs transition-all duration-150",
                filter === f ? "gi-gradient-cta font-semibold text-white" : "bg-[var(--figma-gray100)] font-normal text-[var(--figma-gray500)]",
              )}
            >
              {f === "all" ? "All" : `${f.charAt(0).toUpperCase()}${f.slice(1)}s`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Link
            href={clientCommLogRoute(clientId)}
            className="flex items-center gap-1 rounded-full border border-[var(--figma-border)] bg-white px-4 py-2 text-xs font-medium text-[var(--figma-navy)] no-underline neu-raised"
          >
            Full log
            <MaterialIcon name="open_in_new" outlined size={13} />
          </Link>
          <GradientButton icon="add" size="sm" onClick={onLog}>
            Log Communication
          </GradientButton>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((entry, i) => {
          const cfg = ICON_CFG[entry.type];
          return (
            <div key={entry.id} className="relative flex gap-3.5">
              {i < filtered.length - 1 ? (
                <div className="absolute bottom-[-12px] left-[19px] top-11 z-0 w-0.5 bg-[var(--figma-border)]" />
              ) : null}
              <div
                className="relative z-[1] flex size-10 shrink-0 items-center justify-center rounded-full neu-card"
                style={{ background: cfg.bg }}
              >
                <MaterialIcon name={cfg.icon} outlined size={18} style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 rounded-xl border border-[rgba(229,231,235,0.5)] bg-white p-4 neu-card">
                <div className="mb-2 flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize" style={{ color: cfg.color }}>
                      {entry.type}
                    </span>
                    <span className="text-[11px] text-[var(--figma-gray400)]">·</span>
                    <span className="text-xs text-[var(--figma-gray500)]">
                      {entry.date} · {entry.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex size-[22px] items-center justify-center rounded-full text-[9px] font-bold text-white gi-gradient-cta">
                      {entry.initials}
                    </div>
                    <span className="text-xs text-[var(--figma-gray500)]">{entry.member}</span>
                  </div>
                </div>
                {entry.note ? (
                  <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">{entry.note}</p>
                ) : null}
                {entry.attachments?.length ? (
                  <div className={entry.note ? "mt-3" : undefined}>
                    <CommLogAttachmentChips attachments={entry.attachments} />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LinkedProjectsTab() {
  const projects = [
    { name: "Marchetti Residence — Apt A", phase: "Layout", status: "active", progress: 38, start: "Mar 2026", due: "08 Sep 2026", team: ["PN", "DS", "AP"] },
    { name: "Marchetti Penthouse", phase: "Concept Design", status: "active", progress: 60, start: "Jun 2026", due: "14 Aug 2026", team: ["DS", "RF"] },
    { name: "Marchetti Country House", phase: "Execution", status: "completed", progress: 100, start: "Jan 2025", due: "Jun 2025", team: ["PN", "AP", "RF"] },
  ];
  const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Active", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.08)" },
    completed: { label: "Completed", color: "#3FA66B", bg: "#DCFCE7" },
    "on-hold": { label: "On Hold", color: "#D97706", bg: "#FEF3C7" },
  };

  return (
    <div className="flex flex-col gap-3.5">
      {projects.map((p) => {
        const sc = STATUS[p.status];
        return (
          <div key={p.name} className="grid grid-cols-[1fr_auto] gap-3 rounded-[14px] bg-white p-5 neu-card">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-bold text-[var(--figma-navy)]">{p.name}</span>
                <span className="rounded-lg px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: sc.bg, color: sc.color }}>
                  {sc.label}
                </span>
                <span className="rounded-lg bg-[rgba(27,42,74,0.06)] px-2.5 py-0.5 text-[11px] text-[var(--figma-navy)]">{p.phase}</span>
              </div>
              <div className="mb-2">
                <div className="mb-1 flex justify-between">
                  <span className="text-[11px] text-[var(--figma-gray500)]">Progress</span>
                  <span className="text-[11px] font-bold text-[var(--figma-navy)]">{p.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-sm bg-[var(--figma-gray100)]">
                  <div className="h-full rounded-sm gi-gradient-cta" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <div className="flex gap-4 text-[11px] text-[var(--figma-gray400)]">
                <span className="flex items-center gap-1">
                  <MaterialIcon name="play_circle" outlined size={13} />
                  Started: {p.start}
                </span>
                <span className="flex items-center gap-1">
                  <MaterialIcon name="event" outlined size={13} />
                  Due: {p.due}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="flex">
                {p.team.map((ini, ti) => (
                  <div
                    key={ini}
                    className="flex size-[26px] items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
                    style={{ background: `hsl(${ti * 80 + 200},45%,40%)`, marginLeft: ti > 0 ? -8 : 0 }}
                  >
                    {ini}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="flex items-center gap-1 rounded-2xl border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-1.5 text-xs text-[var(--figma-navy)] neu-raised"
              >
                Open
                <MaterialIcon name="arrow_forward" outlined size={13} />
              </button>
            </div>
          </div>
        );
      })}
      <GradientButton icon="add" size="sm" className="self-start">
        Link New Project
      </GradientButton>
    </div>
  );
}

function DocumentsTab() {
  const FOLDERS = [
    { label: "Contracts", count: 3, color: "var(--figma-navy)" },
    { label: "Client Approvals", count: 5, color: "var(--figma-teal)" },
    { label: "Mood Boards", count: 8, color: "#8B5CF6" },
    { label: "Supplier Quotes", count: 4, color: "#D97706" },
    { label: "Site Photos", count: 12, color: "#059669" },
    { label: "Drawings", count: 6, color: "#0891B2" },
  ];
  const FILES = [
    { name: "Interior Design Brief.pdf", type: "PDF", date: "20 Jul 2026", size: "2.4 MB", uploader: "PN" },
    { name: "Marchetti_Contract_Signed.pdf", type: "PDF", date: "18 Jul 2026", size: "1.1 MB", uploader: "AP" },
    { name: "Concept_Presentation_v2.pptx", type: "PPT", date: "25 Jul 2026", size: "18 MB", uploader: "DS" },
    { name: "Phase1_Approval_Email.pdf", type: "PDF", date: "22 Jul 2026", size: "0.3 MB", uploader: "PN" },
  ];
  const TYPE_COLORS: Record<string, string> = { PDF: "var(--figma-alert)", PPT: "#D97706", DOC: "var(--figma-navy)", DWG: "var(--figma-teal)" };

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-3">
        {FOLDERS.map((f) => (
          <div key={f.label} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-4 neu-card">
            <MaterialIcon name="folder" outlined size={28} style={{ color: f.color }} />
            <div>
              <div className="text-[13px] font-semibold text-[var(--figma-navy)]">{f.label}</div>
              <div className="text-[11px] text-[var(--figma-gray400)]">{f.count} files</div>
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[14px] bg-white neu-card">
        <div className="flex items-center justify-between border-b border-[var(--figma-border)] px-4 py-3.5">
          <span className="text-[13px] font-bold text-[var(--figma-navy)]">Recent Files</span>
          <GradientButton icon="upload" size="sm">
            Upload File
          </GradientButton>
        </div>
        {FILES.map((f, i) => (
          <div
            key={f.name}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3",
              i < FILES.length - 1 && "border-b border-[var(--figma-border)]",
            )}
          >
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${TYPE_COLORS[f.type] ?? "var(--figma-navy)"}14` }}
            >
              <MaterialIcon name="description" outlined size={16} style={{ color: TYPE_COLORS[f.type] ?? "var(--figma-navy)" }} />
            </div>
            <span className="flex-1 text-[13px] font-medium text-[var(--figma-navy)]">{f.name}</span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: `${TYPE_COLORS[f.type] ?? "var(--figma-navy)"}14`, color: TYPE_COLORS[f.type] ?? "var(--figma-navy)" }}
            >
              {f.type}
            </span>
            <span className="text-[11px] text-[var(--figma-gray400)]">{f.size}</span>
            <span className="text-[11px] text-[var(--figma-gray400)]">{f.date}</span>
            <div className="flex size-[22px] items-center justify-center rounded-full bg-[var(--figma-teal)] text-[9px] font-bold text-white">
              {f.uploader}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoicesTab() {
  const INVOICES = [
    { id: "INV-0041", project: "Marchetti Residence", amount: "AED 48,500", issued: "01 Jul 2026", due: "15 Jul 2026", status: "Paid" },
    { id: "INV-0039", project: "Marchetti Residence", amount: "AED 32,000", issued: "01 Jun 2026", due: "15 Jun 2026", status: "Paid" },
    { id: "INV-0044", project: "Marchetti Penthouse", amount: "AED 24,000", issued: "20 Jul 2026", due: "03 Aug 2026", status: "Pending" },
    { id: "INV-0046", project: "Marchetti Residence", amount: "AED 18,500", issued: "28 Jul 2026", due: "11 Aug 2026", status: "Draft" },
    { id: "INV-0033", project: "Marchetti Country", amount: "AED 95,000", issued: "15 Jan 2026", due: "29 Jan 2026", status: "Paid" },
  ];
  const STATUS_CFG_INV: Record<string, { color: string; bg: string }> = {
    Paid: { color: "#3FA66B", bg: "#DCFCE7" },
    Pending: { color: "#D97706", bg: "#FEF3C7" },
    Overdue: { color: "var(--figma-alert)", bg: "#FEE2E2" },
    Draft: { color: "var(--figma-gray500)", bg: "var(--figma-gray100)" },
  };

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-3.5">
        {[
          { label: "Total Invoiced", val: "AED 218,000", icon: "receipt_long", color: "var(--figma-navy)" },
          { label: "Amount Received", val: "AED 175,500", icon: "check_circle", color: "#3FA66B" },
          { label: "Outstanding", val: "AED 42,500", icon: "pending", color: "#D97706" },
        ].map((tile) => (
          <div key={tile.label} className="flex items-center gap-3.5 rounded-[14px] bg-white p-5 neu-card">
            <div
              className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] neu-inset"
              style={{ background: `${tile.color}12` }}
            >
              <MaterialIcon name={tile.icon} outlined size={20} style={{ color: tile.color }} />
            </div>
            <div>
              <div className="text-lg font-extrabold text-[var(--figma-navy)]">{tile.val}</div>
              <div className="text-[11px] text-[var(--figma-gray500)]">{tile.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[14px] bg-white neu-card">
        <div className="border-b border-[var(--figma-border)] px-4 py-3.5">
          <span className="text-[13px] font-bold text-[var(--figma-navy)]">Invoice History</span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--figma-gray50)]">
              {["Invoice #", "Project", "Amount", "Issued", "Due", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="border-b border-[var(--figma-border)] px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--figma-gray500)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv, i) => {
              const sc = STATUS_CFG_INV[inv.status];
              return (
                <tr key={inv.id} className={i < INVOICES.length - 1 ? "border-b border-[var(--figma-border)]" : ""}>
                  <td className="px-4 py-2.5 text-xs font-bold text-[var(--figma-navy)]">{inv.id}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--figma-gray500)]">{inv.project}</td>
                  <td className="px-4 py-2.5 text-[13px] font-bold text-[var(--figma-navy)]">{inv.amount}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--figma-gray400)]">{inv.issued}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--figma-gray400)]">{inv.due}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-lg px-2 py-0.5 text-[11px] font-semibold" style={{ background: sc.bg, color: sc.color }}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      className="flex items-center gap-0.5 rounded-md border border-[var(--figma-border)] bg-transparent px-2.5 py-0.5 text-[11px] text-[var(--figma-navy)]"
                    >
                      View
                      <MaterialIcon name="open_in_new" outlined size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LogCommModal({
  onClose,
  onSave,
  nextId,
  clientName,
}: {
  onClose: () => void;
  onSave: (entry: CommLogEntry) => void;
  nextId: number;
  clientName: string;
}) {
  const [type, setType] = useState<"Call" | "Email" | "Meeting">("Call");
  const [date, setDate] = useState("2025-07-31");
  const [notes, setNotes] = useState("");
  const [notesFocus, setNotesFocus] = useState(false);
  const [attachments, setAttachments] = useState<CommLogAttachment[]>([]);

  const TYPE_CFG = {
    Call: { icon: "phone", color: "var(--figma-success)" },
    Email: { icon: "email", color: "var(--figma-teal)" },
    Meeting: { icon: "groups", color: "var(--figma-navy)" },
  };

  const TYPE_MAP = { Call: "call", Email: "email", Meeting: "meeting" } as const;

  const discardAndClose = () => {
    revokeAttachmentUrls(attachments);
    onClose();
  };

  const handleSave = () => {
    onSave({
      id: nextId,
      type: TYPE_MAP[type],
      date: formatCommLogDate(date),
      time: currentCommLogTime(),
      member: "Sofia Marchetti",
      initials: "SM",
      note: notes,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.20)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && discardAndClose()}
    >
      <div
        className="hub-modal-in flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[20px] bg-white px-9 py-8"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-6 flex shrink-0 items-start justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">Log Communication</h2>
            <p className="m-0 flex items-center gap-1 text-[13px] text-[var(--figma-gray500)]">
              <MaterialIcon name="person" outlined size={14} />
              {clientName}
            </p>
          </div>
          <button
            type="button"
            onClick={discardAndClose}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[var(--figma-navy)]">Communication Type</label>
            <div className="flex gap-2">
              {(["Call", "Email", "Meeting"] as const).map((t) => {
                const cfg = TYPE_CFG[t];
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="flex flex-1 flex-col items-center gap-1 rounded-[10px] border-[1.5px] py-2.5 transition-all duration-150"
                    style={{
                      borderColor: isSelected ? cfg.color : "var(--figma-border)",
                      background: isSelected ? `${cfg.color}10` : "#fff",
                    }}
                  >
                    <MaterialIcon name={cfg.icon} outlined size={20} style={{ color: isSelected ? cfg.color : "var(--figma-gray400)" }} />
                    <span className="text-xs" style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? cfg.color : "var(--figma-gray500)" }}>
                      {t}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Date & Time</label>
            <div className="relative">
              <MaterialIcon
                name="calendar_today"
                outlined
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="hub-input-focus w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pl-9 pr-3.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={() => setNotesFocus(true)}
              onBlur={() => setNotesFocus(false)}
              placeholder="Describe the communication… what was discussed, decisions made, follow-ups required."
              rows={4}
              className={cn(
                "w-full resize-y rounded-[10px] border-[1.5px] bg-white p-3 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none transition-all duration-150",
                notesFocus
                  ? "border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_3px_rgba(14,124,134,0.08)]"
                  : "border-[var(--figma-border)] neu-inset",
              )}
            />
          </div>

          <CommLogAttachmentPicker files={attachments} onChange={setAttachments} />
        </div>

        <div className="mt-6 flex shrink-0 gap-2.5">
          <OutlineButton onClick={discardAndClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton icon="save" onClick={handleSave} className="flex-[2]">
            Save Log
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
