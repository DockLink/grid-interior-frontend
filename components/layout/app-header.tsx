"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useCommandPalette } from "@/components/layout/command-palette";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { getPageMeta } from "@/lib/navigation/page-meta";
import {
  ROLE_LABEL,
  toSidebarRole,
} from "@/lib/navigation/sidebar-role";
import { getUserDisplayName, getUserInitials } from "@/lib/user/display";
import { NAV_ROUTES } from "@/types/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MOCK_HEADER_NOTIFICATIONS } from "@/lib/notifications/mock-notifications";

const NOTIF_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  task: { icon: "task_alt", color: "var(--figma-navy)", bg: "rgba(27,42,74,0.09)" },
  file: { icon: "upload_file", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.09)" },
  deadline: { icon: "alarm", color: "var(--figma-alert)", bg: "rgba(242,109,109,0.09)" },
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, primaryRole } = useAuth();
  const { setOpen: setCommandPaletteOpen } = useCommandPalette();
  const meta = getPageMeta(pathname);
  const sidebarRole = primaryRole ? toSidebarRole(primaryRole) : null;

  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_HEADER_NOTIFICATIONS);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-[var(--figma-border)] bg-white px-4 md:px-7">
      <SidebarTrigger className="-ml-1 text-[var(--figma-gray500)]" />

      <div className="min-w-[160px]">
        {meta.breadcrumb.length > 1 ? (
          <div className="flex items-center gap-1.5">
            {meta.breadcrumb.map((crumb, i) => (
              <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">
                {i < meta.breadcrumb.length - 1 ? (
                  <>
                    <span className="cursor-default text-[13px] text-[var(--figma-gray400)]">
                      {crumb}
                    </span>
                    <MaterialIcon name="chevron_right" size={14} className="text-[var(--figma-gray400)]" />
                  </>
                ) : (
                  <span className="text-sm font-semibold text-[var(--figma-navy)]">{crumb}</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <h1 className="text-lg font-semibold text-[var(--figma-navy)]">{meta.title}</h1>
        )}
      </div>

      <div
        className="flex h-[38px] max-w-[420px] flex-1 items-center gap-2 rounded-[24px] px-4 transition-all duration-150"
        style={{
          boxShadow: searchFocus
            ? "var(--neu-inset), 0 0 0 2px var(--figma-teal)"
            : "var(--neu-inset)",
          border: searchFocus
            ? "1.5px solid var(--figma-teal)"
            : "1.5px solid var(--figma-border)",
        }}
      >
        <MaterialIcon
          name="search"
          size={18}
          className={searchFocus ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
        />
        <input
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
          placeholder="Search clients, projects, suppliers..."
          className="w-full border-none bg-transparent text-[13px] text-[var(--figma-navy)] outline-none placeholder:text-[var(--figma-gray400)]"
        />
        {searchVal ? (
          <button
            type="button"
            onClick={() => setSearchVal("")}
            className="flex border-none bg-transparent p-0"
          >
            <MaterialIcon name="close" size={16} className="text-[var(--figma-gray400)]" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="shrink-0 rounded border border-[var(--figma-border)] bg-[var(--figma-gray100)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--figma-gray400)]"
        >
          ⌘K
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <Link
          href={NAV_ROUTES.settings}
          title="Settings"
          className="flex size-[38px] items-center justify-center rounded-[10px] text-[var(--figma-gray500)] transition-colors hover:bg-[var(--figma-gray100)]"
        >
          <Settings className="size-[22px]" />
        </Link>

        <div ref={notifRef} className="relative">
          <button
            type="button"
            title="Notifications"
            onClick={() => setShowNotifs((v) => !v)}
            className={`relative flex size-[38px] items-center justify-center rounded-[10px] transition-colors ${
              showNotifs ? "bg-[var(--figma-gray100)]" : "hover:bg-[var(--figma-gray100)]"
            }`}
          >
            <MaterialIcon name="notifications" size={22} className="text-[var(--figma-gray500)]" />
            {unread > 0 ? (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full border-2 border-white bg-[var(--figma-alert)] text-[9px] font-bold text-white">
                {unread}
              </span>
            ) : null}
          </button>

          {showNotifs ? (
            <div
              className="absolute top-[calc(100%+10px)] right-0 z-[100] w-[360px] overflow-hidden rounded-2xl border border-[rgba(229,231,235,0.7)] bg-white"
              style={{ boxShadow: "var(--neu-dropdown)" }}
            >
              <div className="flex items-center justify-between border-b border-[var(--figma-border)] px-[18px] py-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-[var(--figma-navy)]">
                    Notifications
                  </span>
                  {unread > 0 ? (
                    <span className="rounded-[10px] bg-[var(--figma-alert)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
                  className="border-none bg-transparent p-0 text-xs font-medium text-[var(--figma-teal)]"
                >
                  Mark all as read
                </button>
              </div>

              {notifs.map((n, i) => {
                const cfg = NOTIF_ICON[n.type];
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() =>
                      setNotifs((prev) =>
                        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                      )
                    }
                    className={`relative flex w-full items-start gap-3 px-[18px] py-3 text-left transition-colors hover:bg-[var(--figma-gray50)] ${
                      i < notifs.length - 1 ? "border-b border-[var(--figma-border)]" : ""
                    } ${n.read ? "bg-white" : "bg-[rgba(14,124,134,0.03)]"}`}
                  >
                    {!n.read ? (
                      <span className="absolute top-1/2 left-1.5 size-1.5 -translate-y-1/2 rounded-full bg-[var(--figma-teal)]" />
                    ) : null}
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-[10px]"
                      style={{ background: cfg.bg }}
                    >
                      <MaterialIcon name={cfg.icon} size={18} style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`mb-0.5 text-[13px] leading-snug text-[var(--figma-navy)] ${
                          n.read ? "font-normal" : "font-semibold"
                        }`}
                      >
                        {n.message}
                      </div>
                      <div className="text-xs text-[var(--figma-gray500)]">{n.detail}</div>
                    </div>
                    <div className="shrink-0 pt-0.5 text-[11px] text-[var(--figma-gray400)]">
                      {n.time}
                    </div>
                  </button>
                );
              })}

              <div className="border-t border-[var(--figma-border)] px-[18px] py-2.5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifs(false);
                    router.push(NAV_ROUTES.notifications);
                  }}
                  className="border-none bg-transparent text-xs font-medium text-[var(--figma-teal)]"
                >
                  View all notifications
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mx-1 h-6 w-px bg-[var(--figma-border)]" />

        {user ? (
          <button
            type="button"
            className="flex items-center gap-2 rounded-[24px] border-none bg-transparent px-1.5 py-1"
          >
            <div className="flex size-[34px] items-center justify-center rounded-full border-2 border-[var(--figma-border)] bg-gradient-to-br from-[var(--figma-teal)] to-[var(--figma-navy)] text-xs font-bold text-white">
              {getUserInitials(user)}
            </div>
            <div className="hidden text-left sm:block">
              <div className="max-w-[100px] truncate text-[13px] font-semibold text-[var(--figma-navy)]">
                {getUserDisplayName(user).split(" ")[0]}.
              </div>
              {sidebarRole ? (
                <div className="text-[11px] text-[var(--figma-gray400)]">
                  {ROLE_LABEL[sidebarRole]}
                </div>
              ) : null}
            </div>
            <MaterialIcon name="expand_more" size={16} className="hidden text-[var(--figma-gray400)] sm:block" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
