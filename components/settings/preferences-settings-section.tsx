"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Folder, Home, ListTodo } from "lucide-react";
import { toast } from "sonner";

import { useUserPreferences } from "@/components/providers/user-preferences-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  getHomeRouteLabel,
  getSelectableHomeRoutes,
} from "@/lib/navigation/home-route";
import { ROLE_DEFAULT_ROUTE } from "@/types/rbac";
import type { HomeRoutePreference } from "@/types/users";
import { NAV_ROUTES } from "@/types/navigation";

const ROUTE_ICONS: Record<string, typeof Home> = {
  [NAV_ROUTES.adminDashboard]: Home,
  [NAV_ROUTES.superAdminDashboard]: Home,
  [NAV_ROUTES.leadDashboard]: Home,
  [NAV_ROUTES.memberDashboard]: Home,
  [NAV_ROUTES.guestDashboard]: Home,
  [NAV_ROUTES.projects]: Folder,
  [NAV_ROUTES.myTasks]: ListTodo,
  [NAV_ROUTES.notifications]: Bell,
};

export function PreferencesSettingsSection() {
  const { user, primaryRole, refreshUser } = useAuth();
  const { preferences, savePreferences, isSaving } = useUserPreferences();
  const [defaultHome, setDefaultHome] = useState<HomeRoutePreference | "">(
    preferences.default_home_route ?? "",
  );

  useEffect(() => {
    setDefaultHome(preferences.default_home_route ?? "");
  }, [preferences.default_home_route]);

  if (!user || !primaryRole) return null;

  const homeOptions = getSelectableHomeRoutes(primaryRole);
  const roleDefault = ROLE_DEFAULT_ROUTE[primaryRole] as HomeRoutePreference;
  const dirty = (defaultHome || null) !== (preferences.default_home_route ?? null);

  async function handleSave() {
    try {
      await savePreferences({
        default_home_route: defaultHome ? defaultHome : null,
      });
      await refreshUser();
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preferences");
    }
  }

  return (
    <div className="max-w-[760px] space-y-6">
      <div>
        <h2 className="text-[22px] font-bold text-[#16233D]">Preferences</h2>
        <p className="mt-0.5 text-[14px] text-[#5B6B85]">Personalize your workspace experience.</p>
      </div>

      <section className="rounded-2xl border border-[#E4E9F0] bg-white p-7">
        <h3 className="mb-1 text-[15px] font-bold text-[#16233D]">Default Home Route</h3>
        <p className="mb-4 text-[13px] text-[#5B6B85]">Choose which page opens when you sign in.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setDefaultHome("")}
            className="relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all"
            style={{
              borderColor: !defaultHome ? "#0FA8A0" : "#E4E9F0",
              background: !defaultHome ? "rgba(15,168,160,0.05)" : "#fff",
            }}
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: !defaultHome ? "rgba(15,168,160,0.12)" : "#F0F2F5",
              }}
            >
              <Home size={17} color={!defaultHome ? "#0FA8A0" : "#5B6B85"} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0B2545]">Role default</p>
              <p className="text-[11px] text-[#5B6B85]">{getHomeRouteLabel(roleDefault)}</p>
            </div>
            {!defaultHome ? (
              <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[#0FA8A0]">
                <Check size={10} color="white" strokeWidth={3} />
              </span>
            ) : null}
          </button>
          {homeOptions.map((route) => {
            const Icon = ROUTE_ICONS[route] ?? Home;
            const active = defaultHome === route;
            return (
              <button
                key={route}
                type="button"
                onClick={() => setDefaultHome(route)}
                className="relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all"
                style={{
                  borderColor: active ? "#0FA8A0" : "#E4E9F0",
                  background: active ? "rgba(15,168,160,0.05)" : "#fff",
                }}
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: active ? "rgba(15,168,160,0.12)" : "#F0F2F5",
                  }}
                >
                  <Icon size={17} color={active ? "#0FA8A0" : "#5B6B85"} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#16233D]">
                    {getHomeRouteLabel(route)}
                  </p>
                  <p className="text-[11px] text-[#5B6B85]">{route}</p>
                </div>
                {active ? (
                  <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[#0FA8A0]">
                    <Check size={10} color="white" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {dirty ? (
          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSave()}
              className="rounded-full bg-[#0FA8A0] px-5 text-white hover:bg-[#0B9990]"
            >
              {isSaving ? "Saving…" : "Save Preferences"}
            </Button>
          </div>
        ) : null}
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-[#D1D9E6] bg-[#F8FAFB] p-4">
        <p className="text-[13px] leading-relaxed text-[#5B6B85]">
          <span className="font-semibold text-[#0B2545]">Appearance &amp; theme are managed globally. </span>
          Your Super Admin controls visual settings for the entire organization.
        </p>
      </div>
    </div>
  );
}
