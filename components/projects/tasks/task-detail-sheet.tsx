"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { hubInputClass, hubSectionLabelClass } from "@/components/projects/hub/hub-modal";
import { TaskHoldRequestDialog } from "@/components/projects/tasks/task-hold-request-dialog";
import { useTaskHoldRequests } from "@/hooks/use-task-hold-requests";
import { useTaskSubtasks } from "@/hooks/use-task-subtasks";
import {
  formatHoldDate,
  holdRequestStatusLabel,
  holdRequestStatusStyle,
} from "@/lib/hold-requests/display";
import {
  BOARD_COLUMNS,
  PRIORITY_DOT,
  dueDateColor,
  formatBoardDate,
  type BoardColumnId,
  type ProjectTaskView,
} from "@/lib/tasks/task-board";
import { cn } from "@/lib/utils";
import type { User } from "@/types/users";

import { TaskUserAvatar } from "./task-user-avatar";

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  canManage,
  currentUserId,
  members,
  stageRange,
  onUpdateAssignees,
  onMarkMyCompletion,
  onUpdateStatus,
  onReopen,
}: {
  task: ProjectTaskView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
  currentUserId?: string;
  members: User[];
  stageRange?: { start: string; end: string } | null;
  onUpdateAssignees: (taskId: string, userIds: string[]) => Promise<unknown>;
  onMarkMyCompletion?: (taskId: string, completed: boolean) => Promise<void>;
  onUpdateStatus?: (taskId: string, status: BoardColumnId) => Promise<void>;
  onReopen?: (taskId: string) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [localStatus, setLocalStatus] = useState<BoardColumnId | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskAssignees, setNewSubtaskAssignees] = useState<string[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [busySubtaskId, setBusySubtaskId] = useState<string | null>(null);

  const {
    holds,
    pendingHold,
    isLoading: holdsLoading,
    createHoldRequest,
  } = useTaskHoldRequests(task?.id ?? null, open);

  const {
    subtasks,
    isLoading: subtasksLoading,
    createSubtask,
    markSubtaskMyCompletion,
  } = useTaskSubtasks(task, open);

  useEffect(() => {
    setLocalStatus(null);
  }, [task?.id]);

  if (!task || !open) return null;

  const effectiveStatus: BoardColumnId = localStatus ?? task.status;
  const subtaskDoneCount = subtasks.filter((s) => s.apiStatus === "COMPLETED").length;

  async function handleStatusChange(next: BoardColumnId) {
    if (!onUpdateStatus || next === effectiveStatus) return;
    setIsUpdatingStatus(true);
    setLocalStatus(next);
    try {
      await onUpdateStatus(task!.id, next);
      toast.success("Status updated");
    } catch (err) {
      setLocalStatus(null);
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleReopen() {
    if (!onReopen) return;
    setIsReopening(true);
    try {
      await onReopen(task!.id);
      setLocalStatus("in-progress");
      toast.success("Task reopened — assignees can resume work");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reopen task");
    } finally {
      setIsReopening(false);
    }
  }

  async function handleAddSubtask() {
    if (!newSubtaskTitle.trim()) return;
    setIsAddingSubtask(true);
    try {
      await createSubtask({ title: newSubtaskTitle, assigneeUserIds: newSubtaskAssignees });
      setNewSubtaskTitle("");
      setNewSubtaskAssignees([]);
      toast.success("Subtask added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add subtask");
    } finally {
      setIsAddingSubtask(false);
    }
  }

  async function handleSubtaskMyCompletion(subtaskId: string, completed: boolean) {
    setBusySubtaskId(subtaskId);
    try {
      await markSubtaskMyCompletion(subtaskId, completed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update subtask");
    } finally {
      setBusySubtaskId(null);
    }
  }

  function toggleNewSubtaskAssignee(userId: string) {
    setNewSubtaskAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  const isAssigned = currentUserId
    ? task.assignees.some((a) => a.userId === currentUserId)
    : false;
  const myRecord = task.assignees.find((a) => a.userId === currentUserId);
  const iHaveCompleted = !!myRecord?.completedAt;

  const canRequestHold = isAssigned && !pendingHold && effectiveStatus !== "done";
  const canChangeStatus = !!onUpdateStatus && (canManage || isAssigned);

  const completedCount = task.assignees.filter((a) => a.completedAt).length;
  const totalCount = task.assignees.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  async function toggleAssignee(userId: string) {
    if (!canManage) return;
    const exists = task!.assignees.some((a) => a.userId === userId);
    const next = exists
      ? task!.assignees.filter((a) => a.userId !== userId).map((a) => a.userId)
      : [...task!.assignees.map((a) => a.userId), userId];
    if (next.length === 0) {
      toast.error("Task must have at least one assignee");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdateAssignees(task!.id, next);
      toast.success("Assignees updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update assignees");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMarkDone() {
    if (!onMarkMyCompletion) return;
    setIsSaving(true);
    try {
      await onMarkMyCompletion(task!.id, !iHaveCompleted);
      toast.success(iHaveCompleted ? "Marked as incomplete" : "Marked as done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update completion");
    } finally {
      setIsSaving(false);
    }
  }

  const column = BOARD_COLUMNS.find((c) => c.id === effectiveStatus)!;

  return (
    <>
      <div className="fixed inset-0 z-[200]">
        <button
          type="button"
          aria-label="Close sheet"
          className="absolute inset-0 backdrop-blur-[2px]"
          style={{ background: "rgba(27,42,74,0.18)" }}
          onClick={() => onOpenChange(false)}
        />
        <aside
          className="fixed top-0 right-0 flex h-svh w-full max-w-md flex-col border-l border-[var(--figma-border)] bg-white"
          style={{ boxShadow: "var(--neu-dropdown)" }}
          role="dialog"
          aria-modal
          aria-labelledby="task-detail-title"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[var(--figma-border)] px-5 py-4">
            <div className="min-w-0 pr-2">
              <h2
                id="task-detail-title"
                className="m-0 text-[17px] font-bold leading-snug text-[var(--figma-navy)]"
              >
                {task.title}
              </h2>
              {(task.stageName || task.milestoneName) && (
                <p className="mt-1 mb-0 text-[12px] text-[var(--figma-gray500)]">
                  {[task.stageName, task.milestoneName].filter(Boolean).join(" → ")}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
              aria-label="Close"
            >
              <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
            {task.description && (
              <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: PRIORITY_DOT[task.priority] }} />
              <span
                className="rounded-[10px] px-2.5 py-0.5 text-[11px] font-semibold"
                style={{
                  color: column.accent,
                  background: "var(--figma-gray100)",
                }}
              >
                {column.label}
              </span>
              <span
                className="text-[13px] font-medium"
                style={{ color: dueDateColor(task.dueDate, effectiveStatus) }}
              >
                Due {formatBoardDate(task.dueDate)}
              </span>
            </div>

            {canManage && effectiveStatus === "done" && onReopen && (
              <div className="rounded-[14px] border border-[var(--figma-border)] bg-[var(--figma-gray50)] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="m-0 text-[13px] font-semibold text-[var(--figma-navy)]">
                      This task is completed
                    </p>
                    <p className="mt-1 mb-0 text-[12px] text-[var(--figma-gray500)]">
                      Reopen it to let assignees redo their work. Parent milestone/stage will reopen
                      too.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isReopening}
                    onClick={() => void handleReopen()}
                    className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-[20px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 text-[12px] font-semibold text-[var(--figma-navy)] neu-raised disabled:opacity-60"
                  >
                    <MaterialIcon name="replay" outlined size={14} />
                    {isReopening ? "Reopening…" : "Reopen"}
                  </button>
                </div>
              </div>
            )}

            {canChangeStatus && (
              <div>
                <span className={cn(hubSectionLabelClass, "mb-2 block")}>Status</span>
                <div
                  className="inline-flex gap-0.5 rounded-[14px] p-1 neu-inset"
                  style={{ background: "var(--figma-gray100)" }}
                >
                  {BOARD_COLUMNS.map((c) => {
                    const active = effectiveStatus === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => void handleStatusChange(c.id)}
                        className="h-8 cursor-pointer rounded-[10px] border-none px-3 text-[13px] transition-all disabled:opacity-60"
                        style={{
                          background: active ? "#fff" : "transparent",
                          color: active ? c.accent : "var(--figma-gray500)",
                          fontWeight: active ? 600 : 400,
                          boxShadow: active ? "var(--neu-raised)" : "none",
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={hubSectionLabelClass}>
                  Assignees · {completedCount}/{totalCount} done
                </span>
                {isAssigned && effectiveStatus !== "done" && onMarkMyCompletion && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleMarkDone()}
                    className={cn(
                      "inline-flex h-7 cursor-pointer items-center gap-1 rounded-[20px] px-3 text-[11px] font-semibold transition-all disabled:opacity-60",
                      iHaveCompleted
                        ? "border-[1.5px] border-[var(--figma-border)] bg-white text-[var(--figma-gray500)]"
                        : "gi-gradient-cta",
                    )}
                  >
                    <MaterialIcon name="check" size={13} />
                    {iHaveCompleted ? "Undo my done" : "Mark my part done"}
                  </button>
                )}
              </div>

              {totalCount > 0 && (
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--figma-gray100)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressPct}%`,
                      background:
                        progressPct === 100 ? "var(--figma-success)" : "var(--figma-teal)",
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                {members.map((m) => {
                  const assigneeView = task.assignees.find((a) => a.userId === m.id);
                  const selected = !!assigneeView;
                  const done = !!assigneeView?.completedAt;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!canManage || isSaving}
                      onClick={() => void toggleAssignee(m.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-[12px] border px-3 py-2 text-left transition-all",
                        selected
                          ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)]"
                          : "border-[var(--figma-border)] bg-white",
                        canManage && "cursor-pointer hover:border-[var(--figma-teal)]",
                      )}
                    >
                      <TaskUserAvatar
                        initials={`${m.first_name?.[0] ?? ""}${m.last_name?.[0] ?? ""}`}
                        size={24}
                      />
                      <span className="flex-1 text-[13px] font-medium text-[var(--figma-navy)]">
                        {m.first_name} {m.last_name}
                      </span>
                      {selected && (
                        <span
                          title={done ? "Completed" : "In progress"}
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full",
                            done ? "bg-[var(--figma-success)]" : "bg-[var(--figma-gray100)]",
                          )}
                        >
                          <MaterialIcon
                            name="check"
                            size={12}
                            className={done ? "text-white" : "text-[var(--figma-gray400)]"}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={hubSectionLabelClass}>Hold requests</span>
                {canRequestHold && (
                  <button
                    type="button"
                    className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[20px] border-[1.5px] border-[var(--figma-teal)] bg-white px-3 text-[11px] font-semibold text-[var(--figma-teal)] neu-raised"
                    onClick={() => setShowHoldDialog(true)}
                  >
                    <MaterialIcon name="pause_circle" outlined size={14} />
                    Request hold
                  </button>
                )}
              </div>

              {holdsLoading && (
                <p className="m-0 text-[12px] text-[var(--figma-gray500)]">Loading hold requests…</p>
              )}

              {!holdsLoading && pendingHold && (
                <div className="rounded-[12px] border border-[var(--figma-teal)]/30 bg-[rgba(14,124,134,0.08)] px-3 py-2.5">
                  <span
                    className="mb-1 inline-block rounded-[10px] px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: holdRequestStatusStyle(pendingHold.status).bg,
                      color: holdRequestStatusStyle(pendingHold.status).color,
                    }}
                  >
                    {holdRequestStatusLabel(pendingHold.status)}
                  </span>
                  <p className="m-0 text-[13px] text-[var(--figma-navy)]">{pendingHold.reason}</p>
                  <p className="mt-1 mb-0 text-[11px] text-[var(--figma-gray500)]">
                    {formatHoldDate(pendingHold.requestedStartDate)} –{" "}
                    {formatHoldDate(pendingHold.requestedEndDate)}
                  </p>
                </div>
              )}

              {!holdsLoading && !pendingHold && holds.length === 0 && (
                <p className="m-0 text-[12px] text-[var(--figma-gray500)]">
                  {isAssigned
                    ? "No hold requests for this task yet."
                    : "Hold requests can be submitted by assigned members."}
                </p>
              )}

              {!holdsLoading && holds.filter((h) => h.status !== "PENDING").length > 0 && (
                <div className="mt-2 space-y-2">
                  {holds
                    .filter((h) => h.status !== "PENDING")
                    .map((hold) => {
                      const style = holdRequestStatusStyle(hold.status);
                      return (
                        <div
                          key={hold.id}
                          className="rounded-[12px] border border-[var(--figma-border)] bg-[var(--figma-gray50)] px-3 py-2"
                        >
                          <span
                            className="mb-1 inline-block rounded-[10px] px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {holdRequestStatusLabel(hold.status)}
                          </span>
                          <p className="m-0 text-[13px] text-[var(--figma-gray500)]">{hold.reason}</p>
                          <p className="mt-1 mb-0 text-[11px] text-[var(--figma-gray500)]">
                            {formatHoldDate(hold.requestedStartDate)} –{" "}
                            {formatHoldDate(hold.requestedEndDate)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className={hubSectionLabelClass}>
                  Subtasks{" "}
                  {subtasks.length > 0
                    ? `· ${subtaskDoneCount}/${subtasks.length} done`
                    : "(optional)"}
                </span>
              </div>
              <p className="mb-2 text-[11px] text-[var(--figma-gray500)]">
                Subtasks are optional and can have their own assignees. When every subtask is
                completed, this task completes automatically.
              </p>

              {subtasksLoading && (
                <p className="m-0 text-[12px] text-[var(--figma-gray500)]">Loading subtasks…</p>
              )}

              {!subtasksLoading && subtasks.length > 0 && (
                <div className="mb-3 space-y-2">
                  {subtasks.map((st) => {
                    const myRec = st.assignees.find((a) => a.userId === currentUserId);
                    const iAmOnSubtask = !!myRec;
                    const iDidMyPart = !!myRec?.completedAt;
                    const done = st.apiStatus === "COMPLETED";
                    const doneAssignees = st.assignees.filter((a) => a.completedAt).length;
                    return (
                      <div
                        key={st.id}
                        className={cn(
                          "rounded-[12px] border px-3 py-2",
                          done
                            ? "border-[var(--figma-success)]/30 bg-[var(--figma-success)]/5"
                            : "border-[var(--figma-border)] bg-[var(--figma-gray50)]",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex size-4 shrink-0 items-center justify-center rounded-full",
                              done ? "bg-[var(--figma-success)]" : "bg-[var(--figma-gray100)]",
                            )}
                          >
                            <MaterialIcon
                              name="check"
                              size={10}
                              className={done ? "text-white" : "text-[var(--figma-gray400)]"}
                            />
                          </span>
                          <span
                            className={cn(
                              "flex-1 text-[13px]",
                              done
                                ? "text-[var(--figma-gray500)] line-through"
                                : "font-medium text-[var(--figma-navy)]",
                            )}
                          >
                            {st.title}
                          </span>
                          {st.assignees.length > 0 && (
                            <span className="text-[11px] text-[var(--figma-gray500)]">
                              {doneAssignees}/{st.assignees.length}
                            </span>
                          )}
                          <div className="flex -space-x-1.5">
                            {st.assignees.slice(0, 3).map((a) => (
                              <TaskUserAvatar key={a.userId} initials={a.initials} size={20} />
                            ))}
                          </div>
                        </div>
                        {iAmOnSubtask && !done && (
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              disabled={busySubtaskId === st.id}
                              onClick={() => void handleSubtaskMyCompletion(st.id, !iDidMyPart)}
                              className={cn(
                                "inline-flex h-6 cursor-pointer items-center gap-1 rounded-[16px] px-2.5 text-[11px] font-semibold disabled:opacity-60",
                                iDidMyPart
                                  ? "border border-[var(--figma-border)] bg-transparent text-[var(--figma-gray500)]"
                                  : "gi-gradient-cta",
                              )}
                            >
                              <MaterialIcon name="check" size={11} />
                              {iDidMyPart ? "Undo my part" : "Mark my part done"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {canManage && (
                <div className="space-y-2 rounded-[14px] border border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] p-3">
                  <input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="New subtask title"
                    className={cn(hubInputClass, "py-2")}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((m) => {
                      const selected = newSubtaskAssignees.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleNewSubtaskAssignee(m.id)}
                          className={cn(
                            "flex cursor-pointer items-center gap-1 rounded-[10px] border px-1.5 py-0.5 text-[11px]",
                            selected
                              ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)] text-[var(--figma-navy)]"
                              : "border-[var(--figma-border)] bg-white text-[var(--figma-gray500)]",
                          )}
                        >
                          <TaskUserAvatar
                            initials={`${m.first_name?.[0] ?? ""}${m.last_name?.[0] ?? ""}`}
                            size={14}
                          />
                          {m.first_name || m.email}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={!newSubtaskTitle.trim() || isAddingSubtask}
                    onClick={() => void handleAddSubtask()}
                    className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[20px] border-[1.5px] border-[var(--figma-teal)] bg-white px-3 text-[12px] font-semibold text-[var(--figma-teal)] neu-raised disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MaterialIcon name="add" outlined size={14} />
                    {isAddingSubtask ? "Adding…" : "Add subtask"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[var(--figma-border)] px-5 py-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full cursor-pointer rounded-[24px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 text-[13px] font-semibold text-[var(--figma-navy)] transition-all neu-raised hover:border-[var(--figma-teal)]"
            >
              Close
            </button>
          </div>
        </aside>
      </div>

      {showHoldDialog && (
        <TaskHoldRequestDialog
          open={showHoldDialog}
          onOpenChange={setShowHoldDialog}
          task={task}
          stageRange={stageRange}
          onSubmit={createHoldRequest}
        />
      )}
    </>
  );
}
