"use client";

import { useMemo, useState } from "react";
import { TasksWorkspace } from "@/components/tasks/tasks-workspace";
import { DemoCaption } from "@/components/demo/demo-caption";
import { useMyTasks } from "@/hooks/use-my-tasks";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapProjectTaskViewToMockTask } from "@/lib/tasks/map-tasks-workspace";

export default function MyTasksPage() {
  const [view] = useState<"list" | "board">("list");
  const { tasks, projectNameMap, isLoading, error } = useMyTasks();

  const workspaceTasks = useMemo(
    () =>
      tasks.map((task) =>
        mapProjectTaskViewToMockTask(task, projectNameMap[task.raw.projectId] ?? "Project"),
      ),
    [tasks, projectNameMap],
  );

  return (
    <div>
      {isAuthDisabled() && (
        <div className="px-10 pt-6">
          <DemoCaption>
            Enable auth in <code className="font-mono">.env.local</code> to load tasks assigned to
            you from the API.
          </DemoCaption>
        </div>
      )}
      <TasksWorkspace
        initialView={view}
        tasks={workspaceTasks}
        readOnly
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
