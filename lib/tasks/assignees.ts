import { getUserInitials, getUserListPrimaryLabel, normalizeUserFields } from "@/lib/user/display";
import type { TaskAssigneeRecord } from "@/types/tasks";
import type { TaskAssigneeView } from "@/lib/tasks/task-board";

export function assigneesFromRecords(records: TaskAssigneeRecord[]): TaskAssigneeView[] {
  return records
    .filter((r) => r.status === "ACTIVE")
    .map((r) => {
      const user = r.assignee;
      if (!user) {
        return { userId: r.user_id, name: "Member", initials: "?", completedAt: r.completed_at };
      }
      const normalized = normalizeUserFields({
        email: user.email ?? "",
        first_name: user.first_name,
        last_name: user.last_name,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      return {
        userId: r.user_id,
        name: getUserListPrimaryLabel({ ...normalized, email: user.email ?? "" }),
        initials: getUserInitials({ ...normalized, email: user.email ?? "" }),
        completedAt: r.completed_at,
      };
    });
}
