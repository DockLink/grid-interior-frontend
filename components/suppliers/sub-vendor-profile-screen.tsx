"use client";

import { useState } from "react";
import Link from "next/link";

import { DemoCaption } from "@/components/demo/demo-caption";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { NeuTabToggle } from "@/components/projects/hub/neu-tab-toggle";
import {
  AvailabilityDot,
  CategoryBadge,
  StatusPill,
} from "@/components/suppliers/supplier-ui";
import { VendorTasksTab } from "@/components/suppliers/vendor-tasks-tab";
import {
  AVAILABILITY_CFG,
  CATEGORY_CFG,
  PAYMENT_STATUS_CFG,
  SUBVENDOR_HISTORY,
  SUBVENDOR_PAYMENTS,
  SUB_VENDORS,
  type AvailabilityStatus,
  type SubVendor,
  type SubVendorHistory,
  type SubVendorPayment,
} from "@/lib/suppliers/mock-suppliers";
import { NAV_ROUTES } from "@/types/navigation";
import { cn } from "@/lib/utils";

type Tab = "overview" | "history" | "payments" | "tasks";

const TABS = [
  { id: "overview" as Tab, label: "Overview", icon: "person" },
  { id: "history" as Tab, label: "Availability & History", icon: "history" },
  { id: "payments" as Tab, label: "Payment Records", icon: "receipt_long" },
  { id: "tasks" as Tab, label: "Tasks & Deadlines", icon: "task_alt" },
];

const COMPLETION_CFG: Record<string, { color: string; bg: string }> = {
  Completed: { color: "var(--figma-success)", bg: "rgba(63,166,107,0.10)" },
  "In Progress": { color: "var(--figma-navy)", bg: "rgba(27,42,74,0.09)" },
  Cancelled: { color: "var(--figma-alert)", bg: "rgba(242,109,109,0.10)" },
};

function OverviewTab({ vendor }: { vendor: SubVendor }) {
  const specColor = CATEGORY_CFG[vendor.specialty]?.color ?? "var(--figma-teal)";
  const avCfg = AVAILABILITY_CFG[vendor.availability];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 neu-card">
        <div className="mb-4 flex items-center gap-2">
          <MaterialIcon name="contact_page" outlined size={18} className="text-[var(--figma-teal)]" />
          <h3 className="text-[15px] font-semibold text-[var(--figma-navy)]">Contact Details</h3>
        </div>
        {[
          { icon: "person", label: "Name", value: vendor.name },
          { icon: "business", label: "Company", value: vendor.company },
          { icon: "phone", label: "Phone", value: vendor.phone },
          { icon: "email", label: "Email", value: vendor.email },
          { icon: "location_on", label: "Address", value: vendor.address },
        ].map((row) => (
          <div
            key={row.label}
            className="flex gap-3 border-b border-[var(--figma-border)] py-2.5 last:border-b-0"
          >
            <div
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px]"
              style={{ background: `${specColor}12` }}
            >
              <MaterialIcon name={row.icon} outlined size={15} style={{ color: specColor }} />
            </div>
            <div>
              <div className="mb-0.5 text-[11px] tracking-wide text-[var(--figma-gray400)] uppercase">
                {row.label}
              </div>
              <div className="text-[13px] font-medium text-[var(--figma-navy)]">{row.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-white p-6 neu-card">
          <div className="mb-4 flex items-center gap-2">
            <MaterialIcon name="engineering" outlined size={18} style={{ color: specColor }} />
            <h3 className="text-[15px] font-semibold text-[var(--figma-navy)]">Specialty</h3>
          </div>
          <div className="mb-3.5 flex gap-3">
            <CategoryBadge label={vendor.specialty} />
            <AvailabilityDot status={vendor.availability} />
          </div>
          <div className="my-3 h-px bg-[var(--figma-border)]" />
          <div className="flex gap-3">
            {[
              { icon: "history", label: "Past Projects", value: String(vendor.pastProjects), color: "var(--figma-navy)" },
              { icon: "stars", label: "Payment Record", value: vendor.paymentRecord, color: "var(--figma-success)" },
              { icon: "check_circle", label: "Availability", value: avCfg.label, color: avCfg.color },
            ].map((tile) => (
              <div key={tile.label} className="flex-1 rounded-[11px] bg-white p-3.5 neu-card">
                <div
                  className="mb-2 flex h-7 w-7 items-center justify-center rounded-[7px]"
                  style={{ background: `${tile.color}14` }}
                >
                  <MaterialIcon name={tile.icon} outlined size={15} style={{ color: tile.color }} />
                </div>
                <div className="text-[16px] font-bold text-[var(--figma-navy)]">{tile.value}</div>
                <div className="mt-0.5 text-[11px] text-[var(--figma-gray500)]">{tile.label}</div>
              </div>
            ))}
          </div>
        </div>

        {vendor.notes && (
          <div className="rounded-2xl bg-white p-6 neu-card">
            <div className="mb-3 flex items-center gap-2">
              <MaterialIcon name="sticky_note_2" outlined size={18} className="text-[var(--figma-teal)]" />
              <h3 className="text-[15px] font-semibold text-[var(--figma-navy)]">Notes</h3>
            </div>
            <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">{vendor.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryEntry({
  entry,
  cfg,
  isLast,
}: {
  entry: SubVendorHistory;
  cfg: { color: string; bg: string };
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div
          className="absolute top-11 bottom-[-12px] left-[19px] z-0 w-0.5"
          style={{
            background: `linear-gradient(to bottom, ${cfg.color}30, var(--figma-border))`,
          }}
        />
      )}
      <div
        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/90 neu-card"
        style={{ background: cfg.bg }}
      >
        <MaterialIcon
          name={
            entry.status === "Completed"
              ? "check_circle"
              : entry.status === "In Progress"
                ? "pending"
                : "cancel"
          }
          outlined
          size={18}
          style={{ color: cfg.color }}
        />
      </div>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className={cn(
          "mb-3.5 flex-1 rounded-[14px] border border-[rgba(229,231,235,0.5)] bg-white p-4 transition-all duration-200 neu-card",
          hov && "neu-card-hover -translate-y-px",
        )}
      >
        <div className="mb-2 flex items-start justify-between">
          <div className="text-[14px] font-semibold text-[var(--figma-navy)]">{entry.project}</div>
          <StatusPill label={entry.status} color={cfg.color} bg={cfg.bg} />
        </div>
        <div className="mb-2 flex items-center gap-1.5">
          <MaterialIcon name="date_range" outlined size={14} className="text-[var(--figma-gray400)]" />
          <span className="text-[12px] text-[var(--figma-gray500)]">
            {entry.startDate} — {entry.endDate}
          </span>
        </div>
        <div className="text-[13px] leading-normal text-[var(--figma-gray500)]">{entry.scope}</div>
      </div>
    </div>
  );
}

function HistoryTab({ vendorId }: { vendorId: number }) {
  const history = SUBVENDOR_HISTORY[vendorId] ?? [];

  if (history.length === 0) {
    return (
      <div className="py-16 text-center">
        <MaterialIcon name="history" outlined size={40} className="mx-auto mb-3 block text-[var(--figma-border)]" />
        <div className="text-[14px] text-[var(--figma-gray500)]">No project history yet</div>
      </div>
    );
  }

  return (
    <div className="max-w-[760px]">
      {history.map((entry, i) => (
        <HistoryEntry
          key={entry.id}
          entry={entry}
          cfg={COMPLETION_CFG[entry.status]!}
          isLast={i === history.length - 1}
        />
      ))}
    </div>
  );
}

function parseAmount(amount: string): number {
  const num = parseFloat(amount.replace(/[€\s,]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

function PaymentRow({
  payment: p,
  cfg,
  isLast,
}: {
  payment: SubVendorPayment;
  cfg: { color: string; bg: string };
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn("transition-colors duration-120", !isLast && "border-b border-[var(--figma-border)]")}
      style={{ background: hov ? "rgba(14,124,134,0.03)" : "#fff" }}
    >
      <td className="px-4 py-3 text-[13px] font-medium text-[var(--figma-navy)]">{p.project}</td>
      <td className="px-4 py-3 text-[13px] font-semibold text-[var(--figma-navy)]">{p.amount}</td>
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">{p.date}</td>
      <td className="px-4 py-3">
        <StatusPill label={p.status} color={cfg.color} bg={cfg.bg} />
      </td>
    </tr>
  );
}

function PaymentsTab({ vendorId }: { vendorId: number }) {
  const payments = SUBVENDOR_PAYMENTS[vendorId] ?? [];
  const total = payments.reduce((sum, p) => sum + parseAmount(p.amount), 0);

  return (
    <div>
      <div className="mb-5 flex gap-4">
        {[
          {
            label: "Total Paid",
            value: `€ ${payments
              .filter((p) => p.status === "Paid")
              .reduce((s, p) => s + parseAmount(p.amount), 0)
              .toLocaleString()}`,
            color: "var(--figma-success)",
          },
          {
            label: "Partial",
            value: `€ ${payments
              .filter((p) => p.status === "Partial")
              .reduce((s, p) => s + parseAmount(p.amount), 0)
              .toLocaleString()}`,
            color: "var(--figma-navy)",
          },
          { label: "Total (All)", value: `€ ${total.toLocaleString()}`, color: "var(--figma-teal)" },
        ].map((tile) => (
          <div key={tile.label} className="flex flex-1 flex-col gap-1.5 rounded-[14px] bg-white p-4 neu-card">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-[7px]"
              style={{ background: `${tile.color}14` }}
            >
              <MaterialIcon name="payments" outlined size={15} style={{ color: tile.color }} />
            </div>
            <div className="text-[18px] font-bold text-[var(--figma-navy)]">{tile.value}</div>
            <div className="text-[11px] text-[var(--figma-gray500)]">{tile.label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--figma-gray50)]">
                {["Project", "Amount", "Date", "Status"].map((col) => (
                  <th
                    key={col}
                    className="border-b border-[var(--figma-border)] px-4 py-[11px] text-left text-[12px] font-semibold tracking-wide text-[var(--figma-navy)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[13px] text-[var(--figma-gray400)]">
                    No payment records
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <PaymentRow
                    key={p.id}
                    payment={p}
                    cfg={PAYMENT_STATUS_CFG[p.status]}
                    isLast={i === payments.length - 1}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SubVendorProfileScreen({ vendorId }: { vendorId: number }) {
  const [tab, setTab] = useState<Tab>("overview");
  const vendor = SUB_VENDORS.find((v) => v.id === vendorId) ?? SUB_VENDORS[0]!;
  const specColor = CATEGORY_CFG[vendor.specialty]?.color ?? "var(--figma-teal)";
  const [availability, setAvailability] = useState<AvailabilityStatus>(vendor.availability);
  const avCfg = AVAILABILITY_CFG[availability];

  return (
    <div>
      <Link
        href={NAV_ROUTES.suppliers}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-[var(--figma-teal)] no-underline"
      >
        <MaterialIcon name="arrow_back" outlined size={16} />
        Back to Suppliers
      </Link>

      <div className="mb-5 flex flex-wrap items-start gap-5 rounded-2xl bg-white p-6 neu-card">
        <div
          className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full text-[22px] font-bold text-white neu-card"
          style={{ background: specColor }}
        >
          {vendor.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h1 className="text-[24px] font-bold text-[var(--figma-navy)]">{vendor.name}</h1>
            <CategoryBadge label={vendor.specialty} />
          </div>
          <div className="mb-1.5 text-[14px] text-[var(--figma-gray500)]">{vendor.company}</div>
          <div className="flex flex-wrap items-center gap-3.5">
            <AvailabilityDot status={availability} />
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="email" outlined size={15} className="text-[var(--figma-gray400)]" />
              <span className="text-[13px] text-[var(--figma-gray500)]">{vendor.email}</span>
            </div>
          </div>
          <DemoCaption className="mt-2" />
        </div>
        <div className="flex shrink-0 gap-2.5">
          <div className="relative">
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
              className="cursor-pointer appearance-none rounded-full py-2 pr-8 pl-3 text-[12px] font-semibold outline-none"
              style={{
                color: avCfg.color,
                background: `${avCfg.color}12`,
                border: `1.5px solid ${avCfg.color}40`,
              }}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Unknown">Unknown</option>
            </select>
            <MaterialIcon
              name="expand_more"
              outlined
              size={14}
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
              style={{ color: avCfg.color }}
            />
          </div>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-[var(--figma-border)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--figma-navy)] neu-raised"
          >
            <MaterialIcon name="edit" outlined size={16} />
            Edit
          </button>
        </div>
      </div>

      <div className="mb-6">
        <NeuTabToggle tabs={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === "overview" && <OverviewTab vendor={vendor} />}
      {tab === "history" && <HistoryTab vendorId={vendorId} />}
      {tab === "payments" && <PaymentsTab vendorId={vendorId} />}
      {tab === "tasks" && <VendorTasksTab partyKind="subvendor" partyId={vendorId} />}
    </div>
  );
}
