"use client";

import { useState } from "react";
import Link from "next/link";

import { DemoCaption } from "@/components/demo/demo-caption";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { NeuTabToggle } from "@/components/projects/hub/neu-tab-toggle";
import {
  CategoryBadge,
  GradientButton,
  StatusPill,
  StatusToggle,
} from "@/components/suppliers/supplier-ui";
import { VendorTasksTab } from "@/components/suppliers/vendor-tasks-tab";
import { getSupplierLinkedProjects, type SupplierLinkedProject } from "@/lib/projects/mock-project-links";
import {
  CATEGORY_CFG,
  DELIVERY_STATUS_CFG,
  PAYMENT_STATUS_CFG,
  SUPPLIER_ORDERS,
  SUPPLIER_RATES,
  SUPPLIERS,
  type Supplier,
  type SupplierOrder,
  type SupplierRate,
} from "@/lib/suppliers/mock-suppliers";
import { NAV_ROUTES, projectRoute } from "@/types/navigation";
import { cn } from "@/lib/utils";

type Tab = "overview" | "rates" | "orders" | "projects" | "tasks";

const TABS = [
  { id: "overview" as Tab, label: "Overview", icon: "business" },
  { id: "rates" as Tab, label: "Rates & Terms", icon: "price_change" },
  { id: "orders" as Tab, label: "Order History", icon: "local_shipping" },
  { id: "projects" as Tab, label: "Linked Projects", icon: "folder_open" },
  { id: "tasks" as Tab, label: "Tasks & Deadlines", icon: "task_alt" },
];

const PROJECT_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  "on-track": { label: "On Track", color: "var(--figma-success)", bg: "rgba(63,166,107,0.10)" },
  "at-risk": { label: "At Risk", color: "#F5A623", bg: "rgba(245,166,35,0.10)" },
};

function RateRow({ rate, onSave }: { rate: SupplierRate; onSave: (r: SupplierRate) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...rate });
  const [hov, setHov] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-[var(--figma-border)] bg-[rgba(14,124,134,0.03)]">
        {(["item", "rate", "unit", "creditTerms", "leadTime"] as const).map((field) => (
          <td key={field} className="px-3 py-2">
            <input
              value={draft[field]}
              onChange={(e) => setDraft((p) => ({ ...p, [field]: e.target.value }))}
              className="hub-input-focus w-full rounded-lg border-[1.5px] border-[var(--figma-teal)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--figma-navy)] outline-none neu-inset"
            />
          </td>
        ))}
        <td className="px-3 py-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSave(draft);
                setEditing(false);
              }}
              className="gi-gradient-cta cursor-pointer rounded-lg border-none px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft({ ...rate });
                setEditing(false);
              }}
              className="cursor-pointer rounded-lg border border-[var(--figma-border)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--figma-gray500)]"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="border-b border-[var(--figma-border)] transition-colors duration-120"
      style={{ background: hov ? "rgba(14,124,134,0.03)" : "#fff" }}
    >
      <td className="px-4 py-3 text-[13px] font-medium text-[var(--figma-navy)]">{rate.item}</td>
      <td className="px-4 py-3 text-[13px] font-semibold text-[var(--figma-navy)]">{rate.rate}</td>
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">{rate.unit}</td>
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">{rate.creditTerms}</td>
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">{rate.leadTime}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Edit rate"
          className={cn(
            "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-none transition-all duration-150",
            hov ? "bg-[var(--figma-gray100)]" : "bg-transparent",
          )}
        >
          <MaterialIcon name="edit" outlined size={16} className="text-[var(--figma-gray500)]" />
        </button>
      </td>
    </tr>
  );
}

function OverviewTab({ supplier }: { supplier: Supplier }) {
  const catColor = CATEGORY_CFG[supplier.category]?.color ?? "var(--figma-teal)";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 neu-card">
        <div className="mb-4 flex items-center gap-2">
          <MaterialIcon name="contact_page" outlined size={18} className="text-[var(--figma-teal)]" />
          <h3 className="text-[15px] font-semibold text-[var(--figma-navy)]">Contact Details</h3>
        </div>
        {[
          { icon: "person", label: "Contact Person", value: supplier.contactPerson },
          { icon: "email", label: "Email", value: supplier.email },
          { icon: "phone", label: "Phone", value: supplier.phone },
          { icon: "location_on", label: "Address", value: supplier.address },
          { icon: "language", label: "Website", value: supplier.website ?? "—" },
          { icon: "account_balance", label: "Credit Terms", value: supplier.creditTerms },
          { icon: "schedule", label: "Avg Lead Time", value: supplier.avgLeadTime },
        ].map((row) => (
          <div
            key={row.label}
            className="flex gap-3 border-b border-[var(--figma-border)] py-2.5 last:border-b-0"
          >
            <div
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px]"
              style={{ background: `${catColor}12` }}
            >
              <MaterialIcon name={row.icon} outlined size={15} style={{ color: catColor }} />
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
            <MaterialIcon name="bar_chart" outlined size={18} className="text-[var(--figma-teal)]" />
            <h3 className="text-[15px] font-semibold text-[var(--figma-navy)]">Summary Stats</h3>
          </div>
          <div className="flex gap-3">
            {[
              { icon: "shopping_cart", label: "Total Orders", value: String(supplier.totalOrders), color: "var(--figma-navy)" },
              { icon: "folder_open", label: "Active Projects", value: String(supplier.activeProjects), color: "var(--figma-teal)" },
              { icon: "schedule", label: "Avg Lead Time", value: supplier.avgLeadTime, color: "var(--figma-success)" },
            ].map((tile) => (
              <div key={tile.label} className="flex-1 rounded-xl bg-white p-3.5 neu-card">
                <div
                  className="mb-2 flex h-[30px] w-[30px] items-center justify-center rounded-[7px]"
                  style={{ background: `${tile.color}14` }}
                >
                  <MaterialIcon name={tile.icon} outlined size={16} style={{ color: tile.color }} />
                </div>
                <div className="text-[18px] font-bold text-[var(--figma-navy)]">{tile.value}</div>
                <div className="mt-0.5 text-[11px] text-[var(--figma-gray500)]">{tile.label}</div>
              </div>
            ))}
          </div>
        </div>

        {supplier.notes && (
          <div className="rounded-2xl bg-white p-6 neu-card">
            <div className="mb-3 flex items-center gap-2">
              <MaterialIcon name="sticky_note_2" outlined size={18} className="text-[var(--figma-teal)]" />
              <h3 className="text-[15px] font-semibold text-[var(--figma-navy)]">Notes</h3>
            </div>
            <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">{supplier.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RatesTab({ supplierId }: { supplierId: number }) {
  const initialRates = SUPPLIER_RATES[supplierId] ?? [];
  const [rates, setRates] = useState<SupplierRate[]>(initialRates);

  if (rates.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--figma-gray400)]">
        <MaterialIcon name="price_change" outlined size={40} className="mx-auto mb-3 block" />
        <div className="mb-1.5 text-[15px] font-semibold text-[var(--figma-navy)]">No rate card yet</div>
        <div className="text-[13px]">Add the first rate entry for this supplier</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--figma-border)] px-5 py-3">
        <div className="flex items-center gap-2">
          <MaterialIcon name="info" outlined size={16} className="text-[var(--figma-teal)]" />
          <span className="text-[12px] text-[var(--figma-gray500)]">
            Rates can be edited at any time — click the{" "}
            <strong className="text-[var(--figma-navy)]">pencil icon</strong> on any row
          </span>
        </div>
        <GradientButton className="px-3.5 py-1.5 text-[12px]">
          <MaterialIcon name="add" outlined size={14} />
          Add Rate
        </GradientButton>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--figma-gray50)]">
              {["Item / Service", "Rate", "Unit", "Credit Terms", "Lead Time", ""].map((col) => (
                <th
                  key={col}
                  className="border-b border-[var(--figma-border)] px-4 py-[11px] text-left text-[12px] font-semibold tracking-wide whitespace-nowrap text-[var(--figma-navy)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <RateRow
                key={rate.id}
                rate={rate}
                onSave={(updated) => setRates((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  isLast,
}: {
  order: SupplierOrder;
  isLast: boolean;
}) {
  const [hov, setHov] = useState(false);
  const dCfg = DELIVERY_STATUS_CFG[order.deliveryStatus];
  const pCfg = PAYMENT_STATUS_CFG[order.paymentStatus];

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn("transition-colors duration-120", !isLast && "border-b border-[var(--figma-border)]")}
      style={{ background: hov ? "rgba(14,124,134,0.03)" : "#fff" }}
    >
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">{order.date}</td>
      <td className="px-4 py-3 text-[13px] font-medium text-[var(--figma-navy)]">{order.project}</td>
      <td className="px-4 py-3 text-[13px] text-[var(--figma-gray500)]">{order.item}</td>
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">{order.quantity}</td>
      <td className="px-4 py-3">
        <StatusPill label={order.deliveryStatus} color={dCfg.color} bg={dCfg.bg} />
      </td>
      <td className="px-4 py-3">
        <StatusPill label={order.paymentStatus} color={pCfg.color} bg={pCfg.bg} />
      </td>
      <td className="px-4 py-3 text-[13px] font-semibold text-[var(--figma-navy)]">{order.amount}</td>
    </tr>
  );
}

function OrdersTab({ supplierId }: { supplierId: number }) {
  const orders = SUPPLIER_ORDERS[supplierId] ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--figma-gray50)]">
              {["Order Date", "Project", "Item", "Qty", "Delivery Status", "Payment", "Amount"].map((col) => (
                <th
                  key={col}
                  className="border-b border-[var(--figma-border)] px-4 py-[11px] text-left text-[12px] font-semibold tracking-wide whitespace-nowrap text-[var(--figma-navy)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <MaterialIcon name="local_shipping" outlined size={36} className="mx-auto mb-2.5 block text-[var(--figma-border)]" />
                  <div className="text-[14px] text-[var(--figma-gray500)]">No orders yet</div>
                </td>
              </tr>
            ) : (
              orders.map((order, i) => (
                <OrderRow key={order.id} order={order} isLast={i === orders.length - 1} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectsTab({ supplierId }: { supplierId: number }) {
  const projects = getSupplierLinkedProjects(supplierId);

  if (projects.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[var(--figma-border)] bg-white px-4 py-8 text-center text-[13px] text-[var(--figma-gray400)]">
        No projects linked to this supplier.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {projects.map((p) => {
        const s = PROJECT_STATUS_CFG[p.status]!;
        return <LinkedProjectCard key={p.projectId} project={p} statusCfg={s} />;
      })}
    </div>
  );
}

function LinkedProjectCard({
  project: p,
  statusCfg: s,
}: {
  project: SupplierLinkedProject;
  statusCfg: { label: string; color: string; bg: string };
}) {
  const [hov, setHov] = useState(false);

  return (
    <Link
      href={projectRoute(p.projectId)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-[14px] bg-white p-4 no-underline transition-all duration-200 neu-card",
        hov && "neu-card-hover -translate-y-px",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] gi-gradient-cta">
        <MaterialIcon name="folder_open" outlined size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-semibold text-[var(--figma-navy)]">{p.name}</div>
        <div className="mt-0.5 text-[12px] text-[var(--figma-gray500)]">
          {p.phase} · {p.role}
        </div>
      </div>
      <StatusPill label={s.label} color={s.color} bg={s.bg} />
      <MaterialIcon name="chevron_right" outlined size={18} className="text-[var(--figma-gray400)]" />
    </Link>
  );
}

function HeaderToggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className="flex cursor-pointer items-center gap-2 rounded-full border-none px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200"
      style={{
        background: active ? "rgba(63,166,107,0.12)" : "rgba(242,109,109,0.10)",
        color: active ? "var(--figma-success)" : "var(--figma-alert)",
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: active ? "var(--figma-success)" : "var(--figma-alert)" }}
      />
      {active ? "Active" : "Inactive"}
      <StatusToggle active={active} onChange={onChange} />
    </button>
  );
}

export function SupplierProfileScreen({ supplierId }: { supplierId: number }) {
  const [tab, setTab] = useState<Tab>("overview");
  const supplier = SUPPLIERS.find((s) => s.id === supplierId) ?? SUPPLIERS[0]!;
  const [active, setActive] = useState(supplier.status === "Active");

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
        <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[14px] text-[22px] font-bold text-white gi-gradient-cta neu-card">
          {supplier.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h1 className="text-[24px] font-bold text-[var(--figma-navy)]">{supplier.name}</h1>
            <CategoryBadge label={supplier.category} />
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="person" outlined size={15} className="text-[var(--figma-gray400)]" />
              <span className="text-[13px] text-[var(--figma-gray500)]">{supplier.contactPerson}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="email" outlined size={15} className="text-[var(--figma-gray400)]" />
              <span className="text-[13px] text-[var(--figma-gray500)]">{supplier.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MaterialIcon name="account_balance" outlined size={15} className="text-[var(--figma-gray400)]" />
              <span className="text-[13px] text-[var(--figma-gray500)]">{supplier.creditTerms}</span>
            </div>
          </div>
          <DemoCaption className="mt-2" />
        </div>
        <div className="flex shrink-0 gap-2.5">
          <HeaderToggle active={active} onChange={setActive} />
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

      {tab === "overview" && <OverviewTab supplier={supplier} />}
      {tab === "rates" && <RatesTab supplierId={supplierId} />}
      {tab === "orders" && <OrdersTab supplierId={supplierId} />}
      {tab === "projects" && <ProjectsTab supplierId={supplierId} />}
      {tab === "tasks" && <VendorTasksTab partyKind="supplier" partyId={supplierId} />}
    </div>
  );
}
