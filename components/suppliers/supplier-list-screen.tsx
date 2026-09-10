"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { AddSupplierModal } from "@/components/suppliers/add-supplier-modal";
import {
  AvailabilityDot,
  CategoryBadge,
  FilterDropdown,
  GradientButton,
  InitialsAvatar,
  StatusToggle,
  SupplierRangeBadge,
} from "@/components/suppliers/supplier-ui";
import { useSubVendors } from "@/hooks/use-sub-vendors";
import { useSuppliers } from "@/hooks/use-suppliers";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { CATEGORY_CFG } from "@/lib/projects/link-categories";
import { SUPPLIER_RANGES } from "@/lib/suppliers/map-suppliers";
import {
  downloadSubVendorsCsv,
  downloadSuppliersCsv,
  slugForFilename,
} from "@/lib/suppliers/suppliers-export";
import type { SubVendor, Supplier, SupplierRange } from "@/types/suppliers";
import { subVendorRoute, supplierRoute } from "@/types/navigation";
import { cn } from "@/lib/utils";

type TabView = "suppliers" | "subvendors";

function SupplierRow({
  supplier,
  onSelect,
  onStatusChange,
}: {
  supplier: Supplier;
  onSelect: () => void;
  onStatusChange: (active: boolean) => void;
}) {
  const [hov, setHov] = useState(false);
  const active = supplier.status === "Active";

  return (
    <tr
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="cursor-pointer border-b border-[var(--figma-border)] transition-colors duration-120"
      style={{ background: hov ? "rgba(14,124,134,0.04)" : "#fff" }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <InitialsAvatar name={supplier.name} />
          <div>
            <div className="text-[13px] font-semibold text-[var(--figma-navy)]">{supplier.name}</div>
            {supplier.website && (
              <div className="mt-0.5 text-[11px] text-[var(--figma-teal)]">{supplier.website}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <CategoryBadge label={supplier.category} />
      </td>
      <td className="px-4 py-3">
        <SupplierRangeBadge range={supplier.supplierRange} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--figma-gray500)]">
            <MaterialIcon name="person" outlined size={13} className="text-[var(--figma-gray400)]" />
            {supplier.contactPerson}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--figma-gray500)]">
            <MaterialIcon name="email" outlined size={13} className="text-[var(--figma-gray400)]" />
            {supplier.email}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        {supplier.activeProjects > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(27,42,74,0.08)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--figma-navy)]">
            <MaterialIcon name="folder_open" outlined size={12} />
            {supplier.activeProjects}
          </span>
        ) : (
          <span className="text-[12px] text-[var(--figma-gray400)]">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">{supplier.avgLeadTime}</td>
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">{supplier.creditTerms}</td>
      <td className="px-4 py-3">
        <StatusToggle
          active={active}
          onChange={(next) => {
            onStatusChange(next);
          }}
        />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all duration-150",
            hov
              ? "gi-gradient-cta border-transparent text-white"
              : "border-[var(--figma-border)] bg-white text-[var(--figma-navy)]",
          )}
        >
          View
          <MaterialIcon name="arrow_forward" outlined size={12} />
        </button>
      </td>
    </tr>
  );
}

function SubVendorRow({
  vendor,
  onSelect,
}: {
  vendor: SubVendor;
  onSelect: () => void;
}) {
  const [hov, setHov] = useState(false);
  const payColor =
    vendor.paymentRecord === "Excellent"
      ? "var(--figma-success)"
      : vendor.paymentRecord === "Good"
        ? "var(--figma-teal)"
        : "#F5A623";

  return (
    <tr
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="cursor-pointer border-b border-[var(--figma-border)] transition-colors duration-120"
      style={{ background: hov ? "rgba(14,124,134,0.04)" : "#fff" }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <InitialsAvatar
            name={vendor.name}
            variant="solid"
            specialtyColor={CATEGORY_CFG[vendor.specialty]?.color ?? "var(--figma-navy)"}
            rounded="full"
          />
          <div>
            <div className="text-[13px] font-semibold text-[var(--figma-navy)]">{vendor.name}</div>
            <div className="text-[11px] text-[var(--figma-gray500)]">{vendor.company}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <CategoryBadge label={vendor.specialty} />
      </td>
      <td className="px-4 py-3">
        <AvailabilityDot status={vendor.availability} />
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(27,42,74,0.08)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--figma-navy)]">
          <MaterialIcon name="history" outlined size={12} />
          {vendor.pastProjects}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ color: payColor, background: `${payColor}14` }}
        >
          <span className="h-[5px] w-[5px] rounded-full" style={{ background: payColor }} />
          {vendor.paymentRecord}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all duration-150",
            hov
              ? "gi-gradient-cta border-transparent text-white"
              : "border-[var(--figma-border)] bg-white text-[var(--figma-navy)]",
          )}
        >
          View
          <MaterialIcon name="arrow_forward" outlined size={12} />
        </button>
      </td>
    </tr>
  );
}

export function SupplierListScreen({ initialTab = "suppliers" }: { initialTab?: TabView }) {
  const router = useRouter();
  const authDisabled = isAuthDisabled();
  const [tab, setTab] = useState<TabView>(initialTab);
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [rangeFilter, setRangeFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  const {
    suppliers,
    isLoading: suppliersLoading,
    error: suppliersError,
    updateSupplier,
    createSupplier,
    isCreating: isCreatingSupplier,
  } = useSuppliers({ page: 1, limit: 100 });
  const {
    subVendors,
    isLoading: subVendorsLoading,
    error: subVendorsError,
    createSubVendor,
    isCreating: isCreatingSubVendor,
  } = useSubVendors({ page: 1, limit: 100 });

  const supplierCategories = useMemo(
    () => ["All", ...Array.from(new Set(suppliers.map((s) => s.category)))],
    [suppliers],
  );
  const subVendorSpecialties = useMemo(
    () => ["All", ...Array.from(new Set(subVendors.map((s) => s.specialty)))],
    [subVendors],
  );

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((s) => {
        const q = search.toLowerCase();
        const matchQ =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q);
        const matchCat = categoryFilter === "All" || s.category === categoryFilter;
        const matchRange =
          rangeFilter === "All" || s.supplierRange === (rangeFilter as SupplierRange);
        return matchQ && matchCat && matchRange;
      }),
    [suppliers, search, categoryFilter, rangeFilter],
  );

  const filteredVendors = useMemo(
    () =>
      subVendors.filter((v) => {
        const q = search.toLowerCase();
        const matchQ =
          !q ||
          v.name.toLowerCase().includes(q) ||
          v.specialty.toLowerCase().includes(q) ||
          v.company.toLowerCase().includes(q);
        const matchCat = categoryFilter === "All" || v.specialty === categoryFilter;
        return matchQ && matchCat;
      }),
    [subVendors, search, categoryFilter],
  );

  const isSuppliers = tab === "suppliers";
  const isLoading = isSuppliers ? suppliersLoading : subVendorsLoading;
  const error = isSuppliers ? suppliersError : subVendorsError;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1.5 text-[28px] font-bold text-[var(--figma-navy)]">Suppliers</h1>
          <p className="text-[14px] text-[var(--figma-gray500)]">
            Manage supplier records, rates, and project links · {suppliers.length} suppliers ·{" "}
            {subVendors.length} sub-vendors
          </p>
          {authDisabled && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
              Live supplier data requires auth. Copy <code className="font-mono">.env.local.example</code> to{" "}
              <code className="font-mono">.env.local</code> and set{" "}
              <code className="font-mono">NEXT_PUBLIC_ENABLE_AUTH=true</code>.
            </div>
          )}
        </div>
        <GradientButton onClick={() => setShowAdd(true)}>
          <MaterialIcon name="add" outlined size={16} />
          {isSuppliers ? "Add Supplier" : "Add Sub-Vendor"}
        </GradientButton>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div
          className="inline-flex gap-1 rounded-xl border border-[var(--figma-border)] p-1 neu-inset"
          style={{ background: "var(--figma-gray50)" }}
        >
          {(
            [
              { id: "suppliers" as TabView, label: "Suppliers", icon: "storefront", count: suppliers.length },
              { id: "subvendors" as TabView, label: "Sub-Vendors", icon: "engineering", count: subVendors.length },
            ] as const
          ).map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setCategoryFilter("All");
                  setRangeFilter("All");
                  setSearch("");
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-[9px] border-none px-[18px] py-2 text-[13px] transition-all duration-200",
                  isActive
                    ? "bg-white font-semibold text-[var(--figma-navy)] neu-raised"
                    : "bg-transparent font-normal text-[var(--figma-gray500)]",
                )}
              >
                <MaterialIcon
                  name={t.icon}
                  outlined={!isActive}
                  size={16}
                  className={isActive ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
                />
                {t.label}
                <span
                  className={cn(
                    "rounded-[10px] px-1.5 py-px text-[10px] font-bold",
                    isActive ? "gi-gradient-cta text-white" : "bg-[var(--figma-gray200)] text-[var(--figma-gray500)]",
                  )}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          <div
            className={cn(
              "flex h-[38px] max-w-[300px] min-w-[220px] flex-1 items-center gap-2 rounded-[10px] bg-white px-3.5 transition-all duration-150 neu-inset",
              searchFocus
                ? "border-[1.5px] border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_2px_var(--figma-teal)]"
                : "border-[1.5px] border-[var(--figma-border)]",
            )}
          >
            <MaterialIcon
              name="search"
              outlined
              size={17}
              className={cn(
                "shrink-0",
                searchFocus ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]",
              )}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder={isSuppliers ? "Search suppliers…" : "Search sub-vendors…"}
              className="w-full border-none bg-transparent text-[13px] text-[var(--figma-navy)] outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex cursor-pointer border-none bg-transparent p-0"
              >
                <MaterialIcon name="close" outlined size={15} className="text-[var(--figma-gray400)]" />
              </button>
            )}
          </div>

          <FilterDropdown
            value={categoryFilter}
            options={isSuppliers ? supplierCategories : subVendorSpecialties}
            onChange={setCategoryFilter}
          />

          {isSuppliers && (
            <FilterDropdown
              value={rangeFilter}
              options={["All", ...SUPPLIER_RANGES]}
              onChange={setRangeFilter}
            />
          )}

          <span className="ml-1 text-[12px] text-[var(--figma-gray400)]">
            {isSuppliers ? filteredSuppliers.length : filteredVendors.length} results
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-[rgba(14,124,134,0.25)] bg-[rgba(14,124,134,0.06)] px-2.5 py-1.5">
          <MaterialIcon name="info" outlined size={14} className="text-[var(--figma-teal)]" />
          <span className="text-[11px] font-medium text-[var(--figma-teal)]">
            Accessible to Backend Admin role
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
        {isLoading ? (
          <div className="px-6 py-14 text-center text-[13px] text-[var(--figma-gray500)]">Loading…</div>
        ) : error ? (
          <div className="px-6 py-14 text-center text-[13px] text-[var(--figma-alert)]">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[var(--figma-gray50)]">
                    {(isSuppliers
                      ? ["Supplier", "Category", "Range", "Contact", "Active Projects", "Lead Time", "Credit Terms", "Status", ""]
                      : ["Sub-Vendor", "Specialty", "Availability", "Past Projects", "Payment Record", ""]
                    ).map((col) => (
                      <th
                        key={col}
                        className="border-b border-[var(--figma-border)] px-4 py-[11px] text-left text-[12px] font-semibold tracking-wide whitespace-nowrap text-[var(--figma-navy)]"
                      >
                        <div className="flex items-center gap-1">
                          {col}
                          {["Supplier", "Category", "Range", "Sub-Vendor", "Specialty"].includes(col) && (
                            <MaterialIcon name="unfold_more" outlined size={13} className="text-[var(--figma-gray400)]" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isSuppliers
                    ? filteredSuppliers.map((s) => (
                        <SupplierRow
                          key={s.id}
                          supplier={s}
                          onSelect={() => router.push(supplierRoute(s.id))}
                          onStatusChange={(active) => {
                            void updateSupplier(s.id, { status: active ? "Active" : "Inactive" });
                          }}
                        />
                      ))
                    : filteredVendors.map((v) => (
                        <SubVendorRow
                          key={v.id}
                          vendor={v}
                          onSelect={() => router.push(subVendorRoute(v.id))}
                        />
                      ))}
                  {((isSuppliers && filteredSuppliers.length === 0) ||
                    (!isSuppliers && filteredVendors.length === 0)) && (
                    <tr>
                      <td colSpan={8}>
                        <div className="px-6 py-14 text-center">
                          <MaterialIcon
                            name="search_off"
                            outlined
                            size={40}
                            className="mx-auto mb-3 block text-[var(--figma-border)]"
                          />
                          <div className="mb-1.5 text-[15px] font-semibold text-[var(--figma-navy)]">
                            No results found
                          </div>
                          <div className="text-[13px] text-[var(--figma-gray500)]">
                            Try adjusting your search or filter
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--figma-border)] px-5 py-3">
              <span className="text-[12px] text-[var(--figma-gray400)]">
                Showing {isSuppliers ? filteredSuppliers.length : filteredVendors.length}{" "}
                {isSuppliers ? "suppliers" : "sub-vendors"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isSuppliers) {
                    downloadSuppliersCsv(filteredSuppliers, `${slugForFilename("suppliers")}.csv`);
                    toast.success(`Exported ${filteredSuppliers.length} suppliers`);
                  } else {
                    downloadSubVendorsCsv(filteredVendors, `${slugForFilename("sub-vendors")}.csv`);
                    toast.success(`Exported ${filteredVendors.length} sub-vendors`);
                  }
                }}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--figma-border)] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[var(--figma-navy)]"
              >
                Export CSV
                <MaterialIcon name="file_download" outlined size={13} />
              </button>
            </div>
          </>
        )}
      </div>

      <AddSupplierModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        defaultMode={isSuppliers ? "supplier" : "subvendor"}
        isDemo={authDisabled}
        isCreating={isCreatingSupplier || isCreatingSubVendor}
        onCreateSupplier={async (payload) => {
          if (authDisabled) return;
          await createSupplier(payload);
        }}
        onCreateSubVendor={async (payload) => {
          if (authDisabled) return;
          await createSubVendor(payload);
        }}
      />
    </div>
  );
}
