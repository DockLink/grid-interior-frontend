"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { ClientAvatar, ClientStatusBadge } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  AvailabilityDot,
  CategoryBadge,
  InitialsAvatar,
  StatusPill,
} from "@/components/suppliers/supplier-ui";
import { ProjectVendorTasksSection } from "@/components/suppliers/vendor-tasks-tab";
import { getActiveProject } from "@/lib/projects/mock-projects";
import {
  getProjectLinks,
  type LinkedClientView,
  type LinkedSubVendorView,
  type LinkedSupplierView,
} from "@/lib/projects/mock-project-links";
import { CATEGORY_CFG } from "@/lib/suppliers/mock-suppliers";
import { cn } from "@/lib/utils";
import { clientRoute, subVendorRoute, supplierRoute } from "@/types/navigation";

const SUPPLIER_STATUS_CFG = {
  Active: { color: "var(--figma-success)", bg: "rgba(63,166,107,0.10)" },
  Inactive: { color: "var(--figma-alert)", bg: "rgba(242,109,109,0.10)" },
} as const;

function SectionHeading({
  icon,
  title,
  count,
}: {
  icon: string;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <MaterialIcon name={icon} outlined size={18} className="text-[var(--figma-teal)]" />
      <h2 className="m-0 text-sm font-bold text-[var(--figma-navy)]">{title}</h2>
      <span className="rounded-full bg-[rgba(27,42,74,0.08)] px-2 py-0.5 text-[11px] font-semibold text-[var(--figma-navy)]">
        {count}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-[var(--figma-border)] bg-white px-4 py-8 text-center text-[13px] text-[var(--figma-gray400)]">
      {message}
    </div>
  );
}

function PartyCard({ href, children }: { href: string; children: ReactNode }) {
  const [hov, setHov] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-[14px] bg-white p-4 no-underline transition-all duration-200 neu-card",
        hov && "neu-card-hover -translate-y-px",
      )}
    >
      {children}
      <MaterialIcon
        name="chevron_right"
        outlined
        size={18}
        className="ml-auto shrink-0 text-[var(--figma-gray400)]"
      />
    </Link>
  );
}

function ClientCard({ client }: { client: LinkedClientView }) {
  return (
    <PartyCard href={clientRoute(client.id)}>
      <ClientAvatar initials={client.initials} color={client.color} size={40} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-[var(--figma-navy)]">{client.name}</div>
        <div className="mt-0.5 truncate text-[12px] text-[var(--figma-gray500)]">
          {[client.company, client.email].filter(Boolean).join(" · ") || "Project client"}
        </div>
      </div>
      <ClientStatusBadge status={client.status} />
    </PartyCard>
  );
}

function SupplierCard({ supplier }: { supplier: LinkedSupplierView }) {
  const status = SUPPLIER_STATUS_CFG[supplier.status];
  return (
    <PartyCard href={supplierRoute(supplier.id)}>
      <InitialsAvatar name={supplier.name} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-[var(--figma-navy)]">{supplier.name}</span>
          <CategoryBadge label={supplier.category} />
        </div>
        <div className="truncate text-[12px] text-[var(--figma-gray500)]">
          {supplier.role} · {supplier.contactPerson}
        </div>
      </div>
      <StatusPill label={supplier.status} color={status.color} bg={status.bg} />
    </PartyCard>
  );
}

function SubVendorCard({ vendor }: { vendor: LinkedSubVendorView }) {
  const specColor = CATEGORY_CFG[vendor.specialty]?.color ?? "var(--figma-teal)";
  return (
    <PartyCard href={subVendorRoute(vendor.id)}>
      <InitialsAvatar name={vendor.name} variant="solid" specialtyColor={specColor} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-[var(--figma-navy)]">{vendor.name}</span>
          <CategoryBadge label={vendor.specialty} />
        </div>
        <div className="truncate text-[12px] text-[var(--figma-gray500)]">
          {vendor.company} · {vendor.scope}
        </div>
      </div>
      <AvailabilityDot status={vendor.availability} />
    </PartyCard>
  );
}

export function ProjectLinksScreen({ projectId }: { projectId: string }) {
  const project = getActiveProject(projectId);
  const links = getProjectLinks(projectId);

  if (!project) {
    return (
      <div className="px-10 py-8 text-[var(--figma-gray500)]">
        Project not found. Return to the projects list.
      </div>
    );
  }

  return (
    <div className="px-10 py-7">
      <div className="mb-6">
        <h1 className="m-0 text-[20px] font-bold text-[var(--figma-navy)]">
          Linked suppliers, sub-vendors & client
        </h1>
        <p className="mt-1 mb-0 text-[13px] text-[var(--figma-gray500)]">
          Parties working on {project.name}. Open a card to view the full profile.
        </p>
      </div>

      <section className="mb-7">
        <SectionHeading icon="person" title="Client" count={links.client ? 1 : 0} />
        {links.client ? (
          <ClientCard client={links.client} />
        ) : (
          <EmptyState message="No client linked to this project." />
        )}
      </section>

      <section className="mb-7">
        <SectionHeading icon="storefront" title="Suppliers" count={links.suppliers.length} />
        {links.suppliers.length > 0 ? (
          <div className="flex flex-col gap-3">
            {links.suppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        ) : (
          <EmptyState message="No suppliers linked to this project." />
        )}
      </section>

      <section className="mb-7">
        <SectionHeading icon="engineering" title="Sub-vendors" count={links.subVendors.length} />
        {links.subVendors.length > 0 ? (
          <div className="flex flex-col gap-3">
            {links.subVendors.map((vendor) => (
              <SubVendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <EmptyState message="No sub-vendors linked to this project." />
        )}
      </section>

      <ProjectVendorTasksSection projectId={projectId} />
    </div>
  );
}
