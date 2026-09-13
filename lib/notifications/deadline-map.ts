import { resolveTaskEndDate } from "@/lib/tasks/task-dates";
import type { DeadlineAppNotification } from "@/types/notifications";
import type { Task, TaskAssigneeRecord } from "@/types/tasks";

const DUE_SOON_DAYS = 3;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Build in-app deadline alerts from tasks assigned to the current user.
 * Overdue + due within 3 days. No email — client-composed only.
 */
export function mapAssignedTasksToDeadlineNotifications(
  tasks: Task[],
  assigneeMap: Record<string, TaskAssigneeRecord[]>,
  projectNameMap: Record<string, string>,
  userId: string,
): DeadlineAppNotification[] {
  const today = startOfDay(new Date());
  const soonLimit = new Date(today);
  soonLimit.setDate(soonLimit.getDate() + DUE_SOON_DAYS);

  const out: DeadlineAppNotification[] = [];

  for (const task of tasks) {
    if (task.taskableType && task.taskableType !== "TASK") continue;
    if (task.status === "COMPLETED") continue;

    const assignees = assigneeMap[task.id] ?? [];
    const assignedToMe = assignees.some((r) => r.status === "ACTIVE" && r.user_id === userId);
    if (!assignedToMe) continue;

    const due = resolveTaskEndDate(task);
    if (Number.isNaN(due.getTime())) continue;
    const dueDay = startOfDay(due);

    let urgency: "overdue" | "due_soon" | null = null;
    if (dueDay < today) urgency = "overdue";
    else if (dueDay <= soonLimit) urgency = "due_soon";
    if (!urgency) continue;

    const projectId = task.projectId;
    const projectName = projectNameMap[projectId] ?? "Project";
    const dueLabel = due.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    out.push({
      id: `deadline-${task.id}`,
      key: `deadline:${urgency}:${task.id}`,
      type: "deadline_alert",
      title: urgency === "overdue" ? "Task overdue" : "Deadline approaching",
      body:
        urgency === "overdue"
          ? `"${task.title}" was due ${dueLabel}`
          : `"${task.title}" is due ${dueLabel}`,
      requesterName: urgency === "overdue" ? "Overdue" : "Due soon",
      createdAt: due.toISOString(),
      actionable: false,
      urgency,
      taskTitle: task.title,
      taskId: task.id,
      projectId,
      projectName,
      dueDate: due.toISOString(),
    });
  }

  return out;
}
