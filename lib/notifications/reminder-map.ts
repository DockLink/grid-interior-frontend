import type { MyReminder } from "@/types/clients";
import type { FollowUpReminderNotification } from "@/types/notifications";

export function reminderToNotification(row: MyReminder): FollowUpReminderNotification {
  const company = row.company?.trim() || null;
  const followUpDate = row.follow_up_date ?? "";
  return {
    type: "follow_up_reminder",
    id: row.id,
    key: `follow-up:${row.id}:${followUpDate}`,
    title: row.overdue ? "Follow-up overdue" : "Follow-up reminder",
    body: company ? `${row.name} · ${company}` : row.name,
    requesterName: row.name,
    createdAt: followUpDate || new Date(0).toISOString(),
    actionable: false,
    clientId: row.id,
    clientName: row.name,
    company,
    followUpDate,
    overdue: row.overdue === true,
  };
}
