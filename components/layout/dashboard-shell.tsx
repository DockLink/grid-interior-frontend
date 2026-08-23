"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ActivityTracker } from "@/components/auth/activity-tracker";
import { ForbiddenScreen } from "@/components/auth/forbidden-screen";
import { UserPreferencesProvider } from "@/components/providers/user-preferences-provider";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPaletteProvider } from "@/components/layout/command-palette";
import { useAuth } from "@/hooks/use-auth";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { canAccessRoute } from "@/lib/navigation/sidebar-role";
import { NAV_ROUTES } from "@/types/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, primaryRole } = useAuth();
  const authDisabled = isAuthDisabled();

  useEffect(() => {
    if (!isHydrated) return;
    if (authDisabled) return;
    if (!isAuthenticated) {
      router.replace(NAV_ROUTES.login);
    }
  }, [authDisabled, isAuthenticated, isHydrated, router]);

  if (!isHydrated || (!authDisabled && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="size-8 animate-spin rounded-full border-2 border-[#0FA8A0] border-t-transparent" />
      </div>
    );
  }

  return (
    <NotificationsProvider>
      <UserPreferencesProvider>
        <CommandPaletteProvider>
          <ActivityTracker />
          <SidebarProvider
            className="bg-[#F8FAFB]"
            style={
              {
                "--sidebar-width": "260px",
                "--header-height": "64px",
              } as React.CSSProperties
            }
          >
            <AppSidebar />
            <SidebarInset className="bg-[#F8FAFB]">
              <AppHeader />
              <div className="flex flex-1 flex-col px-4 py-6 md:px-8 md:py-7">
                {!authDisabled && primaryRole && !canAccessRoute(primaryRole, pathname) ? (
                  <ForbiddenScreen />
                ) : (
                  children
                )}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </CommandPaletteProvider>
      </UserPreferencesProvider>
    </NotificationsProvider>
  );
}
