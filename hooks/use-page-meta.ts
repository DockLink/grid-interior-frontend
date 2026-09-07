"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { getPageMeta, type PageMeta } from "@/lib/navigation/page-meta";
import { queryKeys } from "@/lib/query/keys";
import type { Client } from "@/types/clients";
import type { Project } from "@/types/projects";
import type { SubVendor, Supplier } from "@/types/suppliers";

function clientNameFromCache(qc: ReturnType<typeof useQueryClient>, id: string): string | null {
  const detail = qc.getQueryData<Client>(queryKeys.clients.detail(id));
  if (detail?.name) return detail.name;
  const lists = qc.getQueriesData<{ data: Client[] }>({ queryKey: queryKeys.clients.all });
  for (const [, data] of lists) {
    const match = data?.data?.find((c) => c.id === id);
    if (match?.name) return match.name;
  }
  return null;
}

function supplierNameFromCache(qc: ReturnType<typeof useQueryClient>, id: string): string | null {
  const detail = qc.getQueryData<Supplier>(queryKeys.suppliers.detail(id));
  if (detail?.name) return detail.name;
  const lists = qc.getQueriesData<{ data: Supplier[] }>({ queryKey: queryKeys.suppliers.all });
  for (const [, data] of lists) {
    const match = data?.data?.find((s) => s.id === id);
    if (match?.name) return match.name;
  }
  return null;
}

function subVendorNameFromCache(qc: ReturnType<typeof useQueryClient>, id: string): string | null {
  const detail = qc.getQueryData<SubVendor>(queryKeys.subVendors.detail(id));
  return detail?.name ?? null;
}

function projectNameFromCache(qc: ReturnType<typeof useQueryClient>, id: string): string | null {
  const detail = qc.getQueryData<Project>(queryKeys.projects.detail(id));
  return detail?.name ?? null;
}

function resolveLiveMeta(pathname: string, qc: ReturnType<typeof useQueryClient>): PageMeta {
  const base = getPageMeta(pathname, { skipEntityLookup: true });

  const commLogMatch = pathname.match(/^\/clients\/([^/]+)\/comm-log$/);
  if (commLogMatch) {
    const name = clientNameFromCache(qc, commLogMatch[1]!) ?? "Client Profile";
    return { title: "Communication Log", breadcrumb: ["Clients", name, "Comm Log"] };
  }

  const clientMatch = pathname.match(/^\/clients\/([^/]+)$/);
  if (clientMatch) {
    const name = clientNameFromCache(qc, clientMatch[1]!) ?? "Client Profile";
    return { title: name, breadcrumb: ["Clients", name] };
  }

  const subVendorMatch = pathname.match(/^\/suppliers\/sub-vendors\/([^/]+)$/);
  if (subVendorMatch) {
    const name = subVendorNameFromCache(qc, subVendorMatch[1]!) ?? "Sub-Vendor Profile";
    return { title: name, breadcrumb: ["Suppliers", "Sub-Vendors", name] };
  }

  const supplierMatch = pathname.match(/^\/suppliers\/([^/]+)$/);
  if (supplierMatch) {
    const name = supplierNameFromCache(qc, supplierMatch[1]!) ?? "Supplier Profile";
    return { title: "Supplier Profile", breadcrumb: ["Suppliers", name] };
  }

  if (pathname.startsWith("/projects/")) {
    const workspaceMatch = pathname.match(
      /^\/projects\/([^/]+)\/(consultation|concept|layout|threed|detail|execution)$/,
    );
    if (workspaceMatch) {
      const name = projectNameFromCache(qc, workspaceMatch[1]!) ?? "Project";
      const segment = workspaceMatch[2]!;
      const titles: Record<string, string> = {
        consultation: "Consultation",
        concept: "Concept Design",
        layout: "Layout",
        threed: "3D Design",
        detail: "Detail Drawings",
        execution: "Execution",
      };
      const title = titles[segment] ?? "Workspace";
      return { title, breadcrumb: ["Projects", name, title] };
    }
    const overviewMatch = pathname.match(/^\/projects\/([^/]+)$/);
    if (overviewMatch) {
      const name = projectNameFromCache(qc, overviewMatch[1]!) ?? "Project Overview";
      return { title: name, breadcrumb: ["Projects", name] };
    }
    const tabMatch = pathname.match(
      /^\/projects\/([^/]+)\/(files|tasks|minutes|timeline|milestones|client-view|materials|links|hold-requests)$/,
    );
    if (tabMatch) {
      const name = projectNameFromCache(qc, tabMatch[1]!) ?? "Project";
      const titles: Record<string, string> = {
        files: "Documents",
        tasks: "Tasks",
        minutes: "Minutes",
        timeline: "Timeline",
        milestones: "Milestones",
        "client-view": "Client View",
        materials: "Materials",
        links: "Suppliers & Clients",
        "hold-requests": "Hold Requests",
      };
      const title = titles[tabMatch[2]!] ?? "Detail";
      return { title, breadcrumb: ["Projects", name, title] };
    }
  }

  return base;
}

export function usePageMeta(): PageMeta {
  const pathname = usePathname();
  const qc = useQueryClient();

  return useMemo(() => resolveLiveMeta(pathname, qc), [pathname, qc]);
}
