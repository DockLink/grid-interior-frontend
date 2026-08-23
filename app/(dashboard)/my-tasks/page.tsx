"use client";

import { useState } from "react";
import { TasksWorkspace } from "@/components/tasks/tasks-workspace";
import { MOCK_TASKS } from "@/lib/tasks/mock-tasks";

export default function MyTasksPage() {
  const [view] = useState<"list" | "board">("list");

  return <TasksWorkspace initialView={view} tasks={MOCK_TASKS} />;
}
