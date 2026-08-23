"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { DemoCaption } from "@/components/demo/demo-caption";
import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { PIPELINE_CARDS, type LeadSource } from "@/lib/clients/mock-clients";
import { clientRoute } from "@/types/navigation";
import { cn } from "@/lib/utils";

type PipelineCard = {
  id: number;
  client: string;
  company: string;
  source: LeadSource;
  followUp: string;
  initials: string;
  overdue: boolean;
};

type ColumnId = "new" | "meeting" | "proposal" | "won" | "lost";

const SOURCE_CFG: Record<LeadSource, { color: string; bg: string; icon: string }> = {
  Referral: { color: "var(--figma-navy)", bg: "rgba(27,42,74,0.09)", icon: "people" },
  Instagram: { color: "#E1306C", bg: "rgba(225,48,108,0.09)", icon: "photo_camera" },
  Website: { color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)", icon: "language" },
  "Walk-in": { color: "#F5A623", bg: "rgba(245,166,35,0.10)", icon: "directions_walk" },
};

const COLUMN_CFG: { id: ColumnId; label: string; color: string; bg: string; icon: string }[] = [
  { id: "new", label: "New Inquiry", color: "var(--figma-navy)", bg: "rgba(27,42,74,0.06)", icon: "inbox" },
  { id: "meeting", label: "Meeting Booked", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.08)", icon: "event" },
  { id: "proposal", label: "Proposal Sent", color: "#F5A623", bg: "rgba(245,166,35,0.08)", icon: "description" },
  { id: "won", label: "Won", color: "var(--figma-success)", bg: "rgba(63,166,107,0.10)", icon: "emoji_events" },
  { id: "lost", label: "Lost", color: "var(--figma-alert)", bg: "rgba(242,109,109,0.10)", icon: "cancel" },
];

const SOURCE_FILTERS: LeadSource[] = ["Referral", "Instagram", "Website", "Walk-in"];

export function LeadPipelineScreen() {
  const router = useRouter();
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "All">("All");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [columns, setColumns] = useState<Record<ColumnId, PipelineCard[]>>({
    new: PIPELINE_CARDS.new as PipelineCard[],
    meeting: PIPELINE_CARDS.meeting as PipelineCard[],
    proposal: PIPELINE_CARDS.proposal as PipelineCard[],
    won: PIPELINE_CARDS.won as PipelineCard[],
    lost: PIPELINE_CARDS.lost as PipelineCard[],
  });

  const filterCards = (cards: PipelineCard[]) =>
    sourceFilter === "All" ? cards : cards.filter((c) => c.source === sourceFilter);

  const handleDrop = (targetCol: ColumnId) => {
    if (!draggingId) return;
    let movedCard: PipelineCard | undefined;

    const updated = { ...columns };
    for (const col of Object.keys(updated) as ColumnId[]) {
      const idx = updated[col].findIndex((c) => c.id === draggingId);
      if (idx !== -1) {
        movedCard = updated[col][idx];
        updated[col] = updated[col].filter((c) => c.id !== draggingId);
        break;
      }
    }
    if (movedCard) {
      updated[targetCol] = [...updated[targetCol], movedCard];
    }
    setColumns(updated);
    setDraggingId(null);
  };

  const totalLeads = Object.values(columns).flat().length;
  const goToClient = (id: number) => router.push(clientRoute(id));

  return (
    <div className="flex min-h-full flex-col px-8 py-7">
      <DemoCaption className="mb-4" />

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="mb-1.5 text-[28px] font-bold text-[var(--figma-navy)]">Lead Pipeline</h1>
          <p className="m-0 text-sm text-[var(--figma-gray500)]">Visual pipeline tracking · {totalLeads} leads total</p>
        </div>
        <GradientButton icon="add" onClick={() => setShowAdd(true)}>
          Add Lead
        </GradientButton>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-[var(--figma-gray500)]">Source:</span>
        <button
          type="button"
          onClick={() => setSourceFilter("All")}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs transition-all duration-150",
            sourceFilter === "All"
              ? "gi-gradient-cta font-semibold text-white"
              : "border border-[var(--figma-border)] bg-white font-normal text-[var(--figma-gray500)] neu-card",
          )}
        >
          All Sources
        </button>
        {SOURCE_FILTERS.map((src) => {
          const cfg = SOURCE_CFG[src];
          const isActive = sourceFilter === src;
          return (
            <button
              key={src}
              type="button"
              onClick={() => setSourceFilter(isActive ? "All" : src)}
              className="flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1 text-xs transition-all duration-150"
              style={{
                background: isActive ? cfg.bg : "#fff",
                borderColor: isActive ? cfg.color : "var(--figma-border)",
                color: isActive ? cfg.color : "var(--figma-gray500)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: cfg.color }} />
              {src}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1 text-xs text-[var(--figma-gray400)]">
          <MaterialIcon name="drag_indicator" outlined size={14} />
          Drag cards to move between stages
        </div>
      </div>

      <div className="flex flex-1 gap-3.5 overflow-x-auto pb-2">
        {COLUMN_CFG.filter((c) => !["won", "lost"].includes(c.id)).map((col) => (
          <KanbanColumn
            key={col.id}
            colId={col.id}
            label={col.label}
            color={col.color}
            bg={col.bg}
            icon={col.icon}
            cards={filterCards(columns[col.id])}
            draggingId={draggingId}
            onDragStart={(id) => setDraggingId(id)}
            onDragEnd={() => setDraggingId(null)}
            onDrop={handleDrop}
            onSelectClient={goToClient}
          />
        ))}

        <div className="flex min-w-[220px] flex-1 flex-col gap-3.5">
          {(["won", "lost"] as ColumnId[]).map((colId) => {
            const col = COLUMN_CFG.find((c) => c.id === colId)!;
            return (
              <div
                key={colId}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(colId)}
                className="flex flex-1 flex-col rounded-[14px] border-[1.5px] border-[var(--figma-border)] bg-[var(--figma-gray50)] p-3.5"
              >
                <div className="mb-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="flex size-6 items-center justify-center rounded-md"
                        style={{ background: col.bg }}
                      >
                        <MaterialIcon name={col.icon} outlined size={13} style={{ color: col.color }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: col.color }}>
                        {col.label}
                      </span>
                    </div>
                    <span
                      className="rounded-lg px-1.5 py-px text-[9px] font-bold text-white"
                      style={{ background: col.color }}
                    >
                      {filterCards(columns[colId]).length}
                    </span>
                  </div>
                  <div className="h-0.5 rounded-sm opacity-40" style={{ background: col.color }} />
                </div>
                {filterCards(columns[colId]).map((card) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    dragging={draggingId === card.id}
                    onDragStart={() => setDraggingId(card.id)}
                    onDragEnd={() => setDraggingId(null)}
                    colColor={col.color}
                    onSelectClient={goToClient}
                  />
                ))}
                {filterCards(columns[colId]).length === 0 ? (
                  <div className="flex flex-1 items-center justify-center opacity-40">
                    <span className="text-[11px] text-[var(--figma-gray400)]">Drop here</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-[rgba(14,124,134,0.20)] bg-[rgba(14,124,134,0.05)] px-4 py-2 text-xs text-[var(--figma-teal)]">
        <MaterialIcon name="info" outlined size={14} />
        Drag and drop cards between stages. Cards turn slightly on pick-up to indicate drag state. Drop zones highlight in
        the column&apos;s accent color.
      </div>

      {showAdd ? <AddLeadModal onClose={() => setShowAdd(false)} /> : null}
    </div>
  );
}

function KanbanCard({
  card,
  dragging = false,
  onDragStart,
  onDragEnd,
  colColor,
  onSelectClient,
}: {
  card: PipelineCard;
  dragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  colColor: string;
  onSelectClient?: (id: number) => void;
}) {
  const [hov, setHov] = useState(false);
  const src = SOURCE_CFG[card.source];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelectClient?.(card.id)}
      className={cn(
        "relative mb-2.5 cursor-grab select-none rounded-xl bg-white p-4 transition-all duration-200 neu-card",
        hov && !dragging && "neu-card-hover -translate-y-0.5",
        dragging && "opacity-85 rotate-[2deg] scale-[1.03] -translate-y-1",
      )}
      style={{
        borderLeft: `3px solid ${colColor}`,
        boxShadow: dragging
          ? "14px 14px 32px rgba(163,177,198,0.55), -8px -8px 20px rgba(255,255,255,0.95)"
          : undefined,
        transition: dragging ? "none" : undefined,
      }}
    >
      <div className={cn("absolute right-2 top-2 transition-opacity", hov || dragging ? "opacity-60" : "opacity-20")}>
        <MaterialIcon name="drag_indicator" outlined size={16} className="text-[var(--figma-gray400)]" />
      </div>

      <div className="mb-0.5 pr-5 text-[13px] font-semibold text-[var(--figma-navy)]">{card.client}</div>
      <div className="mb-2.5 text-[11px] text-[var(--figma-gray500)]">{card.company}</div>

      <div
        className="mb-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
        style={{ background: src.bg, color: src.color }}
      >
        <MaterialIcon name={src.icon} outlined size={11} />
        {card.source}
      </div>

      <div className="flex items-center justify-between">
        {card.followUp ? (
          <div
            className="flex items-center gap-1 text-[11px]"
            style={{ color: card.overdue ? "var(--figma-alert)" : "var(--figma-gray500)" }}
          >
            <MaterialIcon
              name={card.overdue ? "alarm" : "schedule"}
              outlined
              size={13}
              style={{ color: card.overdue ? "var(--figma-alert)" : "var(--figma-gray400)" }}
            />
            {card.overdue ? <span className="font-semibold">Overdue · </span> : null}
            {card.followUp}
          </div>
        ) : (
          <div className="text-[11px] text-[var(--figma-gray400)]">—</div>
        )}
        <div className="flex size-6 items-center justify-center rounded-full text-[9px] font-bold text-white gi-gradient-cta">
          {card.initials}
        </div>
      </div>

      {hov && onSelectClient ? (
        <div className="mt-2 flex items-center gap-1 border-t border-[var(--figma-border)] pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectClient(card.id);
            }}
            className="border-none bg-transparent p-0 text-[11px] font-semibold text-[var(--figma-teal)]"
          >
            View Profile →
          </button>
        </div>
      ) : null}
    </div>
  );
}

function KanbanColumn({
  colId,
  label,
  color,
  bg,
  icon,
  cards,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
  onSelectClient,
}: {
  colId: ColumnId;
  label: string;
  color: string;
  bg: string;
  icon: string;
  cards: PipelineCard[];
  draggingId: number | null;
  onDragStart: (id: number) => void;
  onDragEnd: () => void;
  onDrop: (col: ColumnId) => void;
  onSelectClient?: (id: number) => void;
}) {
  const [dropHover, setDropHover] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDropHover(true);
      }}
      onDragLeave={() => setDropHover(false)}
      onDrop={() => {
        onDrop(colId);
        setDropHover(false);
      }}
      className="flex min-w-[220px] flex-1 flex-col rounded-[14px] p-3.5 transition-all duration-200"
      style={{
        background: dropHover ? `${color}08` : "var(--figma-gray50)",
        border: dropHover ? `1.5px dashed ${color}` : "1.5px solid var(--figma-border)",
      }}
    >
      <div className="mb-3.5">
        <div className="mb-0.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex size-7 items-center justify-center rounded-md" style={{ background: bg }}>
              <MaterialIcon name={icon} outlined size={15} style={{ color }} />
            </div>
            <span className="text-[13px] font-semibold text-[var(--figma-navy)]">{label}</span>
          </div>
          <span className="rounded-[10px] px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: color }}>
            {cards.length}
          </span>
        </div>
        <div className="mt-2 h-0.5 rounded-sm opacity-50" style={{ background: color }} />
      </div>

      <div className="flex-1">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            dragging={draggingId === card.id}
            onDragStart={() => onDragStart(card.id)}
            onDragEnd={onDragEnd}
            colColor={color}
            onSelectClient={onSelectClient}
          />
        ))}
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 px-2 py-6 opacity-50">
            <MaterialIcon name="inbox" outlined size={28} className="text-[var(--figma-gray400)]" />
            <span className="text-center text-[11px] text-[var(--figma-gray400)]">Drop leads here</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AddLeadModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.20)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="hub-modal-in w-full max-w-[440px] rounded-[20px] bg-white px-9 py-8" style={{ boxShadow: "var(--neu-modal)" }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-lg font-semibold text-[var(--figma-navy)]">Add New Lead</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          {[
            { label: "Full Name", icon: "person", ph: "e.g. Marco Rossi" },
            { label: "Company", icon: "business", ph: "e.g. Rossi Group" },
            { label: "Email", icon: "email", ph: "marco@rossigroup.it" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-[var(--figma-navy)]">{f.label}</label>
              <div className="relative">
                <MaterialIcon
                  name={f.icon}
                  outlined
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
                />
                <input
                  placeholder={f.ph}
                  className="hub-input-focus w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
                />
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Lead Source</label>
            <div className="flex flex-wrap gap-2">
              {SOURCE_FILTERS.map((src) => {
                const cfg = SOURCE_CFG[src];
                return (
                  <button
                    key={src}
                    type="button"
                    className="flex items-center gap-1 rounded-full border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-1.5 text-xs text-[var(--figma-gray500)]"
                  >
                    <span className="size-1.5 rounded-full" style={{ background: cfg.color }} />
                    {src}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2.5">
          <OutlineButton onClick={onClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton icon="person_add" onClick={onClose} className="flex-[2]">
            Add Lead
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
