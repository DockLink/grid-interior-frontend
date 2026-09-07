"use client";

import { useMemo } from "react";

import { AttentionPanel } from "@/components/dashboard/studio/attention-panel";
import { useAuth } from "@/hooks/use-auth";
import type {
  AttentionItem,
  FileActivityItem,
  ProjectOverviewItem,
  StatItem,
  TodaysTaskItem,
} from "@/components/dashboard/studio/demo-data";
import { FileActivityPanel } from "@/components/dashboard/studio/file-activity-panel";
import { ProjectsOverview } from "@/components/dashboard/studio/projects-overview";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/studio/stat-card";
import { TodaysTasksPanel } from "@/components/dashboard/studio/todays-tasks-panel";

export function RoleDashboard({
  stats,
  attention,
  attentionTitle,
  projects,
  projectsTitle,
  activityTitle,
  fileActivity,
  todaysTasks,
  todaysTasksTitle,
  showTodaysTasks = true,
  showActions = true,
  isLoading = false,
  onAttentionAction,
}: {
  stats: StatItem[];
  attention: AttentionItem[];
  attentionTitle?: string;
  projects?: ProjectOverviewItem[];
  projectsTitle?: string;
  activityTitle?: string;
  fileActivity?: FileActivityItem[];
  todaysTasks?: TodaysTaskItem[];
  todaysTasksTitle?: string;
  showTodaysTasks?: boolean;
  showActions?: boolean;
  isLoading?: boolean;
  onAttentionAction?: (item: AttentionItem, action: "approve" | "decline") => void;
}) {
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const first = user?.first_name?.trim() || "there";
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    return { hello, first, today };
  }, [user?.first_name]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className="text-[22px] font-bold text-[#16233D]">
            {greeting.hello}, {greeting.first}
          </h2>
          <p className="text-[13px] text-[#5B6B85]">{greeting.today}</p>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="mb-6 h-60 animate-pulse rounded-2xl border border-[#E4E9F0] bg-white" />
        {showTodaysTasks ? (
          <div className="mb-6 h-72 animate-pulse rounded-2xl border border-[#E4E9F0] bg-white" />
        ) : null}
        <div className="mb-6 grid gap-5 lg:grid-cols-[1.65fr_1fr]">
          <div className="h-80 animate-pulse rounded-2xl border border-[#E4E9F0] bg-white" />
          <div className="h-80 animate-pulse rounded-2xl border border-[#E4E9F0] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="text-[22px] font-bold text-[#16233D]">
          {greeting.hello}, {greeting.first}
        </h2>
        <p className="text-[13px] text-[#5B6B85]">{greeting.today}</p>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mb-6">
        <ProjectsOverview items={projects} title={projectsTitle} />
      </div>

      {showTodaysTasks ? (
        <div className="mb-6">
          <TodaysTasksPanel items={todaysTasks} title={todaysTasksTitle} />
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
        <AttentionPanel
          items={attention}
          title={attentionTitle}
          onAction={showActions ? onAttentionAction : undefined}
        />
        <FileActivityPanel items={fileActivity} title={activityTitle} />
      </div>
    </div>
  );
}
