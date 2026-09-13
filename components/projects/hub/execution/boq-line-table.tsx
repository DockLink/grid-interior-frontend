"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { TimelineWidget } from "@/components/projects/hub/shared/timeline-widget";
import {
  GradientBtn,
  OutlineBtn,
  SectionCard,
  WorkspaceBreadcrumb,
} from "@/components/projects/hub/shared/workspace-ui";
import { useProjectBoq } from "@/hooks/use-boq";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useUploadFile } from "@/hooks/use-upload-file";
import { handleApiError } from "@/lib/api/handle-api-error";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { isBoqHttpUrl, toQuotesPayload } from "@/lib/boq/map-boq";
import { cn } from "@/lib/utils";
import { formatLKR } from "@/types/detail";
import type {
  AdvancePaymentStatus,
  BoqCategory,
  BoqLineItem,
  NegotiationStatus,
  SupplierQuote,
} from "@/types/execution";
import { categorySubtotal, lineItemTotal } from "@/types/execution";
import type { ActiveProjectView } from "@/types/project-hub";
import type { Supplier } from "@/types/suppliers";

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

const CELL_INPUT =
  "w-full min-w-[72px] rounded-[9px] border-[1.5px] border-[var(--figma-border)] bg-white px-2 py-1.5 text-[12px] text-[var(--figma-navy)] outline-none neu-inset focus:border-2 focus:border-[var(--figma-teal)]";

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

function TextInput({
  value,
  onChange,
  ariaLabel,
  className,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      aria-label={ariaLabel}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(CELL_INPUT, className)}
    />
  );
}

function exportBoqCsv(cats: BoqCategory[], projectName: string) {
  const rows = [
    ["Code", "Category", "Item", "Description", "Unit", "Qty", "Rate", "Total", "Budget"].join(","),
  ];
  for (const cat of cats) {
    for (const item of cat.items) {
      rows.push(
        [
          cat.code,
          JSON.stringify(cat.label),
          JSON.stringify(item.item),
          JSON.stringify(item.description),
          item.unit,
          item.qty,
          item.rate,
          lineItemTotal(item),
          cat.budget,
        ].join(","),
      );
    }
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, "_")}_BOQ.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function QuoteCells({
  item,
  editing,
  suppliers,
  onSelect,
  onQuotePrice,
  onAddQuote,
}: {
  item: BoqLineItem;
  editing: boolean;
  suppliers: Supplier[];
  onSelect: (supplierId: string) => void;
  onQuotePrice: (supplierId: string, price: number) => void;
  onAddQuote: (supplierId: string) => void;
}) {
  const slots = [0, 1, 2].map((i) => item.quotes[i] ?? null);
  const used = new Set(item.quotes.map((q) => q.supplierId));
  const available = suppliers.filter((s) => !used.has(s.id));

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
        ) : editing && available.length > 0 ? (
          <select
            key={`empty-${i}`}
            aria-label={`Add quote ${i + 1}`}
            className="rounded-lg border border-dashed border-[var(--figma-border)] bg-white px-2 py-1 text-[10px] text-[var(--figma-gray500)]"
            defaultValue=""
            onChange={(e) => {
              const id = e.target.value;
              if (id) onAddQuote(id);
              e.target.value = "";
            }}
          >
            <option value="">Add supplier…</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
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

function LineItemImageCell({
  item,
  editing,
  busy,
  onUpload,
  onClear,
}: {
  item: BoqLineItem;
  editing: boolean;
  busy: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = item.image && isBoqHttpUrl(item.image) ? item.image : null;
  const hasFile = Boolean(preview || item.imageFileId);

  return (
    <div className="flex flex-col items-start gap-1">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={item.item}
          className="size-10 rounded-md object-cover"
        />
      ) : hasFile ? (
        <div
          className="flex size-10 items-center justify-center rounded-md bg-[rgba(14,124,134,0.10)]"
          title="Image file attached — awaiting signed URL from backend"
        >
          <MaterialIcon name="image" outlined size={18} className="text-[var(--figma-teal)]" />
        </div>
      ) : (
        <span className="text-[var(--figma-gray400)]">—</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload(file);
        }}
      />
      {(editing || !hasFile) && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer border-none bg-transparent p-0 text-[10px] font-semibold text-[var(--figma-teal)] disabled:opacity-50"
          >
            {busy ? "…" : hasFile ? "Replace" : "Upload"}
          </button>
          {hasFile && editing && (
            <button
              type="button"
              disabled={busy}
              onClick={onClear}
              className="cursor-pointer border-none bg-transparent p-0 text-[10px] font-semibold text-[var(--figma-alert)] disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ContractCell({
  item,
  busy,
  onUpload,
  onClear,
}: {
  item: BoqLineItem;
  busy: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploaded = item.contractUploaded || Boolean(item.contractFileId);

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload(file);
        }}
      />
      {uploaded && item.contractUrl ? (
        <a
          href={item.contractUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3FA66B] no-underline"
        >
          <MaterialIcon name="check_circle" size={16} />
          Open
        </a>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[11px] font-medium disabled:opacity-50"
          style={{ color: uploaded ? "#3FA66B" : "var(--figma-teal)" }}
        >
          <MaterialIcon
            name={uploaded ? "check_circle" : "upload_file"}
            outlined={!uploaded}
            size={16}
          />
          {busy ? "Uploading…" : uploaded ? "Uploaded" : "Upload"}
        </button>
      )}
      {uploaded && (
        <div className="flex items-center gap-1">
          {!item.contractUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer border-none bg-transparent p-0 text-[10px] font-semibold text-[var(--figma-teal)] disabled:opacity-50"
            >
              Replace
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onClear}
            className="cursor-pointer border-none bg-transparent p-0 text-[10px] font-semibold text-[var(--figma-alert)] disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

type CategoryHandlers = {
  onBudgetChange: (budget: number) => void;
  onBudgetCommit: (budget: number) => void;
  onDurationCommit: (days: number) => void;
  onLocalItemPatch: (itemId: string, patch: Partial<BoqLineItem>) => void;
  onItemCommit: (item: BoqLineItem) => void;
  onCommercial: (itemId: string, patch: Partial<BoqLineItem>) => void;
  onQuotesChange: (itemId: string, quotes: SupplierQuote[]) => void;
  onImageUpload: (itemId: string, file: File) => Promise<void>;
  onImageClear: (itemId: string) => Promise<void>;
  onContractUpload: (itemId: string, file: File) => Promise<void>;
  onContractClear: (itemId: string) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
};

function CategoryBlock({
  cat,
  suppliers,
  handlers,
  busyItemId,
}: {
  cat: BoqCategory;
  suppliers: Supplier[];
  handlers: CategoryHandlers;
  busyItemId: string | null;
}) {
  const [open, setOpen] = useState(
    cat.code === "A" || cat.code === "C" || cat.code === "H",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const sub = categorySubtotal(cat);

  const finishEdit = async (row: BoqLineItem) => {
    setEditingId(null);
    await handlers.onItemCommit(row);
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
              {cat.code}. {cat.label}
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
                  onChange={(budget) => handlers.onBudgetChange(budget)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditingBudget(false);
                    handlers.onBudgetCommit(cat.budget);
                  }}
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
            onDaysChange={(days) => {
              const n = Number(days);
              if (Number.isFinite(n) && n >= 0) handlers.onDurationCommit(n);
            }}
          />

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-left text-[12px]">
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
                  const busy = busyItemId === row.id;
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-t border-[var(--figma-border)] align-top",
                        editing && "bg-[rgba(14,124,134,0.03)]",
                      )}
                    >
                      <td className="px-2 py-3 font-semibold text-[var(--figma-navy)]">
                        {editing ? (
                          <TextInput
                            value={row.item}
                            ariaLabel="Item name"
                            className="min-w-[120px] font-semibold"
                            onChange={(item) => handlers.onLocalItemPatch(row.id, { item })}
                          />
                        ) : (
                          row.item
                        )}
                      </td>
                      <td className="px-2 py-3 text-[var(--figma-gray500)]">
                        {editing ? (
                          <div className="flex min-w-[140px] gap-1">
                            <TextInput
                              value={row.lengthIn}
                              ariaLabel="Length"
                              placeholder="L"
                              className="w-[44px] px-1 text-center"
                              onChange={(lengthIn) =>
                                handlers.onLocalItemPatch(row.id, { lengthIn })
                              }
                            />
                            <TextInput
                              value={row.widthIn}
                              ariaLabel="Width"
                              placeholder="W"
                              className="w-[44px] px-1 text-center"
                              onChange={(widthIn) =>
                                handlers.onLocalItemPatch(row.id, { widthIn })
                              }
                            />
                            <TextInput
                              value={row.heightIn}
                              ariaLabel="Height"
                              placeholder="H"
                              className="w-[44px] px-1 text-center"
                              onChange={(heightIn) =>
                                handlers.onLocalItemPatch(row.id, { heightIn })
                              }
                            />
                          </div>
                        ) : (
                          [row.lengthIn, row.widthIn, row.heightIn].filter(Boolean).join(" × ") ||
                          "—"
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <LineItemImageCell
                          item={row}
                          editing={editing}
                          busy={busy}
                          onUpload={(file) => void handlers.onImageUpload(row.id, file)}
                          onClear={() => void handlers.onImageClear(row.id)}
                        />
                      </td>
                      <td className="max-w-[180px] px-2 py-3 text-[var(--figma-gray500)]">
                        {editing ? (
                          <textarea
                            aria-label="Description"
                            value={row.description}
                            rows={2}
                            onChange={(e) =>
                              handlers.onLocalItemPatch(row.id, {
                                description: e.target.value,
                              })
                            }
                            className={cn(CELL_INPUT, "min-w-[140px] resize-y")}
                          />
                        ) : (
                          row.description || "—"
                        )}
                      </td>
                      <td className="px-2 py-3">
                        {editing ? (
                          <TextInput
                            value={row.unit}
                            ariaLabel="Unit"
                            className="w-[56px] text-center"
                            onChange={(unit) => handlers.onLocalItemPatch(row.id, { unit })}
                          />
                        ) : (
                          row.unit
                        )}
                      </td>
                      <td className="px-2 py-3 font-medium">
                        {editing ? (
                          <QtyInput
                            value={row.qty}
                            onChange={(qty) => handlers.onLocalItemPatch(row.id, { qty })}
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
                            onChange={(rate) => handlers.onLocalItemPatch(row.id, { rate })}
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
                          suppliers={suppliers}
                          onSelect={(supplierId) =>
                            handlers.onCommercial(row.id, { selectedSupplierId: supplierId })
                          }
                          onQuotePrice={(supplierId, price) => {
                            const quotes = row.quotes.map((q) =>
                              q.supplierId === supplierId ? { ...q, price } : q,
                            );
                            handlers.onLocalItemPatch(row.id, { quotes });
                          }}
                          onAddQuote={(supplierId) => {
                            const supplier = suppliers.find((s) => s.id === supplierId);
                            if (!supplier || row.quotes.length >= 3) return;
                            const quotes = [
                              ...row.quotes,
                              {
                                supplierId: supplier.id,
                                supplierName: supplier.name,
                                price: row.rate,
                              },
                            ];
                            handlers.onLocalItemPatch(row.id, { quotes });
                            void handlers.onQuotesChange(row.id, quotes);
                          }}
                        />
                      </td>
                      <td className="px-2 py-3 font-semibold text-[var(--figma-teal)]">
                        {editing ? (
                          <MoneyInput
                            value={row.designFirmPrice}
                            ariaLabel={`${row.item} firm price`}
                            onChange={(designFirmPrice) =>
                              handlers.onLocalItemPatch(row.id, { designFirmPrice })
                            }
                          />
                        ) : (
                          formatLKR(row.designFirmPrice)
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            handlers.onCommercial(row.id, {
                              negotiationStatus: cycleNeg(row.negotiationStatus),
                            })
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
                          onClick={() =>
                            handlers.onCommercial(row.id, {
                              paymentStatus: cyclePay(row.paymentStatus),
                            })
                          }
                          className="cursor-pointer rounded-lg border-none px-2 py-1 text-[10px] font-semibold"
                          style={{ color: pay.color, background: pay.bg }}
                        >
                          {pay.label}
                        </button>
                      </td>
                      <td className="px-2 py-3">
                        <ContractCell
                          item={row}
                          busy={busy}
                          onUpload={(file) => void handlers.onContractUpload(row.id, file)}
                          onClear={() => void handlers.onContractClear(row.id)}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (editing) {
                                const current = cat.items.find((it) => it.id === row.id) ?? row;
                                void finishEdit(current);
                              } else {
                                setEditingId(row.id);
                              }
                            }}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-1 rounded-lg border-none px-2 py-1 text-[11px] font-semibold transition-colors",
                              editing
                                ? "bg-[rgba(14,124,134,0.12)] text-[var(--figma-teal)]"
                                : "bg-[var(--figma-gray100)] text-[var(--figma-gray500)] hover:text-[var(--figma-teal)]",
                            )}
                            aria-label={editing ? `Done editing ${row.item}` : `Edit ${row.item}`}
                          >
                            <MaterialIcon
                              name={editing ? "check" : "edit"}
                              outlined={!editing}
                              size={14}
                            />
                            {editing ? "Done" : "Edit"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `Delete “${row.item}”? This cannot be undone.`,
                                )
                              ) {
                                return;
                              }
                              void handlers.onDeleteItem(row.id);
                            }}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent px-2 py-1 text-[11px] font-semibold text-[var(--figma-alert)] disabled:opacity-50"
                            aria-label={`Delete ${row.item}`}
                          >
                            <MaterialIcon name="delete" outlined size={14} />
                            Delete
                          </button>
                        </div>
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
  const {
    categories: remoteCats,
    isLoading,
    error,
    isAuthOff,
    updateCategory,
    createItem,
    updateItem,
    deleteItem,
    replaceQuotes,
    updateCommercial,
  } = useProjectBoq(project.id);

  const { suppliers } = useSuppliers({ page: 1, limit: 100 });
  const { uploadFile } = useUploadFile();
  const authOff = isAuthDisabled();

  const [cats, setCats] = useState<BoqCategory[]>([]);
  const [synced, setSynced] = useState(false);
  const [addCategoryId, setAddCategoryId] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  useEffect(() => {
    if (remoteCats.length > 0 || !isLoading) {
      setCats(remoteCats);
      setSynced(true);
      setAddCategoryId((prev) => {
        if (prev && remoteCats.some((c) => c.id === prev)) return prev;
        return remoteCats.find((c) => c.code === "A")?.id ?? remoteCats[0]?.id ?? "";
      });
    }
  }, [remoteCats, isLoading]);

  const grand = useMemo(() => cats.reduce((s, c) => s + categorySubtotal(c), 0), [cats]);
  const budget = useMemo(() => cats.reduce((s, c) => s + c.budget, 0), [cats]);
  const variance = grand - budget;

  const patchLocalCat = (categoryId: string, updater: (cat: BoqCategory) => BoqCategory) => {
    setCats((prev) => prev.map((c) => (c.id === categoryId ? updater(c) : c)));
  };

  const findCategoryIdForItem = (itemId: string) =>
    cats.find((c) => c.items.some((it) => it.id === itemId))?.id;

  const patchLocalItem = (
    categoryId: string,
    itemId: string,
    patch: Partial<BoqLineItem>,
  ) => {
    patchLocalCat(categoryId, (cat) => ({
      ...cat,
      items: cat.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    }));
  };

  const withError = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (err) {
      handleApiError(err, { toast: true });
    }
  };

  const uploadStorageToken = async (file: File): Promise<{ token: string; preview?: string }> => {
    if (authOff) {
      return { token: `mock-file-${Date.now()}`, preview: URL.createObjectURL(file) };
    }
    const { token } = await uploadFile(file);
    return { token };
  };

  const addLineItem = async () => {
    const target =
      cats.find((c) => c.id === addCategoryId) ??
      cats.find((c) => c.code === "A") ??
      cats[0];
    if (!target) {
      toast.error("No BOQ category available");
      return;
    }
    try {
      const created = await createItem(target.id, {
        item: "New line item",
        description: "",
        unit: "LS",
        qty: 1,
        rate: 0,
      });
      if (isAuthOff && created) {
        patchLocalCat(target.id, (cat) => ({
          ...cat,
          items: [...cat.items, created],
        }));
      }
      toast.success(`Line item added to ${target.code}. ${target.label}`);
    } catch (err) {
      handleApiError(err, { toast: true });
    }
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const categoryId = findCategoryIdForItem(itemId);
    if (!categoryId) return;
    setBusyItemId(itemId);
    try {
      const { token, preview } = await uploadStorageToken(file);
      patchLocalItem(categoryId, itemId, {
        imageFileId: token,
        image: preview ?? undefined,
      });
      await updateItem(itemId, {
        image_file_id: token,
        image_url: token,
      });
      toast.success("Image uploaded");
    } catch (err) {
      handleApiError(err, { toast: true });
    } finally {
      setBusyItemId(null);
    }
  };

  const handleImageClear = async (itemId: string) => {
    const categoryId = findCategoryIdForItem(itemId);
    if (!categoryId) return;
    setBusyItemId(itemId);
    try {
      patchLocalItem(categoryId, itemId, { image: undefined, imageFileId: null });
      await updateItem(itemId, { image_file_id: null, image_url: null });
      toast.success("Image cleared");
    } catch (err) {
      handleApiError(err, { toast: true });
    } finally {
      setBusyItemId(null);
    }
  };

  const handleContractUpload = async (itemId: string, file: File) => {
    const categoryId = findCategoryIdForItem(itemId);
    if (!categoryId) return;
    setBusyItemId(itemId);
    try {
      const { token, preview } = await uploadStorageToken(file);
      patchLocalItem(categoryId, itemId, {
        contractFileId: token,
        contractUploaded: true,
        contractUrl: preview ?? null,
      });
      await updateCommercial(itemId, {
        contract_file_id: token,
        contract_uploaded: true,
      });
      toast.success("Contract uploaded");
    } catch (err) {
      handleApiError(err, { toast: true });
    } finally {
      setBusyItemId(null);
    }
  };

  const handleContractClear = async (itemId: string) => {
    const categoryId = findCategoryIdForItem(itemId);
    if (!categoryId) return;
    setBusyItemId(itemId);
    try {
      patchLocalItem(categoryId, itemId, {
        contractFileId: null,
        contractUploaded: false,
        contractUrl: null,
      });
      await updateCommercial(itemId, {
        contract_file_id: null,
        contract_uploaded: false,
      });
      toast.success("Contract cleared");
    } catch (err) {
      handleApiError(err, { toast: true });
    } finally {
      setBusyItemId(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const categoryId = findCategoryIdForItem(itemId);
    if (!categoryId) return;
    setBusyItemId(itemId);
    try {
      await deleteItem(itemId);
      patchLocalCat(categoryId, (cat) => ({
        ...cat,
        items: cat.items.filter((it) => it.id !== itemId),
      }));
      toast.success("Line item deleted");
    } catch (err) {
      handleApiError(err, { toast: true });
    } finally {
      setBusyItemId(null);
    }
  };

  if (isLoading && !synced) {
    return (
      <div className="px-4 py-6 sm:px-10 sm:py-8">
        <WorkspaceBreadcrumb items={["Projects", project.name, "Execution", "BOQ"]} onBack={onBack} />
        <p className="mt-8 text-[13px] text-[var(--figma-gray500)]">Loading Bill of Quantities…</p>
      </div>
    );
  }

  if (error && cats.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-10 sm:py-8">
        <WorkspaceBreadcrumb items={["Projects", project.name, "Execution", "BOQ"]} onBack={onBack} />
        <p className="mt-8 text-[13px] text-[#EF4444]">{error}</p>
      </div>
    );
  }

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
        <div className="flex flex-wrap items-center gap-2">
          <OutlineBtn
            label="Export BOQ"
            icon="download"
            onClick={() => {
              exportBoqCsv(cats, project.name);
              toast.success("BOQ exported");
            }}
          />
          <select
            aria-label="Category for new line item"
            value={addCategoryId}
            onChange={(e) => setAddCategoryId(e.target.value)}
            className="h-9 rounded-[20px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 text-[12px] font-medium text-[var(--figma-navy)] outline-none neu-inset"
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}. {c.label}
              </option>
            ))}
          </select>
          <GradientBtn label="Add line item" icon="add" small onClick={() => void addLineItem()} />
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
            suppliers={suppliers}
            busyItemId={busyItemId}
            handlers={{
              onBudgetChange: (nextBudget) =>
                patchLocalCat(cat.id, (c) => ({ ...c, budget: nextBudget })),
              onBudgetCommit: (nextBudget) =>
                void withError(() => updateCategory(cat.id, { budget: nextBudget })),
              onDurationCommit: (days) => {
                patchLocalCat(cat.id, (c) => ({ ...c, durationDays: days }));
                void withError(() => updateCategory(cat.id, { duration_days: days }));
              },
              onLocalItemPatch: (itemId, patch) => patchLocalItem(cat.id, itemId, patch),
              onItemCommit: async (item) => {
                await withError(async () => {
                  await updateItem(item.id, {
                    item: item.item,
                    description: item.description,
                    length_in: item.lengthIn,
                    width_in: item.widthIn,
                    height_in: item.heightIn,
                    image_url: item.imageFileId ?? item.image ?? null,
                    image_file_id: item.imageFileId ?? null,
                    unit: item.unit,
                    qty: item.qty,
                    rate: item.rate,
                  });
                  await updateCommercial(item.id, {
                    design_firm_price: item.designFirmPrice,
                  });
                  await replaceQuotes(item.id, toQuotesPayload(item.quotes));
                });
              },
              onCommercial: (itemId, patch) => {
                patchLocalItem(cat.id, itemId, patch);
                void withError(() =>
                  updateCommercial(itemId, {
                    selected_supplier_id:
                      patch.selectedSupplierId !== undefined
                        ? patch.selectedSupplierId
                        : undefined,
                    design_firm_price: patch.designFirmPrice,
                    negotiation_status: patch.negotiationStatus,
                    payment_status: patch.paymentStatus,
                    contract_uploaded: patch.contractUploaded,
                    contract_file_id:
                      patch.contractFileId !== undefined ? patch.contractFileId : undefined,
                  }),
                );
              },
              onQuotesChange: (itemId, quotes) => {
                void withError(() => replaceQuotes(itemId, toQuotesPayload(quotes)));
              },
              onImageUpload: handleImageUpload,
              onImageClear: handleImageClear,
              onContractUpload: handleContractUpload,
              onContractClear: handleContractClear,
              onDeleteItem: handleDeleteItem,
            }}
          />
        ))}
      </div>
    </div>
  );
}
