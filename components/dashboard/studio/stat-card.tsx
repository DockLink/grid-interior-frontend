"use client";

import {
  Calendar,
  CheckSquare,
  Flag,
  FolderOpen,
  ListTodo,
  PauseCircle,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { StatItem } from "@/components/dashboard/studio/demo-data";
import { cn } from "@/lib/utils";

const ICONS: Record<StatItem["icon"], LucideIcon> = {
  folder: FolderOpen,
  "user-plus": UserPlus,
  pause: PauseCircle,
  check: CheckSquare,
  list: ListTodo,
  flag: Flag,
  users: Users,
  calendar: Calendar,
};

export function StatCard({
  label,
  value,
  delta,
  icon,
  accent,
  bg,
  className,
}: StatItem & { className?: string }) {
  const Icon = ICONS[icon];

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E4E9F0] bg-white p-5 shadow-[0px_4px_16px_rgba(11,37,69,0.06)]",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: bg }}
        >
          <Icon className="size-5" style={{ color: accent }} />
        </div>
        {delta ? (
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{
              color: delta.startsWith("+") ? "#2FBE6B" : "#FF6B6B",
              background: delta.startsWith("+") ? "#E7F9EE" : "#FDECEC",
            }}
          >
            {delta}
          </span>
        ) : null}
      </div>
      <div className="mb-1 text-[30px] leading-none font-bold text-[#16233D]">
        {value}
      </div>
      <div className="text-[13px] text-[#5B6B85]">{label}</div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#E4E9F0] bg-white p-5 shadow-[0px_4px_16px_rgba(11,37,69,0.06)]">
      <div className="mb-4 size-10 rounded-xl bg-[#E6F7F7]" />
      <div className="mb-2 h-8 w-1/3 rounded-lg bg-[#E6F7F7]" />
      <div className="h-3.5 w-3/5 rounded-lg bg-[#EEF9F8]" />
    </div>
  );
}
