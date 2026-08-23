import { NAV_ROUTES, projectRoute } from "@/types/navigation";
import { CLIENTS } from "@/lib/clients/mock-clients";
import { getActiveProject } from "@/lib/projects/mock-projects";
import { SUPPLIERS, SUB_VENDORS } from "@/lib/suppliers/mock-suppliers";

export type PageMeta = {
  title: string;
  breadcrumb: string[];
};

function clientName(id: string): string {
  const client = CLIENTS.find((c) => String(c.id) === id);
  return client?.name ?? "Client Profile";
}

function supplierName(id: string): string {
  const supplier = SUPPLIERS.find((s) => String(s.id) === id);
  return supplier?.name ?? "Supplier Profile";
}

function subVendorName(id: string): string {
  const vendor = SUB_VENDORS.find((v) => String(v.id) === id);
  return vendor?.name ?? "Sub-Vendor Profile";
}

export function getPageMeta(pathname: string): PageMeta {
  if (pathname === NAV_ROUTES.superAdminDashboard || pathname === NAV_ROUTES.adminDashboard) {
    return { title: "Dashboard", breadcrumb: ["GRID CRM", "Dashboard"] };
  }
  if (pathname === NAV_ROUTES.leadDashboard) {
    return { title: "Dashboard", breadcrumb: ["GRID CRM", "Dashboard"] };
  }
  if (pathname === NAV_ROUTES.memberDashboard) {
    return { title: "My Dashboard", breadcrumb: ["GRID CRM", "Dashboard"] };
  }
  if (pathname === NAV_ROUTES.guestDashboard) {
    return { title: "Dashboard", breadcrumb: ["GRID CRM", "Dashboard"] };
  }
  if (pathname === NAV_ROUTES.clients) {
    return { title: "Clients", breadcrumb: ["GRID CRM", "Clients"] };
  }
  if (pathname === NAV_ROUTES.leadPipeline) {
    return { title: "Lead Pipeline", breadcrumb: ["GRID CRM", "Clients", "Lead Pipeline"] };
  }
  if (pathname === NAV_ROUTES.suppliers) {
    return { title: "Suppliers & Sub-Vendors", breadcrumb: ["GRID CRM", "Suppliers"] };
  }
  if (pathname === NAV_ROUTES.projects) {
    return { title: "Project Hub", breadcrumb: ["GRID CRM", "Projects"] };
  }
  if (pathname === NAV_ROUTES.myTasks) {
    return { title: "My Tasks", breadcrumb: ["GRID CRM", "Tasks"] };
  }
  if (pathname === NAV_ROUTES.files) {
    return { title: "Documents & Meeting Minutes", breadcrumb: ["GRID CRM", "Documents"] };
  }
  if (pathname === NAV_ROUTES.notifications) {
    return { title: "Notifications", breadcrumb: ["GRID CRM", "Dashboard", "Notifications"] };
  }
  if (pathname === NAV_ROUTES.userManagement) {
    return { title: "User Management", breadcrumb: ["GRID CRM", "Admin", "User Management"] };
  }
  if (pathname === NAV_ROUTES.settings) {
    return { title: "Settings", breadcrumb: ["GRID CRM", "Settings"] };
  }

  const commLogMatch = pathname.match(/^\/clients\/(\d+)\/comm-log$/);
  if (commLogMatch) {
    const name = clientName(commLogMatch[1]!);
    return {
      title: "Communication Log",
      breadcrumb: ["Clients", name, "Comm Log"],
    };
  }

  const clientMatch = pathname.match(/^\/clients\/(\d+)$/);
  if (clientMatch) {
    const name = clientName(clientMatch[1]!);
    return { title: name, breadcrumb: ["Clients", name] };
  }

  const subVendorMatch = pathname.match(/^\/suppliers\/sub-vendors\/(\d+)$/);
  if (subVendorMatch) {
    const name = subVendorName(subVendorMatch[1]!);
    return { title: name, breadcrumb: ["Suppliers", "Sub-Vendors", name] };
  }

  const supplierMatch = pathname.match(/^\/suppliers\/(\d+)$/);
  if (supplierMatch) {
    const name = supplierName(supplierMatch[1]!);
    return { title: "Supplier Profile", breadcrumb: ["Suppliers", name] };
  }

  if (pathname.startsWith(`${NAV_ROUTES.projects}/`)) {
    const workspaceMatch = pathname.match(
      /^\/projects\/([^/]+)\/(consultation|concept|layout|threed|detail|execution)$/,
    );
    if (workspaceMatch) {
      const project = getActiveProject(workspaceMatch[1]!);
      const name = project?.name ?? "Project";
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
      return {
        title,
        breadcrumb: ["Projects", name, title],
      };
    }
    const overviewMatch = pathname.match(/^\/projects\/([^/]+)$/);
    if (overviewMatch) {
      const project = getActiveProject(overviewMatch[1]!);
      return {
        title: project?.name ?? "Project Overview",
        breadcrumb: ["Projects", project?.name ?? "Overview"],
      };
    }
    return { title: "Project Detail", breadcrumb: ["Projects", "Overview"] };
  }

  return { title: "Dashboard", breadcrumb: ["GRID CRM", "Dashboard"] };
}
