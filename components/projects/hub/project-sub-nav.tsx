"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { projectTabRoute, type ProjectTab } from "@/types/navigation";

import { MaterialIcon } from "./material-icon";

const FIGMA_TABS: { key: ProjectTab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "tasks", label: "Tasks", icon: "task_alt" },
  { key: "files", label: "Documents", icon: "description" },
  { key: "timeline", label: "Timeline", icon: "timeline" },
  { key: "links", label: "Suppliers & Clients", icon: "handshake" },
];

function tabFromPathname(pathname: string, projectId: string): ProjectTab {
  const base = `/projects/${projectId}`;
  if (pathname === base) return "overview";
  const suffix = pathname.replace(`${base}/`, "") as ProjectTab;
  return FIGMA_TABS.some((t) => t.key === suffix) ? suffix : "overview";
}

export function ProjectSubNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const activeTab = tabFromPathname(pathname, projectId);
  const [hovered, setHovered] = useState<ProjectTab | null>(null);

  return (
    <div className="flex flex-wrap gap-1">
      {FIGMA_TABS.map((tab) => {
        const active = activeTab === tab.key;
        const hover = hovered === tab.key;
        return (
          <Link
            key={tab.key}
            href={projectTabRoute(projectId, tab.key)}
            onMouseEnter={() => setHovered(tab.key)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1.5 rounded-[22px] border-none px-[18px] py-2.5 text-[13px] no-underline transition-all duration-150"
            style={{
              background: active
                ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))"
                : hover
                  ? "var(--figma-gray100)"
                  : "transparent",
              color: active ? "#fff" : hover ? "var(--figma-navy)" : "var(--figma-gray500)",
              fontWeight: active ? 600 : 400,
              boxShadow: active ? "var(--neu-raised)" : "none",
            }}
          >
            <MaterialIcon name={tab.icon} outlined={!active} size={16} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
