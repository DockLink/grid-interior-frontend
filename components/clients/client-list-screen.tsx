"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DemoCaption } from "@/components/demo/demo-caption";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  ClientAvatar,
  ClientStatusBadge,
  FilterDropdown,
  GradientButton,
  NeuPagination,
  NeuSearchInput,
  ProjectCountBadge,
} from "@/components/clients/client-ui";
import { FollowUpPanel } from "@/components/clients/follow-up-panel";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { useClients } from "@/hooks/use-clients";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { getDemoClients } from "@/lib/clients/demo-data";
import { clientRoute } from "@/types/navigation";
import type { Client, ClientStatus, LeadSource } from "@/types/clients";
import { cn } from "@/lib/utils";

const PER_PAGE = 8;
const DEMO_CLIENTS = getDemoClients();

function AuthCallout() {
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
      Live clients require auth. Copy <code className="font-mono">.env.local.example</code> to{" "}
      <code className="font-mono">.env.local</code> and set{" "}
      <code className="font-mono">NEXT_PUBLIC_ENABLE_AUTH=true</code>. Showing demo clients below.
    </div>
  );
}

export function ClientListScreen() {
  const router = useRouter();
  const authDisabled = isAuthDisabled();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [restored, setRestored] = useState<string[]>([]);

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      search: search.trim() || undefined,
      status: statusFilter !== "All" ? (statusFilter as ClientStatus) : undefined,
      source: sourceFilter !== "All" ? (sourceFilter as LeadSource) : undefined,
      include_deleted: showDeleted || undefined,
    }),
    [search, statusFilter, sourceFilter, showDeleted],
  );

  const { clients, meta, isLoading, error, createClient, updateClient, isCreating } =
    useClients(queryParams);

  const sourceClients = authDisabled ? DEMO_CLIENTS : clients;

  const filtered = useMemo(() => {
    return sourceClients.filter((c) => {
      const matchDeleted = showDeleted
        ? Boolean(c.deleted) && !restored.includes(c.id)
        : !c.deleted || restored.includes(c.id);
      return matchDeleted;
    });
  }, [sourceClients, showDeleted, restored]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalCount = authDisabled ? DEMO_CLIENTS.length : (meta?.total ?? clients.length);

  const goToClient = (id: string) => router.push(clientRoute(id));

  const handleRestore = async (id: string) => {
    if (authDisabled) {
      setRestored((ids) => [...ids, id]);
      setShowDeleted(false);
      return;
    }
    try {
      await updateClient(id, { deleted: false });
      setRestored((ids) => [...ids, id]);
      setShowDeleted(false);
      toast.success("Client restored");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore client");
    }
  };

  return (
    <div className="min-h-full px-9 py-8">
      {authDisabled ? <DemoCaption className="mb-4" /> : null}
      {authDisabled ? <AuthCallout /> : null}

      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="mb-1.5 text-[28px] font-bold text-[var(--figma-navy)]">Clients</h1>
          <p className="m-0 text-sm leading-relaxed text-[var(--figma-gray500)]">
            Manage client profiles and relationships · {totalCount} total
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
          placeholder="Search by name, company, email, or project…"
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
          <button
            type="button"
            onClick={() => {
              setShowDeleted((v) => !v);
              setPage(1);
            }}
            className="cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium"
            style={{
              borderColor: showDeleted ? "var(--figma-teal)" : "var(--figma-border)",
              color: showDeleted ? "var(--figma-teal)" : "var(--figma-gray500)",
            }}
          >
            {showDeleted ? "Showing deleted" : "Deleted records"}
          </button>
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

      {!authDisabled && error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

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
            {!authDisabled && isLoading ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col gap-2 px-4 py-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--figma-gray100)]" />
                    ))}
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <EmptyState onAdd={() => setShowAdd(true)} />
            ) : (
              paged.map((c) => (
                <ClientRow
                  key={c.id}
                  client={c}
                  onSelect={() => goToClient(c.id)}
                  onRestore={
                    c.deleted
                      ? () => {
                          void handleRestore(c.id);
                        }
                      : undefined
                  }
                />
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-[var(--figma-border)] px-5 py-3">
          <span className="text-xs text-[var(--figma-gray400)]">
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} clients
          </span>
          <NeuPagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {showAdd ? (
        <ClientFormModal
          mode="create"
          onClose={() => setShowAdd(false)}
          isSaving={isCreating}
          onSubmit={async (payload) => {
            if (authDisabled) {
              setShowAdd(false);
              return;
            }
            await createClient(payload);
            toast.success("Client created");
            setShowAdd(false);
          }}
        />
      ) : null}
      {showFollowUp ? (
        <FollowUpPanel onClose={() => setShowFollowUp(false)} onViewClient={(id) => goToClient(id)} />
      ) : null}
    </div>
  );
}

function ClientRow({
  client,
  onSelect,
  onRestore,
}: {
  client: Client;
  onSelect: () => void;
  onRestore?: () => void;
}) {
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
            if (onRestore) onRestore();
            else onSelect();
          }}
          className={cn(
            "flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium transition-all duration-150",
            hov
              ? "gi-gradient-cta border-transparent text-white"
              : "border-[var(--figma-border)] bg-white text-[var(--figma-navy)]",
          )}
        >
          {onRestore ? "Restore" : "View"}
          <MaterialIcon name={onRestore ? "restore_from_trash" : "arrow_forward"} outlined size={12} />
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
