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

function QuoteCells({
  item,
  onSelect,
}: {
  item: BoqLineItem;
  onSelect: (supplierId: number) => void;
}) {
  const slots = [0, 1, 2].map((i) => item.quotes[i] ?? null);
  return (
    <div className="flex min-w-[220px] flex-col gap-1">
      {slots.map((q, i) =>
        q ? (
          <button
            key={q.supplierId}
            type="button"
            onClick={() => onSelect(q.supplierId)}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-2 py-1 text-left text-[11px] transition-all",
              item.selectedSupplierId === q.supplierId
                ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)] font-semibold text-[var(--figma-navy)]"
                : "border-[var(--figma-border)] bg-white text-[var(--figma-gray500)]",
            )}
          >
            <span className="truncate">{q.supplierName}</span>
            <span>{formatLKR(q.price)}</span>
          </button>
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
  const sub = categorySubtotal(cat);

  const patchItem = (id: number, patch: Partial<BoqLineItem>) => {
    onChange({
      ...cat,
      items: cat.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  };

  return (
    <SectionCard className="overflow-hidden px-0 py-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-3 border-none bg-transparent px-5 py-4 text-left"
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
            {cat.items.length} items · budget {formatLKR(cat.budget)} · {cat.durationDays} working days
          </div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-extrabold text-[var(--figma-navy)]">{formatLKR(sub)}</div>
          <div className="text-[10px] text-[var(--figma-gray400)]">subtotal</div>
        </div>
        <MaterialIcon
          name={open ? "expand_less" : "expand_more"}
          outlined
          size={22}
          className="text-[var(--figma-gray400)]"
        />
      </button>

      {open && (
        <div className="border-t border-[var(--figma-border)] px-4 pb-5 pt-3 sm:px-5">
          <TimelineWidget
            phase={cat.label}
            initialDays={String(cat.durationDays)}
            badgeVariant="teal"
          />

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-[12px]">
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
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-2 pb-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cat.items.map((row) => {
                  const neg = NEG[row.negotiationStatus];
                  const pay = PAY[row.paymentStatus];
                  return (
                    <tr key={row.id} className="border-t border-[var(--figma-border)] align-top">
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
                      <td className="px-2 py-3 font-medium">{row.qty}</td>
                      <td className="px-2 py-3">{formatLKR(row.rate)}</td>
                      <td className="px-2 py-3 font-bold text-[var(--figma-navy)]">
                        {formatLKR(lineItemTotal(row))}
                      </td>
                      <td className="px-2 py-3">
                        <QuoteCells
                          item={row}
                          onSelect={(supplierId) => patchItem(row.id, { selectedSupplierId: supplierId })}
                        />
                      </td>
                      <td className="px-2 py-3 font-semibold text-[var(--figma-teal)]">
                        {formatLKR(row.designFirmPrice)}
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
  const budget = cats.reduce((s, c) => s + c.budget, 0);

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <WorkspaceBreadcrumb items={["Projects", project.name, "Execution", "BOQ"]} onBack={onBack} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 mb-1 text-[24px] font-bold text-[var(--figma-navy)] sm:text-[28px]">
            Bill of Quantities
          </h1>
          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
            Categories A–L · up to 3 supplier quotes per line · design firm price to client
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
            style={{ color: grand <= budget ? "#3FA66B" : "#EF4444" }}
          >
            {formatLKR(grand - budget)}
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
