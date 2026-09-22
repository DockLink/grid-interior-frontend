import { formatFileDate } from "@/lib/files/format";
import { isTaskCompleted } from "@/lib/projects/map-stages";
import { getUserListPrimaryLabel } from "@/lib/user/display";
import type { HubActivityItem } from "@/types/project-hub";
import type { ProjectFile } from "@/types/files";
import type { ProjectMember } from "@/types/projects";
import type { Task, TaskableStatus } from "@/types/tasks";

type ActivityCandidate = HubActivityItem & { sortAt: number };

const ACTIVITY_LIMIT = 6;

function nameFromMembers(
  userId: string | null | undefined,
  members: ProjectMember[],
  nameByUserId?: Record<string, string>,
): string | null {
  if (!userId) return null;
  if (nameByUserId?.[userId]) return nameByUserId[userId];
  const member = members.find((m) => m.user_id === userId);
  const assignee = member?.assignee;
  if (!assignee) return null;
  return getUserListPrimaryLabel({
    email: assignee.email ?? "",
    first_name: assignee.first_name ?? assignee.firstName,
    last_name: assignee.last_name ?? assignee.lastName,
  });
}

function taskActivityText(task: Pick<Task, "title" | "status">): string {
  const title = task.title?.trim() || "Untitled task";
  const status = task.status as TaskableStatus;
  if (isTaskCompleted(status)) return `Task "${title}" marked complete`;
  if (status === "IN_REVIEW") return `Task "${title}" submitted for review`;
  if (status === "IN_PROGRESS") return `Task "${title}" marked in progress`;
  if (status === "ON_HOLD") return `Task "${title}" put on hold`;
  if (status === "REOPENED") return `Task "${title}" reopened`;
  return `Task "${title}" updated`;
}

function taskActivityIcon(status: TaskableStatus | string): Pick<HubActivityItem, "icon" | "iconColor"> {
  if (isTaskCompleted(status)) return { icon: "task_alt", iconColor: "#3FA66B" };
  if (status === "IN_REVIEW") return { icon: "rate_review", iconColor: "#7C3AED" };
  if (status === "ON_HOLD") return { icon: "pause_circle", iconColor: "#D97706" };
  if (status === "REOPENED") return { icon: "restart_alt", iconColor: "#0284C7" };
  return { icon: "assignment", iconColor: "#0E7C86" };
}

function fileActivityText(
  file: ProjectFile,
  uploaderName: string | null,
): string {
  const name = file.fileName?.trim() || "Untitled file";
  const by = uploaderName ? ` by ${uploaderName}` : "";
  if (file.version > 1) return `"${name}" v${file.version} uploaded${by}`;
  return `"${name}" uploaded${by}`;
}

function activityFromFiles(
  files: ProjectFile[],
  members: ProjectMember[],
  nameByUserId?: Record<string, string>,
): ActivityCandidate[] {
  return files
    .filter((f) => f.id && !f.deletedAt)
    .map((file) => {
      const iso = file.created_at || file.updated_at;
      const uploader = nameFromMembers(file.uploadedById, members, nameByUserId);
      return {
        icon: "upload_file",
        iconColor: "#0E7C86",
        text: fileActivityText(file, uploader),
        time: formatFileDate(iso),
        sortAt: new Date(iso).getTime() || 0,
      };
    });
}

function flattenTasks(tasks: Task[]): Task[] {
  const out: Task[] = [];
  for (const task of tasks) {
    out.push(task);
    const nested = task.subtasks ?? task.children;
    if (nested?.length) out.push(...flattenTasks(nested));
  }
  return out;
}

function activityFromTasks(tasks: Task[]): ActivityCandidate[] {
  return flattenTasks(tasks)
    .filter((t) => Boolean(t.updated_at || t.created_at))
    .map((task) => {
      const iso = task.updated_at || task.created_at || "";
      const icon = taskActivityIcon(task.status);
      return {
        ...icon,
        text: taskActivityText(task),
        time: formatFileDate(iso),
        sortAt: new Date(iso).getTime() || 0,
      };
    });
}

/** Build newest-first overview activity from files + task updates. */
export function buildProjectOverviewActivity(input: {
  files?: ProjectFile[];
  tasks?: Task[];
  members?: ProjectMember[];
  nameByUserId?: Record<string, string>;
  limit?: number;
}): HubActivityItem[] {
  const members = input.members ?? [];
  const candidates = [
    ...activityFromFiles(input.files ?? [], members, input.nameByUserId),
    ...activityFromTasks(input.tasks ?? []),
  ]
    .filter((c) => Number.isFinite(c.sortAt) && c.sortAt > 0)
    .sort((a, b) => b.sortAt - a.sortAt)
    .slice(0, input.limit ?? ACTIVITY_LIMIT);

  return candidates.map(({ icon, iconColor, text, time }) => ({
    icon,
    iconColor,
    text,
    time,
  }));
}
