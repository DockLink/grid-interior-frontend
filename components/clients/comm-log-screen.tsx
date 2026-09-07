"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  CommLogAttachmentChips,
} from "@/components/clients/comm-log-attachments";
import { DemoCaption } from "@/components/demo/demo-caption";
import { GradientButton } from "@/components/clients/client-ui";
import { LogCommModal } from "@/components/clients/log-comm-modal";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useClient } from "@/hooks/use-client";
import { useCommLog } from "@/hooks/use-comm-log";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { getDemoClients, getDemoCommLog } from "@/lib/clients/demo-data";
import { NAV_ROUTES, clientRoute } from "@/types/navigation";
import type { CommLogEntry, CommLogType, CreateCommLogPayload } from "@/types/clients";
import { cn } from "@/lib/utils";

type LogType = "all" | CommLogType;

const TYPE_CFG = {
  call: { icon: "phone", color: "var(--figma-success)", bg: "rgba(63,166,107,0.10)", label: "Call" },
  email: { icon: "email", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)", label: "Email" },
  meeting: { icon: "groups", color: "var(--figma-navy)", bg: "rgba(27,42,74,0.09)", label: "Meeting" },
};

const FILTER_CHIPS: { id: LogType; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "format_list_bulleted" },
  { id: "call", label: "Calls", icon: "phone" },
  { id: "email", label: "Emails", icon: "email" },
  { id: "meeting", label: "Meetings", icon: "groups" },
];

const DEMO_CLIENTS = getDemoClients();

function AuthCallout() {
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
      Live communication log requires auth. Copy <code className="font-mono">.env.local.example</code> to{" "}
      <code className="font-mono">.env.local</code> and set{" "}
      <code className="font-mono">NEXT_PUBLIC_ENABLE_AUTH=true</code>. Showing demo log below.
    </div>
  );
}

export function CommLogScreen({ clientId }: { clientId: string }) {
  const authDisabled = isAuthDisabled();
  const [filter, setFilter] = useState<LogType>("all");
  const [showModal, setShowModal] = useState(false);

  const { client: fetchedClient, isLoading: clientLoading, error: clientError } = useClient(clientId);
  const { entries: liveEntries, isLoading: logLoading, error: logError, createEntry, isCreating } =
    useCommLog(clientId);

  const client = useMemo(() => {
    if (authDisabled) {
      return DEMO_CLIENTS.find((c) => c.id === clientId) ?? DEMO_CLIENTS[0];
    }
    return fetchedClient;
  }, [authDisabled, clientId, fetchedClient]);

  const entries = authDisabled ? getDemoCommLog(clientId) : liveEntries;
  const isLoading = !authDisabled && (clientLoading || logLoading);
  const error = !authDisabled ? (clientError ?? logError) : null;

  const filtered = entries.filter((e) => filter === "all" || e.type === filter);

  const counts = {
    all: entries.length,
    call: entries.filter((e) => e.type === "call").length,
    email: entries.filter((e) => e.type === "email").length,
    meeting: entries.filter((e) => e.type === "meeting").length,
  };

  const handleSave = async (payload: CreateCommLogPayload) => {
    if (authDisabled) {
      setShowModal(false);
      return;
    }
    try {
      await createEntry(payload);
      toast.success("Communication logged");
      setShowModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save log entry");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center px-9 py-16 text-sm text-[var(--figma-gray500)]">
        Loading communication log…
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-9 py-16">
        {error ? <p className="m-0 text-sm text-red-600">{error}</p> : null}
        <p className="m-0 text-sm text-[var(--figma-gray500)]">Client not found.</p>
        <Link href={NAV_ROUTES.clients} className="text-[13px] text-[var(--figma-teal)]">
          Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full px-9 py-7">
      {authDisabled ? <DemoCaption className="mb-4" /> : null}
      {authDisabled ? <AuthCallout /> : null}

      <Link
        href={clientRoute(clientId)}
        className="mb-5 flex items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-medium text-[var(--figma-teal)] no-underline"
      >
        <MaterialIcon name="arrow_back" outlined size={16} />
        {client.name} — Client Profile
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className="flex size-12 items-center justify-center rounded-full text-base font-bold text-white neu-card"
            style={{ background: client.color }}
          >
            {client.initials}
          </div>
          <div>
            <h1 className="mb-1 text-[22px] font-bold text-[var(--figma-navy)]">Communication Log</h1>
            <p className="m-0 flex items-center gap-1 text-[13px] text-[var(--figma-gray500)]">
              <MaterialIcon name="person" outlined size={14} />
              {client.name} · {client.company}
              <span className="text-[var(--figma-border)]">·</span>
              <span>{counts.all} entries</span>
            </p>
          </div>
        </div>
        <GradientButton icon="add" onClick={() => setShowModal(true)}>
          Log Communication
        </GradientButton>
      </div>

      {!authDisabled && error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTER_CHIPS.map((chip) => {
            const isActive = filter === chip.id;
            const count = counts[chip.id];
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] transition-all duration-150",
                  isActive
                    ? "gi-gradient-cta border-transparent font-semibold text-white"
                    : "border-[var(--figma-border)] bg-white font-normal text-[var(--figma-gray500)] neu-card",
                )}
              >
                <MaterialIcon name={chip.icon} outlined size={14} />
                {chip.label}
                <span
                  className={cn(
                    "min-w-[18px] rounded-[10px] px-1.5 py-px text-center text-[11px] font-semibold",
                    isActive ? "bg-white/20 text-white" : "bg-[var(--figma-gray100)] text-[var(--figma-gray500)]",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--figma-gray500)]">
          <MaterialIcon name="sort" outlined size={15} />
          Newest first
        </div>
      </div>

      <div className="max-w-[760px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
            <MaterialIcon name="forum" outlined size={48} className="text-[var(--figma-border)]" />
            <div className="text-[15px] font-semibold text-[var(--figma-navy)]">
              No {filter === "all" ? "" : `${filter} `}entries yet
            </div>
            <div className="text-[13px] text-[var(--figma-gray500)]">Log the first communication with {client.name}</div>
            <GradientButton icon="add" onClick={() => setShowModal(true)}>
              Log Communication
            </GradientButton>
          </div>
        ) : (
          filtered.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} isLast={i === filtered.length - 1} />
          ))
        )}
      </div>

      {showModal ? (
        <LogCommModal
          onClose={() => setShowModal(false)}
          onSave={(payload) => void handleSave(payload)}
          isSaving={isCreating}
          clientName={client.name}
          clientInitials={client.initials}
          clientColor={client.color}
        />
      ) : null}
    </div>
  );
}

function TimelineEntry({
  entry,
  isLast,
}: {
  entry: CommLogEntry;
  isLast: boolean;
}) {
  const cfg = TYPE_CFG[entry.type];
  const [hov, setHov] = useState(false);

  return (
    <div className="relative flex gap-4">
      {!isLast ? (
        <div
          className="absolute bottom-[-14px] left-[19px] top-11 z-0 w-0.5"
          style={{ background: `linear-gradient(to bottom, ${cfg.color}30, var(--figma-border))` }}
        />
      ) : null}

      <div
        className="relative z-[1] flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-white/90 neu-card"
        style={{ background: cfg.bg }}
      >
        <MaterialIcon name={cfg.icon} outlined size={18} style={{ color: cfg.color }} />
      </div>

      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className={cn(
          "mb-3.5 flex-1 rounded-[14px] border border-[rgba(229,231,235,0.6)] bg-white p-4 transition-all duration-200 neu-card",
          hov && "neu-card-hover -translate-y-px",
        )}
      >
        <div className="mb-2.5 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              style={{ color: cfg.color, background: cfg.bg }}
            >
              <MaterialIcon name={cfg.icon} outlined size={11} />
              {cfg.label}
            </span>
            <span className="text-xs text-[var(--figma-gray400)]">
              {entry.date} · {entry.time}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex size-[26px] items-center justify-center rounded-full text-[9px] font-bold text-white gi-gradient-cta">
              {entry.initials}
            </div>
            <span className="text-xs text-[var(--figma-gray500)]">{entry.member}</span>
            <button
              type="button"
              className={cn("flex border-none bg-transparent p-0.5 transition-opacity", hov ? "opacity-100" : "opacity-0")}
            >
              <MaterialIcon name="more_horiz" outlined size={15} className="text-[var(--figma-gray400)]" />
            </button>
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
}
