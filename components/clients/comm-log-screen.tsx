"use client";

import { useState } from "react";
import Link from "next/link";

import {
  CommLogAttachmentChips,
  CommLogAttachmentPicker,
  currentCommLogTime,
  formatCommLogDate,
  revokeAttachmentUrls,
} from "@/components/clients/comm-log-attachments";
import { DemoCaption } from "@/components/demo/demo-caption";
import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { CLIENTS, COMM_LOG, type CommLogAttachment, type CommLogEntry } from "@/lib/clients/mock-clients";
import { clientRoute } from "@/types/navigation";
import { cn } from "@/lib/utils";

type LogType = "all" | "call" | "email" | "meeting";

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

const MEMBER_INITIALS: Record<string, string> = {
  "Sofia Marchetti": "SM",
  "Chiara Romano": "CR",
  "Lorenzo Pieri": "LP",
};

const TYPE_MAP = { Call: "call", Email: "email", Meeting: "meeting" } as const;

export function CommLogScreen({ clientId }: { clientId: number }) {
  const [filter, setFilter] = useState<LogType>("all");
  const [showModal, setShowModal] = useState(false);
  const [entries, setEntries] = useState<CommLogEntry[]>(COMM_LOG);
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];

  const filtered = entries.filter((e) => filter === "all" || e.type === filter);

  const counts = {
    all: entries.length,
    call: entries.filter((e) => e.type === "call").length,
    email: entries.filter((e) => e.type === "email").length,
    meeting: entries.filter((e) => e.type === "meeting").length,
  };

  return (
    <div className="min-h-full px-9 py-7">
      <DemoCaption className="mb-4" />

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
          onSave={(entry) => {
            setEntries((prev) => [entry, ...prev]);
            setShowModal(false);
          }}
          nextId={Math.max(0, ...entries.map((e) => e.id)) + 1}
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

function LogCommModal({
  onClose,
  onSave,
  nextId,
  clientName,
  clientInitials,
  clientColor,
}: {
  onClose: () => void;
  onSave: (entry: CommLogEntry) => void;
  nextId: number;
  clientName: string;
  clientInitials: string;
  clientColor: string;
}) {
  const [type, setType] = useState<"Call" | "Email" | "Meeting">("Call");
  const [date, setDate] = useState("2025-07-31");
  const [member, setMember] = useState("Sofia Marchetti");
  const [notes, setNotes] = useState("");
  const [notesFocus, setNotesFocus] = useState(false);
  const [attachments, setAttachments] = useState<CommLogAttachment[]>([]);

  const TYPE_ICONS = {
    Call: { icon: "phone", color: "var(--figma-success)" },
    Email: { icon: "email", color: "var(--figma-teal)" },
    Meeting: { icon: "groups", color: "var(--figma-navy)" },
  };

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
      member,
      initials: MEMBER_INITIALS[member] ?? member.slice(0, 2).toUpperCase(),
      note: notes,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.22)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && discardAndClose()}
    >
      <div
        className="hub-modal-in relative flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[20px] bg-white px-9 py-8"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-6 flex shrink-0 items-start justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">Log Communication</h2>
            <div className="flex items-center gap-2">
              <div
                className="flex size-[22px] items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ background: clientColor }}
              >
                {clientInitials}
              </div>
              <span className="text-[13px] text-[var(--figma-gray500)]">{clientName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={discardAndClose}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[var(--figma-navy)]">Communication Type</label>
            <div className="flex gap-2">
              {(["Call", "Email", "Meeting"] as const).map((t) => {
                const cfg = TYPE_ICONS[t];
                const selected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1.5 rounded-[11px] border-[1.5px] py-3 transition-all duration-150",
                      selected ? "neu-raised" : "border-[var(--figma-border)] bg-white",
                    )}
                    style={{
                      borderColor: selected ? cfg.color : undefined,
                      background: selected ? `${cfg.color}0F` : undefined,
                    }}
                  >
                    <MaterialIcon name={cfg.icon} outlined size={22} style={{ color: selected ? cfg.color : "var(--figma-gray400)" }} />
                    <span
                      className="text-xs"
                      style={{
                        fontWeight: selected ? 600 : 400,
                        color: selected ? cfg.color : "var(--figma-gray500)",
                      }}
                    >
                      {t}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--figma-navy)]">Date</label>
              <div className="relative">
                <MaterialIcon
                  name="calendar_today"
                  outlined
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="hub-input-focus w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--figma-navy)]">Assigned Team Member</label>
              <div className="relative">
                <select
                  value={member}
                  onChange={(e) => setMember(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pl-3 pr-8 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
                >
                  <option>Sofia Marchetti</option>
                  <option>Chiara Romano</option>
                  <option>Lorenzo Pieri</option>
                </select>
                <MaterialIcon
                  name="expand_more"
                  outlined
                  size={15}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={() => setNotesFocus(true)}
              onBlur={() => setNotesFocus(false)}
              placeholder="Describe what was discussed, decisions made, next steps…"
              rows={4}
              className={cn(
                "w-full resize-y rounded-[10px] border-[1.5px] bg-white p-3 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none transition-all duration-150",
                notesFocus
                  ? "border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_3px_rgba(14,124,134,0.08)]"
                  : "border-[var(--figma-border)] neu-inset",
              )}
            />
            <span className="text-right text-[11px] text-[var(--figma-gray400)]">{notes.length} chars</span>
          </div>

          <CommLogAttachmentPicker files={attachments} onChange={setAttachments} />
        </div>

        <div className="mt-6 flex shrink-0 gap-2.5">
          <OutlineButton onClick={discardAndClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton icon="save" onClick={handleSave} className="flex-[2]">
            Save Log Entry
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
