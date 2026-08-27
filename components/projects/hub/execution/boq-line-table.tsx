"use client";

import { useMemo, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { TimelineWidget } from "@/components/projects/hub/shared/timeline-widget";
import {
  GradientBtn,
  OutlineBtn,
  SectionCard,
  WorkspaceBreadcrumb,
} from "@/components/projects/hub/shared/workspace-ui";
import { BOQ_CATEGORIES } from "@/lib/projects/mock-execution";
import { cn } from "@/lib/utils";
import { formatLKR } from "@/types/detail";
import type {
  AdvancePaymentStatus,
  BoqCategory,
  BoqLineItem,
  NegotiationStatus,
} from "@/types/execution";
import { categorySubtotal, lineItemTotal } from "@/types/execution";
import type { ActiveProjectView } from "@/types/project-hub";

const NEG: Record<NegotiationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#9CA3AF", bg: "#F3F4F6" },
  "in-progress": { label: "In Progress", color: "#D97706", bg: "#FEF3C7" },
  agreed: { label: "Agreed", color: "#3FA66B", bg: "#DCFCE7" },
};

const PAY: Record<AdvancePaymentStatus, { label: string; color: string; bg: string }> = {
  "not-paid": { label: "Not paid", color: "#EF4444", bg: "#FEE2E2" },
  partial: { label: "Partial", color: "#D97706", bg: "#FEF3C7" },
  paid: { label: "Paid", color: "#3FA66B", bg: "#DCFCE7" },
};

function cycleNeg(s: NegotiationStatus): NegotiationStatus {
  if (s === "pending") return "in-progress";
  if (s === "in-progress") return "agreed";
  return "pending";
}

function cyclePay(s: AdvancePaymentStatus): AdvancePaymentStatus {
  if (s === "not-paid") return "partial";
  if (s === "partial") return "paid";
  return "not-paid";
}

function parseMoneyInput(raw: string): number {
  const n = Number(raw.replace(/,/g, "").trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function MoneyInput({
  value,
  onChange,
  className,
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  className?: string;
  ariaLabel: string;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      value={focused ? draft : value.toLocaleString()}
      onFocus={() => {
        setDraft(String(value));
        setFocused(true);
      }}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        const n = Number(next.replace(/,/g, "").trim());
        if (next.trim() !== "" && Number.isFinite(n) && n >= 0) onChange(n);
      }}
      onBlur={() => {
        setFocused(false);
        onChange(parseMoneyInput(draft));
      }}
      className={cn(
        "w-[96px] rounded-[9px] bg-white px-2 py-1.5 text-right text-[12px] font-semibold text-[var(--figma-navy)] outline-none transition-all duration-150",
        focused
          ? "border-2 border-[var(--figma-teal)] hub-input-focus"
          : "border-[1.5px] border-[var(--figma-border)] neu-inset",
        className,
      )}
    />
  );
}

function QtyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      type="number"
      min={0}
      step="any"
      aria-label="Quantity"
      value={value}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) && n >= 0 ? n : 0);
      }}
      className={cn(
        "w-[64px] rounded-[9px] bg-white px-2 py-1.5 text-center text-[12px] font-semibold text-[var(--figma-navy)] outline-none transition-all duration-150",
        focused
          ? "border-2 border-[var(--figma-teal)] hub-input-focus"
          : "border-[1.5px] border-[var(--figma-border)] neu-inset",
      )}
    />
  );
}

function QuoteCells({
  item,
  editing,
  onSelect,
  onQuotePrice,
}: {
  item: BoqLineItem;
  editing: boolean;
  onSelect: (supplierId: number) => void;
  onQuotePrice: (supplierId: number, price: number) => void;
}) {
  const slots = [0, 1, 2].map((i) => item.quotes[i] ?? null);
  return (
    <div className="flex min-w-[220px] flex-col gap-1">
      {slots.map((q, i) =>
        q ? (
          <div
            key={q.supplierId}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border px-2 py-1 text-[11px]",
              item.selectedSupplierId === q.supplierId
                ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)] font-semibold text-[var(--figma-navy)]"
                : "border-[var(--figma-border)] bg-white text-[var(--figma-gray500)]",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(q.supplierId)}
              className="min-w-0 flex-1 cursor-pointer truncate border-none bg-transparent p-0 text-left"
              style={{ color: "inherit", font: "inherit" }}
            >
              {q.supplierName}
            </button>
            {editing ? (
              <MoneyInput
                value={q.price}
                ariaLabel={`${q.supplierName} quote`}
                className="w-[88px] text-[11px]"
                onChange={(price) => onQuotePrice(q.supplierId, price)}
              />
            ) : (
              <button
                type="button"
                onClick={() => onSelect(q.supplierId)}
                className="cursor-pointer border-none bg-transparent p-0"
                style={{ color: "inherit", font: "inherit" }}
              >
                {formatLKR(q.price)}
              </button>
            )}
          </div>
        ) : (
          <div
            key={`empty-${i}`}
            className="rounded-lg border border-dashed border-[var(--figma-border)] px-2 py-1 text-[10px] text-[var(--figma-gray400)]"
          >
            Quote {i + 1} empty
          </div>
        ),
      )}
    </div>
  );
}

function CategoryBlock({
  cat,
  onChange,
}: {
  cat: BoqCategory;
  onChange: (next: BoqCategory) => void;
}) {
  const [open, setOpen] = useState(cat.id === "A" || cat.id === "C" || cat.id === "H");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const sub = categorySubtotal(cat);

  const patchItem = (id: number, patch: Partial<BoqLineItem>) => {
    onChange({
      ...cat,
      items: cat.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  };

  const patchQuotePrice = (itemId: number, supplierId: number, price: number) => {
    const item = cat.items.find((it) => it.id === itemId);
    if (!item) return;
    patchItem(itemId, {
      quotes: item.quotes.map((q) => (q.supplierId === supplierId ? { ...q, price } : q)),
    });
  };

  return (
    <SectionCard className="overflow-hidden px-0 py-0">
      <div className="flex w-full items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left"
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] neu-inset"
            style={{ background: cat.accentBg }}
          >
            <MaterialIcon name={cat.icon} outlined size={18} style={{ color: cat.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-[var(--figma-navy)]">
              {cat.id}. {cat.label}
            </div>
            <div className="text-[11px] text-[var(--figma-gray400)]">
              {cat.items.length} items · {cat.durationDays} working days
            </div>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="mb-0.5 text-[10px] text-[var(--figma-gray400)]">budget</div>
            {editingBudget ? (
              <div className="flex items-center gap-1.5">
                <MoneyInput
                  value={cat.budget}
                  ariaLabel={`${cat.label} budget`}
                  className="w-[110px]"
                  onChange={(budget) => onChange({ ...cat, budget })}
                />
                <button
                  type="button"
                  onClick={() => setEditingBudget(false)}
                  className="flex size-7 cursor-pointer items-center justify-center rounded-lg border-none bg-[rgba(14,124,134,0.10)] text-[var(--figma-teal)]"
                  aria-label="Done editing budget"
                >
                  <MaterialIcon name="check" size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingBudget(true)}
                className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-extrabold text-[var(--figma-navy)]"
              >
                {formatLKR(cat.budget)}
                <MaterialIcon name="edit" outlined size={14} className="text-[var(--figma-gray400)]" />
              </button>
            )}
          </div>
          <div className="text-right">
            <div className="text-[13px] font-extrabold text-[var(--figma-navy)]">{formatLKR(sub)}</div>
            <div className="text-[10px] text-[var(--figma-gray400)]">subtotal</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex cursor-pointer items-center border-none bg-transparent p-0"
            aria-label={open ? "Collapse category" : "Expand category"}
          >
            <MaterialIcon
              name={open ? "expand_less" : "expand_more"}
              outlined
              size={22}
              className="text-[var(--figma-gray400)]"
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--figma-border)] px-4 pb-5 pt-3 sm:px-5">
          <TimelineWidget
            phase={cat.label}
            initialDays={String(cat.durationDays)}
            badgeVariant="teal"
          />

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left text-[12px]">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-wide text-[var(--figma-gray400)]">
                  {[
                    "Item",
                    "L / W / H in",
                    "Image",
                    "Description",
                    "Unit",
                    "Qty",
                    "Rate",
                    "Total",
                    "Supplier quotes (max 3)",
                    "Firm price",
                    "Negotiation",
                    "Payment",
                    "Contract",
                    "",
                  ].map((h, i) => (
                    <th key={`${h}-${i}`} className="whitespace-nowrap px-2 pb-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cat.items.map((row) => {
                  const neg = NEG[row.negotiationStatus];
                  const pay = PAY[row.paymentStatus];
                  const editing = editingId === row.id;
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-t border-[var(--figma-border)] align-top",
                        editing && "bg-[rgba(14,124,134,0.03)]",
                      )}
                    >
                      <td className="px-2 py-3 font-semibold text-[var(--figma-navy)]">{row.item}</td>
                      <td className="px-2 py-3 text-[var(--figma-gray500)]">
                        {[row.lengthIn, row.widthIn, row.heightIn].filter(Boolean).join(" × ") || "—"}
                      </td>
                      <td className="px-2 py-3">
                        {row.image ? (
                          <div className="flex size-10 items-center justify-center rounded-md bg-[var(--figma-gray100)]">
                            <MaterialIcon name="image" outlined size={18} className="text-[var(--figma-teal)]" />
                          </div>
                        ) : (
                          <span className="text-[var(--figma-gray400)]">—</span>
                        )}
                      </td>
                      <td className="max-w-[180px] px-2 py-3 text-[var(--figma-gray500)]">{row.description}</td>
                      <td className="px-2 py-3">{row.unit}</td>
                      <td className="px-2 py-3 font-medium">
                        {editing ? (
                          <QtyInput
                            value={row.qty}
                            onChange={(qty) => patchItem(row.id, { qty })}
                          />
                        ) : (
                          row.qty
                        )}
                      </td>
                      <td className="px-2 py-3">
                        {editing ? (
                          <MoneyInput
                            value={row.rate}
                            ariaLabel={`${row.item} rate`}
                            onChange={(rate) => patchItem(row.id, { rate })}
                          />
                        ) : (
                          formatLKR(row.rate)
                        )}
                      </td>
                      <td className="px-2 py-3 font-bold text-[var(--figma-navy)]">
                        {formatLKR(lineItemTotal(row))}
                      </td>
                      <td className="px-2 py-3">
                        <QuoteCells
                          item={row}
                          editing={editing}
                          onSelect={(supplierId) => patchItem(row.id, { selectedSupplierId: supplierId })}
                          onQuotePrice={(supplierId, price) =>
                            patchQuotePrice(row.id, supplierId, price)
                          }
                        />
                      </td>
                      <td className="px-2 py-3 font-semibold text-[var(--figma-teal)]">
                        {editing ? (
                          <MoneyInput
                            value={row.designFirmPrice}
                            ariaLabel={`${row.item} firm price`}
                            onChange={(designFirmPrice) => patchItem(row.id, { designFirmPrice })}
                          />
                        ) : (
                          formatLKR(row.designFirmPrice)
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            patchItem(row.id, { negotiationStatus: cycleNeg(row.negotiationStatus) })
                          }
                          className="cursor-pointer rounded-lg border-none px-2 py-1 text-[10px] font-semibold"
                          style={{ color: neg.color, background: neg.bg }}
                        >
                          {neg.label}
                        </button>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => patchItem(row.id, { paymentStatus: cyclePay(row.paymentStatus) })}
                          className="cursor-pointer rounded-lg border-none px-2 py-1 text-[10px] font-semibold"
                          style={{ color: pay.color, background: pay.bg }}
                        >
                          {pay.label}
                        </button>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => patchItem(row.id, { contractUploaded: !row.contractUploaded })}
                          className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[11px] font-medium"
                          style={{ color: row.contractUploaded ? "#3FA66B" : "var(--figma-teal)" }}
                        >
                          <MaterialIcon
                            name={row.contractUploaded ? "check_circle" : "upload_file"}
                            outlined={!row.contractUploaded}
                            size={16}
                          />
                          {row.contractUploaded ? "Uploaded" : "Upload"}
                        </button>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => setEditingId(editing ? null : row.id)}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1 rounded-lg border-none px-2 py-1 text-[11px] font-semibold transition-colors",
                            editing
                              ? "bg-[rgba(14,124,134,0.12)] text-[var(--figma-teal)]"
                              : "bg-[var(--figma-gray100)] text-[var(--figma-gray500)] hover:text-[var(--figma-teal)]",
                          )}
                          aria-label={editing ? `Done editing ${row.item}` : `Edit ${row.item}`}
                        >
                          <MaterialIcon name={editing ? "check" : "edit"} outlined={!editing} size={14} />
                          {editing ? "Done" : "Edit"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export function BoqLineTable({
  project,
  onBack,
}: {
  project: ActiveProjectView;
  onBack: () => void;
}) {
  const [cats, setCats] = useState(BOQ_CATEGORIES);
  const grand = useMemo(() => cats.reduce((s, c) => s + categorySubtotal(c), 0), [cats]);
  const budget = useMemo(() => cats.reduce((s, c) => s + c.budget, 0), [cats]);
  const variance = grand - budget;

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <WorkspaceBreadcrumb items={["Projects", project.name, "Execution", "BOQ"]} onBack={onBack} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 mb-1 text-[24px] font-bold text-[var(--figma-navy)] sm:text-[28px]">
            Bill of Quantities
          </h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
            Edit line prices after client conversations — totals, budgets, and variance update live
          </p>
        </div>
        <div className="flex gap-2">
          <OutlineBtn label="Export BOQ" icon="download" />
          <GradientBtn label="Add line item" icon="add" small />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SectionCard className="px-5 py-4">
          <div className="text-[11px] text-[var(--figma-gray400)]">Client grand total</div>
          <div className="text-2xl font-extrabold text-[var(--figma-navy)]">{formatLKR(grand)}</div>
        </SectionCard>
        <SectionCard className="px-5 py-4">
          <div className="text-[11px] text-[var(--figma-gray400)]">Category budgets</div>
          <div className="text-2xl font-extrabold text-[var(--figma-navy)]">{formatLKR(budget)}</div>
        </SectionCard>
        <SectionCard className="px-5 py-4">
          <div className="text-[11px] text-[var(--figma-gray400)]">Variance</div>
          <div
            className="text-2xl font-extrabold"
            style={{ color: variance <= 0 ? "#3FA66B" : "#EF4444" }}
          >
            {formatLKR(variance)}
          </div>
        </SectionCard>
      </div>

      <div className="flex flex-col gap-3.5">
        {cats.map((cat) => (
          <CategoryBlock
            key={cat.id}
            cat={cat}
            onChange={(next) => setCats((prev) => prev.map((c) => (c.id === next.id ? next : c)))}
          />
        ))}
      </div>
    </div>
  );
}
