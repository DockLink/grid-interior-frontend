"use client";

import { ArrowRight, CheckSquare, ListTodo } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  TODAYS_TASK_STATUS_CONFIG,
  TODAYS_TASKS_DATA,
  type TodaysTaskItem,
} from "@/components/dashboard/studio/demo-data";
import { NAV_ROUTES, projectTabRoute } from "@/types/navigation";

type AssigneeGroup = {
  key: string;
  name: string;
  initials: string;
  color: string;
  tasks: TodaysTaskItem[];
};

function PriorityDot({ priority }: { priority: TodaysTaskItem["priority"] }) {
  const color =
    priority === "high" ? "#FF6B6B" : priority === "medium" ? "#D97706" : "#A0AEBB";
  return (
    <span
      className="inline-block size-1.5 shrink-0 rounded-full"
      style={{ background: color }}
      title={`${priority} priority`}
    />
  );
}

export function TodaysTasksPanel({
  items = TODAYS_TASKS_DATA,
  title = "Today's Tasks",
}: {
  items?: TodaysTaskItem[];
  title?: string;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, AssigneeGroup>();
    for (const task of items) {
      const key = task.assignee.name;
      const existing = map.get(key);
      if (existing) {
        existing.tasks.push(task);
      } else {
        map.set(key, {
          key,
          name: task.assignee.name,
          initials: task.assignee.initials,
          color: task.assignee.color,
          tasks: [task],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const total = items.length;
  const userCount = groups.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E9F0] bg-white shadow-[0px_4px_16px_rgba(11,37,69,0.06)]">
      <div className="flex items-center justify-between border-b border-[#E4E9F0] px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#16233D]">{title}</h3>
          <p className="text-[12px] text-[#5B6B85]">
            {total === 0
              ? "No tasks due today"
              : `${total} task${total !== 1 ? "s" : ""} across ${userCount} user${userCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{
            background: total > 0 ? "rgba(217,119,6,0.12)" : "#E7F9EE",
            color: total > 0 ? "#D97706" : "#2FBE6B",
          }}
        >
          {total > 0 ? "Due today" : "All clear"}
        </span>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[rgba(11,37,69,0.06)]">
            <CheckSquare className="size-6 text-[#0B2545]" />
          </div>
          <div className="mb-1 text-[14px] font-semibold text-[#16233D]">Nothing due today</div>
          <div className="text-[12px] text-[#5B6B85]">
            No open tasks are scheduled for today across the team.
          </div>
        </div>
      ) : (
        <div className="max-h-[420px] divide-y divide-[#E4E9F0] overflow-y-auto">
          {groups.map((group) => (
            <div key={group.key} className="px-5 py-3.5">
              <div className="mb-2.5 flex items-center gap-2.5">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white"
                  style={{ background: group.color }}
                >
                  {group.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[#16233D]">
                    {group.name}
                  </div>
                  <div className="text-[11px] text-[#5B6B85]">
                    {group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""} today
                  </div>
                </div>
              </div>

              <ul className="space-y-1.5 pl-[42px]">
                {group.tasks.map((task) => {
                  const status = TODAYS_TASK_STATUS_CONFIG[task.status];
                  const href = task.projectId
                    ? projectTabRoute(task.projectId, "tasks")
                    : NAV_ROUTES.myTasks;
                  return (
                    <li key={task.id}>
                      <Link
                        href={href}
                        className="group flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-[#F7F9FC]"
                      >
                        <PriorityDot priority={task.priority} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-medium text-[#16233D] group-hover:text-[#0B2545]">
                            {task.title}
                          </div>
                          <div className="truncate text-[11px] text-[#5B6B85]">{task.project}</div>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#E4E9F0] px-5 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-[#5B6B85]">
          <ListTodo className="size-3.5" />
          All users · due today
        </div>
        <Link
          href={NAV_ROUTES.myTasks}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0FA8A0] transition-colors hover:text-[#0B9990]"
        >
          <ArrowRight className="size-3" />
          View all tasks
        </Link>
      </div>
    </div>
  );
}
