"use client";

import Link from "next/link";
import { Filter } from "lucide-react";

import {
  PROJECTS_OVERVIEW_DATA,
  PROJ_STATUS_CONFIG,
  type ProjectOverviewItem,
} from "@/components/dashboard/studio/demo-data";
import { NAV_ROUTES } from "@/types/navigation";

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF1F6]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function ProjectsOverview({
  items = PROJECTS_OVERVIEW_DATA,
  title = "Projects Overview",
}: {
  items?: ProjectOverviewItem[];
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E9F0] bg-white shadow-[0px_4px_16px_rgba(11,37,69,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E9F0] px-6 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#16233D]">{title}</h3>
          <p className="text-[12px] text-[#5B6B85]">
            {items.length} projects across all studios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-[#E4E9F0] px-3 py-2 text-[12px] text-[#5B6B85] transition-colors hover:border-[#0FA8A0] hover:text-[#0FA8A0]"
          >
            <Filter className="size-3.5" />
            Filter
          </button>
          <Link
            href={NAV_ROUTES.projects}
            className="inline-flex h-7 items-center rounded-full border border-[#0FA8A0] px-3 text-[0.8rem] font-medium text-[#0FA8A0] transition-colors hover:bg-[#E6F7F7]"
          >
            All Projects
          </Link>
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <div
          className="grid border-b border-[#E4E9F0] px-6 py-2.5 text-[11px] font-semibold tracking-wider text-[#5B6B85] uppercase"
          style={{ gridTemplateColumns: "80px 1.6fr 1fr 1fr 110px 110px 120px 64px" }}
        >
          <span>Code</span>
          <span>Project</span>
          <span>Client</span>
          <span>Phase</span>
          <span>Status</span>
          <span>Next deadline</span>
          <span>Progress</span>
          <span />
        </div>
        {items.map((proj) => {
          const cfg = PROJ_STATUS_CONFIG[proj.status];
          return (
            <div
              key={proj.id}
              className="grid items-center border-b border-[#E4E9F0] px-6 py-3.5 transition-colors last:border-0 hover:bg-[#F0FAFA]"
              style={{ gridTemplateColumns: "80px 1.6fr 1fr 1fr 110px 110px 120px 64px" }}
            >
              <span className="font-mono text-[11px] font-semibold text-[#5B6B85]">
                {proj.code}
              </span>
              <span className="text-[13.5px] font-semibold text-[#16233D]">
                {proj.name}
              </span>
              <span className="text-[12px] text-[#5B6B85]">{proj.client}</span>
              <span className="text-[12px] font-medium text-[#16233D]">{proj.phase}</span>
              <span>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </span>
              <span className="text-[12px] text-[#5B6B85]">{proj.nextDeadline}</span>
              <div className="pr-4">
                <div className="mb-1.5 flex justify-between text-[10px] text-[#5B6B85]">
                  <span>{proj.progress}%</span>
                </div>
                <ProgressBar pct={proj.progress} color={cfg.bar} />
              </div>
              <div>
                <Link
                  href={NAV_ROUTES.projects}
                  className="inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[#E6F7F7]"
                  style={{ borderColor: "#0FA8A0", color: "#0FA8A0" }}
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="divide-y divide-[#E4E9F0] md:hidden">
        {items.map((proj) => {
          const cfg = PROJ_STATUS_CONFIG[proj.status];
          return (
            <div key={proj.id} className="space-y-2 px-5 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px] font-semibold text-[#5B6B85]">
                    {proj.code}
                  </div>
                  <div className="text-[14px] font-semibold text-[#16233D]">
                    {proj.name}
                  </div>
                  <div className="text-[12px] text-[#5B6B85]">{proj.client}</div>
                  <div className="text-[11px] text-[#5B6B85]">
                    {proj.phase} · {proj.nextDeadline}
                  </div>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
              <ProgressBar pct={proj.progress} color={cfg.bar} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
