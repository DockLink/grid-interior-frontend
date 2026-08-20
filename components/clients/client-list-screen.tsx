"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  ClientAvatar,
  ClientStatusBadge,
  FilterDropdown,
  GradientButton,
  NeuPagination,
  NeuSearchInput,
  OutlineButton,
  ProjectCountBadge,
} from "@/components/clients/client-ui";
import { FollowUpPanel } from "@/components/clients/follow-up-panel";
import { CLIENTS, type Client, type ClientStatus } from "@/lib/clients/mock-clients";
import { clientRoute } from "@/types/navigation";
import { cn } from "@/lib/utils";

const PER_PAGE = 8;

export function ClientListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const filtered = CLIENTS.filter((c) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchSource = sourceFilter === "All" || c.source === sourceFilter;
    return matchQ && matchStatus && matchSource;
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goToClient = (id: number) => router.push(clientRoute(id));

  return (
    <div className="min-h-full px-9 py-8">
      <DemoCaption className="mb-4" />

      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="mb-1.5 text-[28px] font-bold text-[var(--figma-navy)]">Clients</h1>
          <p className="m-0 text-sm leading-relaxed text-[var(--figma-gray500)]">
            Manage client profiles and relationships · {CLIENTS.length} total
          </p>
        </div>
        <GradientButton icon="person_add" onClick={() => setShowAdd(true)}>
          Add Client
        </GradientButton>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <NeuSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name, company, email…"
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          options={["All", "Active", "Lead", "Past"]}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />
        <FilterDropdown
          label="Lead Source"
          value={sourceFilter}
          options={["All", "Referral", "Instagram", "Website", "Walk-in"]}
          onChange={(v) => {
            setSourceFilter(v);
            setPage(1);
          }}
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[var(--figma-gray400)]">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={() => setShowFollowUp(true)}
            className="flex items-center gap-1.5 rounded-[10px] border border-[var(--figma-border)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--figma-navy)] neu-raised"
          >
            <MaterialIcon name="notifications_active" outlined size={15} className="text-[var(--figma-teal)]" />
            Reminders
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--figma-gray50)]">
              {["Client", "Company", "Contact", "Projects", "Last Contact", "Status", ""].map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap border-b border-[var(--figma-border)] px-4 py-2.5 text-left text-xs font-semibold tracking-wide text-[var(--figma-navy)]"
                >
                  <div className="flex items-center gap-1">
                    {col}
                    {["Client", "Company", "Last Contact", "Status"].includes(col) ? (
                      <MaterialIcon name="unfold_more" outlined size={13} className="text-[var(--figma-gray400)]" />
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <EmptyState onAdd={() => setShowAdd(true)} />
            ) : (
              paged.map((c) => <ClientRow key={c.id} client={c} onSelect={() => goToClient(c.id)} />)
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-[var(--figma-border)] px-5 py-3">
          <span className="text-xs text-[var(--figma-gray400)]">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} clients
          </span>
          <NeuPagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {showAdd ? <AddClientModal onClose={() => setShowAdd(false)} /> : null}
      {showFollowUp ? (
        <FollowUpPanel onClose={() => setShowFollowUp(false)} onViewClient={(id) => goToClient(id)} />
      ) : null}
    </div>
  );
}

function ClientRow({ client, onSelect }: { client: Client; onSelect: () => void }) {
  const [hov, setHov] = useState(false);

  return (
    <tr
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        "cursor-pointer border-b border-[var(--figma-border)] transition-colors duration-120",
        hov ? "bg-[rgba(14,124,134,0.04)]" : "bg-white",
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <ClientAvatar initials={client.initials} color={client.color} />
          <div>
            <div className="text-[13px] font-semibold text-[var(--figma-navy)]">{client.name}</div>
            <div className="mt-px text-[11px] text-[var(--figma-gray400)]">{client.source}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[13px] text-[var(--figma-gray500)]">{client.company}</td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-xs text-[var(--figma-gray500)]">
            <MaterialIcon name="phone" outlined size={13} className="text-[var(--figma-gray400)]" />
            {client.phone}
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--figma-gray500)]">
            <MaterialIcon name="email" outlined size={13} className="text-[var(--figma-gray400)]" />
            {client.email}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <ProjectCountBadge count={client.linkedProjects} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <MaterialIcon name="calendar_today" outlined size={13} className="text-[var(--figma-gray400)]" />
          <span className="text-xs text-[var(--figma-gray500)]">{client.lastContact}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <ClientStatusBadge status={client.status} />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={cn(
            "flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium transition-all duration-150",
            hov
              ? "gi-gradient-cta border-transparent text-white"
              : "border-[var(--figma-border)] bg-white text-[var(--figma-navy)]",
          )}
        >
          View
          <MaterialIcon name="arrow_forward" outlined size={12} />
        </button>
      </td>
    </tr>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-[72px]">
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" aria-hidden>
            <rect x="20" y="30" width="120" height="80" rx="10" fill="rgba(27,42,74,0.05)" />
            <circle cx="55" cy="58" r="14" fill="rgba(14,124,134,0.12)" />
            <circle cx="55" cy="58" r="8" fill="rgba(14,124,134,0.20)" />
            <rect x="76" y="51" width="48" height="5" rx="2.5" fill="rgba(27,42,74,0.15)" />
            <rect x="76" y="61" width="32" height="4" rx="2" fill="rgba(27,42,74,0.08)" />
            <rect x="30" y="84" width="100" height="4" rx="2" fill="rgba(27,42,74,0.06)" />
            <rect x="30" y="94" width="80" height="4" rx="2" fill="rgba(27,42,74,0.04)" />
            <circle cx="130" cy="35" r="10" fill="rgba(63,166,107,0.15)" />
            <path
              d="M126 35 L129 38 L134 32"
              stroke="rgba(63,166,107,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div className="text-center">
            <div className="mb-1.5 text-base font-semibold text-[var(--figma-navy)]">No clients yet</div>
            <div className="text-[13px] text-[var(--figma-gray500)]">Add your first client to get started</div>
          </div>
          <GradientButton icon="person_add" size="sm" onClick={onAdd}>
            Add Client
          </GradientButton>
        </div>
      </td>
    </tr>
  );
}

function AddClientModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<ClientStatus>("Lead");

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(27,42,74,0.18)] backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="hub-modal-in w-full max-w-[480px] rounded-[20px] bg-white px-9 py-8" style={{ boxShadow: "var(--neu-modal)" }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">Add New Client</h2>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">Create a new client profile</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { label: "Full Name", value: name, set: setName, icon: "person", placeholder: "e.g. Giulia Marchetti" },
            { label: "Company", value: company, set: setCompany, icon: "business", placeholder: "e.g. Marchetti Holdings" },
            { label: "Email Address", value: email, set: setEmail, icon: "email", placeholder: "giulia@example.com" },
            { label: "Phone", value: phone, set: setPhone, icon: "phone", placeholder: "+39 02 1234 5678" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--figma-navy)]">{f.label}</label>
              <div className="relative">
                <MaterialIcon
                  name={f.icon}
                  outlined
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
                />
                <input
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="hub-input-focus w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pl-9 pr-3.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
                />
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Status</label>
            <div className="flex gap-2">
              {(["Lead", "Active", "Past"] as ClientStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex-1 rounded-lg border-[1.5px] py-2 text-[13px] transition-all duration-150",
                    status === s
                      ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)] font-semibold text-[var(--figma-teal)]"
                      : "border-[var(--figma-border)] bg-white font-normal text-[var(--figma-gray500)]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2.5">
          <OutlineButton onClick={onClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton icon="person_add" onClick={onClose} className="flex-[2]">
            Create Client
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
