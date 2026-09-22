"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { NeuTabToggle } from "@/components/projects/hub/neu-tab-toggle";
import { AddSupplierModal } from "@/components/suppliers/add-supplier-modal";
import { LinkSupplierProjectModal } from "@/components/suppliers/link-supplier-project-modal";
import {
  CategoryBadge,
  GradientButton,
  StatusPill,
  StatusToggle,
  SupplierRangeBadge,
} from "@/components/suppliers/supplier-ui";
import { VendorTasksTab } from "@/components/suppliers/vendor-tasks-tab";
import { useProjects } from "@/hooks/use-projects";
import { useSupplier } from "@/hooks/use-supplier";
import { useSupplierLinkedFromProjectLinks } from "@/hooks/use-supplier-linked-from-project-links";
import { useSupplierOrders } from "@/hooks/use-supplier-orders";
import { useVendorTasks } from "@/hooks/use-vendor-tasks";
import { handleApiError } from "@/lib/api/handle-api-error";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { stageToPhase } from "@/lib/projects/map-project-hub";
import { CATEGORY_CFG } from "@/lib/projects/link-categories";
import {
  DELIVERY_STATUS_CFG,
  PAYMENT_STATUS_CFG,
} from "@/lib/suppliers/map-suppliers";
import type { Supplier, SupplierOrder, UpdateSupplierPayload } from "@/types/suppliers";
import type { SupplierLinkedProject } from "@/types/project-links";
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

const CREDIT_TERMS = [
  "Immediate Payment",
  "50% Advance 50% Completion",
  "Full Payment before dispatch",
  "Due on Completion",
];

const PROJECT_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  "on-track": { label: "On Track", color: "var(--figma-success)", bg: "rgba(63,166,107,0.10)" },
  "at-risk": { label: "At Risk", color: "#F5A623", bg: "rgba(245,166,35,0.10)" },
};

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

function RatesTab({
  supplier,
  onSave,
  isSaving,
}: {
  supplier: Supplier;
  onSave: (payload: UpdateSupplierPayload) => Promise<void>;
  isSaving: boolean;
}) {
  const [creditTerms, setCreditTerms] = useState(
    supplier.creditTerms === "—" ? "Due on Completion" : supplier.creditTerms,
  );
  const [leadTime, setLeadTime] = useState(
    supplier.avgLeadTime === "—" ? "" : supplier.avgLeadTime,
  );
  const [notes, setNotes] = useState(supplier.notes ?? "");

  const dirty =
    creditTerms !== (supplier.creditTerms === "—" ? "Due on Completion" : supplier.creditTerms) ||
    leadTime !== (supplier.avgLeadTime === "—" ? "" : supplier.avgLeadTime) ||
    notes !== (supplier.notes ?? "");

  const creditTermsOptions =
    creditTerms && !CREDIT_TERMS.includes(creditTerms)
      ? [creditTerms, ...CREDIT_TERMS]
      : CREDIT_TERMS;

  const handleSave = async () => {
    try {
      await onSave({
        credit_terms: creditTerms || undefined,
        avg_lead_time: leadTime.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success("Rates & terms updated");
    } catch (error) {
      handleApiError(error, { toast: true });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--figma-border)] px-5 py-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <MaterialIcon name="price_change" outlined size={18} className="text-[var(--figma-teal)]" />
            <h3 className="text-[15px] font-semibold text-[var(--figma-navy)]">Credit terms & lead time</h3>
          </div>
          <p className="m-0 max-w-xl text-[12px] text-[var(--figma-gray500)]">
            Edit commercial terms stored on this supplier. Itemized rate cards will be available when the
            backend supports them.
          </p>
        </div>
        <GradientButton
          onClick={handleSave}
          disabled={!dirty || isSaving}
          className="shrink-0 px-3.5 py-1.5 text-[12px]"
        >
          <MaterialIcon name="save" outlined size={14} />
          {isSaving ? "Saving…" : "Save"}
        </GradientButton>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]">Credit Terms</label>
          <div className="relative">
            <select
              value={creditTerms}
              onChange={(e) => setCreditTerms(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pr-9 pl-3.5 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
            >
              {creditTermsOptions.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
            <MaterialIcon
              name="expand_more"
              outlined
              size={16}
              className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[var(--figma-gray400)]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]">Avg Lead Time</label>
          <input
            value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
            placeholder="e.g. 4–6 weeks"
            className="w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-2.5 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Commercial notes, preferred payment methods…"
            className="hub-input-focus w-full resize-y rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none neu-inset"
          />
        </div>
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

function OrdersTab({
  supplierId,
  enabled = true,
}: {
  supplierId: string;
  enabled?: boolean;
}) {
  const { orders, isLoading, error } = useSupplierOrders(supplierId, { enabled });

  if (isLoading) {
    return (
      <div className="rounded-[14px] border border-dashed border-[var(--figma-border)] bg-white px-4 py-8 text-center text-[13px] text-[var(--figma-gray400)]">
        Loading order history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        {error}
      </div>
    );
  }

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
                  <div className="mb-1 text-[14px] font-medium text-[var(--figma-navy)]">No order history yet</div>
                  <div className="mx-auto max-w-sm text-[13px] text-[var(--figma-gray500)]">
                    Orders placed with this supplier will appear here with delivery and payment status.
                  </div>
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

function ProjectsTab({
  projects,
  isLoading,
  onLinkClick,
}: {
  projects: SupplierLinkedProject[];
  isLoading?: boolean;
  onLinkClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <GradientButton onClick={onLinkClick} className="px-4 py-2 text-[13px]">
          <MaterialIcon name="link" outlined size={16} />
          Link Project
        </GradientButton>
      </div>
      {isLoading ? (
        <div className="rounded-[14px] border border-dashed border-[var(--figma-border)] bg-white px-4 py-8 text-center text-[13px] text-[var(--figma-gray400)]">
          Loading linked projects…
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[var(--figma-border)] bg-white px-4 py-8 text-center text-[13px] text-[var(--figma-gray400)]">
          No projects linked to this supplier yet. Use Link Project to attach an existing project.
        </div>
      ) : (
        projects.map((p) => {
          const s = PROJECT_STATUS_CFG[p.status]!;
          return <LinkedProjectCard key={p.projectId} project={p} statusCfg={s} />;
        })
      )}
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

function HeaderToggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (v: boolean) => void;
}) {
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

export function SupplierProfileScreen({ supplierId }: { supplierId: string }) {
  const authDisabled = isAuthDisabled();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const {
    supplier,
    isLoading,
    error,
    updateSupplier,
    deleteSupplier,
    isUpdating,
    isDeleting,
  } = useSupplier(supplierId);
  const { tasks: vendorTasks } = useVendorTasks({ party_id: supplierId, party_kind: "supplier" });
  const { projects } = useProjects({ page: 1, limit: 100 });
  const { linkedFromProjectLinks, isLoading: projectLinksLoading } =
    useSupplierLinkedFromProjectLinks(supplierId, projects, {
      enabled: !authDisabled && tab === "projects",
    });

  const linkedFromTasks = useMemo(() => {
    const byId = new Map(projects.map((p) => [p.id, p]));
    const seen = new Set<string>();
    return vendorTasks
      .filter((task) => {
        if (seen.has(task.projectId)) return false;
        seen.add(task.projectId);
        return true;
      })
      .map((task) => {
        const project = byId.get(task.projectId);
        const status: SupplierLinkedProject["status"] =
          project?.status === "Inactive" ? "at-risk" : "on-track";
        return {
          projectId: task.projectId,
          name: project?.name ?? "Project",
          phase: stageToPhase(project?.currentStage),
          status,
          role: "Supplier",
        } satisfies SupplierLinkedProject;
      });
  }, [vendorTasks, projects]);

  const linkedProjects = useMemo(() => {
    const byId = new Map<string, SupplierLinkedProject>();
    for (const project of linkedFromTasks) byId.set(project.projectId, project);
    for (const project of linkedFromProjectLinks) {
      const existing = byId.get(project.projectId);
      byId.set(
        project.projectId,
        existing ? { ...existing, role: project.role || existing.role } : project,
      );
    }
    return [...byId.values()];
  }, [linkedFromTasks, linkedFromProjectLinks]);

  if (authDisabled) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
        Live supplier profiles require auth. Copy <code className="font-mono">.env.local.example</code> to{" "}
        <code className="font-mono">.env.local</code> and set{" "}
        <code className="font-mono">NEXT_PUBLIC_ENABLE_AUTH=true</code>.
      </div>
    );
  }

  if (isLoading) {
    return <div className="py-10 text-center text-[13px] text-[var(--figma-gray500)]">Loading supplier…</div>;
  }

  if (error || !supplier) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        {error ?? "Supplier not found"}
      </div>
    );
  }

  const active = supplier.status === "Active";

  const handleDelete = async () => {
    if (!window.confirm(`Delete supplier “${supplier.name}”? This cannot be undone.`)) return;
    try {
      await deleteSupplier();
      toast.success("Supplier deleted");
      router.push(NAV_ROUTES.suppliers);
    } catch (err) {
      handleApiError(err, { toast: true });
    }
  };

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
            <SupplierRangeBadge range={supplier.supplierRange} />
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
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <HeaderToggle
            active={active}
            onChange={(next) => {
              void updateSupplier({ status: next ? "Active" : "Inactive" });
            }}
          />
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => setEditOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-[var(--figma-border)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--figma-navy)] neu-raised"
          >
            <MaterialIcon name="edit" outlined size={16} />
            Edit
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-[rgba(242,109,109,0.35)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--figma-alert)]"
          >
            <MaterialIcon name="delete" outlined size={16} />
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <NeuTabToggle tabs={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === "overview" && <OverviewTab supplier={supplier} />}
      {tab === "rates" && (
        <RatesTab
          key={`${supplier.id}-${supplier.creditTerms}-${supplier.avgLeadTime}-${supplier.notes ?? ""}`}
          supplier={supplier}
          isSaving={isUpdating}
          onSave={(payload) => updateSupplier(payload).then(() => undefined)}
        />
      )}
      {tab === "orders" && <OrdersTab supplierId={supplierId} enabled={tab === "orders"} />}
      {tab === "projects" && (
        <ProjectsTab
          projects={linkedProjects}
          isLoading={projectLinksLoading}
          onLinkClick={() => setLinkOpen(true)}
        />
      )}
      {tab === "tasks" && <VendorTasksTab partyKind="supplier" partyId={supplierId} />}

      {linkOpen && (
        <LinkSupplierProjectModal
          supplierId={supplier.id}
          supplierName={supplier.name}
          role={supplier.category}
          linkedProjectIds={linkedProjects.map((p) => p.projectId)}
          onClose={() => setLinkOpen(false)}
        />
      )}

      <AddSupplierModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editSupplier={supplier}
        isCreating={isUpdating}
        onUpdateSupplier={async (payload) => {
          await updateSupplier(payload);
        }}
      />
    </div>
  );
}
