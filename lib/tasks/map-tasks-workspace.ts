import type { MockPriority, MockTask, MockTaskStatus } from "@/lib/tasks/mock-tasks";
import type { ProjectTaskView } from "@/lib/tasks/task-board";
import type { TaskablePriority, TaskableStatus } from "@/types/tasks";

const PROJECT_COLORS = ["#0E7C86", "#0891B2", "#7C3AED", "#D97706", "#1B2A4A", "#BE185D"];

function hashStringToNumber(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function projectColorFromId(projectId: string): string {
  return PROJECT_COLORS[hashStringToNumber(projectId) % PROJECT_COLORS.length];
}

function mapPriority(priority: TaskablePriority): MockPriority {
  if (priority === "CRITICAL" || priority === "HIGH") return "high";
  if (priority === "LOW") return "low";
  return "medium";
}

function mapStatus(status: TaskableStatus): MockTaskStatus {
  if (status === "COMPLETED") return "done";
  if (status === "IN_REVIEW") return "review";
  if (status === "IN_PROGRESS" || status === "REOPENED") return "in-progress";
  return "todo";
}

function formatDisplayDate(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(dueIso: string, status: MockTaskStatus): boolean {
  if (status === "done") return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueIso < today;
}

export function mapProjectTaskViewToMockTask(
  view: ProjectTaskView,
  projectName: string,
): MockTask {
  const status = mapStatus(view.apiStatus);
  const firstAssignee = view.assignees[0];

  return {
    id: hashStringToNumber(view.id),
    title: view.title,
    project: projectName,
    projectColor: projectColorFromId(view.raw.projectId),
    priority: mapPriority(view.priority),
    dueDate: formatDisplayDate(view.dueDate),
    overdue: isOverdue(view.dueDate, status),
    status,
    assignee: firstAssignee
      ? {
          initials: firstAssignee.initials,
          color: projectColorFromId(firstAssignee.userId),
          name: firstAssignee.name,
        }
      : { initials: "?", color: "#9CA3AF", name: "Unassigned" },
    description: view.description,
    comments: [],
  };
}
