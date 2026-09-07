"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CheckSquare,
  FileText,
  FolderOpen,
  Home,
  Layers,
  LogOut,
  Settings,
  Shield,
  Store,
  Timeline,
  Users,
  type LucideIcon,
} from "lucide-react";

import { LOGIN_T } from "@/components/auth/login-tokens";
import { useAuth } from "@/hooks/use-auth";
import { useLastProjectId } from "@/hooks/use-last-project-id";
import { useUserPreferences } from "@/components/providers/user-preferences-provider";
import {
  isProjectNavActive,
  resolveProjectNavHref,
} from "@/lib/navigation/last-project";
import { toSidebarRole, type SidebarRole } from "@/lib/navigation/sidebar-role";
import { resolveHomeRoute } from "@/lib/navigation/home-route";
import { NAV_ROUTES } from "@/types/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavItem = {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  isActive?: (pathname: string) => boolean;
};

function isRouteActive(pathname: string, routes: string | string[]) {
  const list = Array.isArray(routes) ? routes : [routes];
  return list.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function buildFigmaNav(
  role: SidebarRole,
  homePage: string,
  lastProjectId: string | null,
): NavItem[] {
  const items: NavItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      href: homePage,
      icon: Home,
      isActive: (pathname) => pathname === homePage,
    },
  ];

  if (role === "admin" || role === "superadmin") {
    items.push(
      {
        id: "clients",
        title: "Clients",
        href: NAV_ROUTES.clients,
        icon: Users,
        isActive: (pathname) =>
          isRouteActive(pathname, [NAV_ROUTES.clients, NAV_ROUTES.leadPipeline]),
      },
      {
        id: "suppliers",
        title: "Suppliers & Sub-Vendors",
        href: NAV_ROUTES.suppliers,
        icon: Store,
        isActive: (pathname) => isRouteActive(pathname, NAV_ROUTES.suppliers),
      },
    );
  }

  items.push({
    id: "projects",
    title: "Project Hub",
    href: NAV_ROUTES.projects,
    icon: FolderOpen,
    isActive: (pathname) =>
      pathname === NAV_ROUTES.projects ||
      pathname.startsWith(`${NAV_ROUTES.projects}/`) ||
      isProjectNavActive(pathname, "overview"),
  });

  if (role !== "guest") {
    items.push({
      id: "tasks",
      title: "Tasks",
      href: NAV_ROUTES.myTasks,
      icon: CheckSquare,
      isActive: (pathname) => isRouteActive(pathname, NAV_ROUTES.myTasks),
    });
  }

  if (role === "admin" || role === "superadmin") {
    items.push({
      id: "documents",
      title: "Documents & Minutes",
      href: NAV_ROUTES.files,
      icon: FileText,
      isActive: (pathname) => isRouteActive(pathname, NAV_ROUTES.files),
    });
  }

  items.push({
    id: "timeline",
    title: "Timeline & Reports",
    href: resolveProjectNavHref("timeline", lastProjectId),
    icon: Timeline,
    isActive: (pathname) =>
      isProjectNavActive(pathname, "timeline") ||
      isProjectNavActive(pathname, "milestones") ||
      isProjectNavActive(pathname, "client-view") ||
      isProjectNavActive(pathname, "materials"),
  });

  if (role === "admin" || role === "superadmin") {
    items.push({
      id: "admin",
      title: "Admin Panel",
      href: NAV_ROUTES.userManagement,
      icon: Shield,
      isActive: (pathname) =>
        isRouteActive(pathname, [
          NAV_ROUTES.userManagement,
          NAV_ROUTES.guestUsers,
          NAV_ROUTES.accessRequests,
          NAV_ROUTES.team,
        ]),
    });
  }

  return items;
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup className="px-3 py-2">
      {label ? (
        <SidebarGroupLabel className="mb-1 px-2 text-[9.5px] font-semibold tracking-[0.14em] text-white/40 uppercase">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = item.isActive?.(pathname) ?? isRouteActive(pathname, item.href);
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.title}
                  className={
                    active
                      ? "relative bg-[rgba(15,168,160,0.13)] text-[#0FA8A0] hover:bg-[rgba(15,168,160,0.18)] hover:text-[#0FA8A0] before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-[#0FA8A0]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }
                  render={<Link href={item.href} />}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, primaryRole, logout } = useAuth();
  const { preferences } = useUserPreferences();
  const lastProjectId = useLastProjectId();

  if (!user || !primaryRole) return null;

  const sidebarRole = toSidebarRole(primaryRole);
  const homePage = resolveHomeRoute(primaryRole, preferences);
  const navItems = buildFigmaNav(sidebarRole, homePage, lastProjectId);

  const secondary: NavItem[] = [
    {
      id: "settings",
      title: "Settings",
      href: NAV_ROUTES.settings,
      icon: Settings,
      isActive: (p) => isRouteActive(p, NAV_ROUTES.settings),
    },
  ];

  function handleLogout() {
    logout();
    router.replace(NAV_ROUTES.login);
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-white/8 px-4 py-5">
        <Link href={homePage} className="flex items-center gap-2.5">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${LOGIN_T.teal}, ${LOGIN_T.navy})`,
            }}
          >
            <Layers className="size-4 text-white" aria-hidden />
          </div>
          <span className="truncate text-[15px] font-semibold text-white group-data-[collapsible=icon]:hidden">
            Grid Interior
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 py-2">
        <NavGroup label="Navigation" items={navItems} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-white/8 px-2 py-3">
        <NavGroup label="" items={secondary} pathname={pathname} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              className="text-white/60 hover:bg-white/5 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
