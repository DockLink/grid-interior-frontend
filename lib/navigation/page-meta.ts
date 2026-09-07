import { NAV_ROUTES, projectRoute } from "@/types/navigation";

export type PageMeta = {
  title: string;
  breadcrumb: string[];
};

export function getPageMeta(
  pathname: string,
  options: { skipEntityLookup?: boolean } = {},
): PageMeta {
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

  if (options.skipEntityLookup) {
    const commLogMatch = pathname.match(/^\/clients\/([^/]+)\/comm-log$/);
    if (commLogMatch) {
      return {
        title: "Communication Log",
        breadcrumb: ["Clients", "Client Profile", "Comm Log"],
      };
    }
    const clientMatch = pathname.match(/^\/clients\/([^/]+)$/);
    if (clientMatch) {
      return { title: "Client Profile", breadcrumb: ["Clients", "Client Profile"] };
    }
    const subVendorMatch = pathname.match(/^\/suppliers\/sub-vendors\/([^/]+)$/);
    if (subVendorMatch) {
      return {
        title: "Sub-Vendor Profile",
        breadcrumb: ["Suppliers", "Sub-Vendors", "Sub-Vendor Profile"],
      };
    }
    const supplierMatch = pathname.match(/^\/suppliers\/([^/]+)$/);
    if (supplierMatch) {
      return { title: "Supplier Profile", breadcrumb: ["Suppliers", "Supplier Profile"] };
    }
    if (pathname.startsWith(`${NAV_ROUTES.projects}/`)) {
      const workspaceMatch = pathname.match(
        /^\/projects\/([^/]+)\/(consultation|concept|layout|threed|detail|execution)$/,
      );
      if (workspaceMatch) {
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
        return { title, breadcrumb: ["Projects", "Project", title] };
      }
      const overviewMatch = pathname.match(/^\/projects\/([^/]+)$/);
      if (overviewMatch) {
        return { title: "Project Overview", breadcrumb: ["Projects", "Overview"] };
      }
      const tabMatch = pathname.match(
        /^\/projects\/([^/]+)\/(files|tasks|minutes|timeline|links|hold-requests)$/,
      );
      if (tabMatch) {
        const titles: Record<string, string> = {
          files: "Documents",
          tasks: "Tasks",
          minutes: "Minutes",
          timeline: "Timeline",
          links: "Suppliers & Clients",
          "hold-requests": "Hold Requests",
        };
        const title = titles[tabMatch[2]!] ?? "Detail";
        return { title, breadcrumb: ["Projects", "Project", title] };
      }
      return { title: "Project Detail", breadcrumb: ["Projects", "Overview"] };
    }
  }

  return { title: "Dashboard", breadcrumb: ["GRID CRM", "Dashboard"] };
}
