"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  HubField,
  HubModal,
  hubHintClass,
  hubInputClass,
  hubLabelClass,
  hubSelectClass,
} from "@/components/projects/hub/hub-modal";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  BOARD_COLUMNS,
  apiStatusFromBoard,
  formatBoardDate,
  type BoardColumnId,
} from "@/lib/tasks/task-board";
import type { ProjectMilestoneView, ProjectStageView } from "@/lib/projects/map-stages";
import { cn } from "@/lib/utils";
import type { TaskablePriority } from "@/types/tasks";
import type { User } from "@/types/users";

import { TaskUserAvatar } from "./task-user-avatar";

function memberLabel(m: User): string {
  return [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;
}

function memberInitials(m: User): string {
  return (
    `${m.first_name?.[0] ?? ""}${m.last_name?.[0] ?? ""}`.toUpperCase() ||
    (m.email[0]?.toUpperCase() ?? "?")
  );
}

function AssigneePicker({
  members,
  selectedIds,
  onChange,
  placeholder = "Add assignee…",
}: {
  members: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const available = members.filter((m) => !selectedIds.includes(m.id));
  const selected = members.filter((m) => selectedIds.includes(m.id));

  return (
    <div className="space-y-1.5">
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) onChange([...selectedIds, e.target.value]);
        }}
        disabled={available.length === 0}
        className={hubSelectClass}
      >
        <option value="">{available.length === 0 ? "All members added" : placeholder}</option>
        {available.map((m) => (
          <option key={m.id} value={m.id}>
            {memberLabel(m)}
          </option>
        ))}
      </select>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((m) => (
            <span
              key={m.id}
              className="flex items-center gap-1.5 rounded-[10px] border border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)] px-2 py-1 text-xs text-[var(--figma-navy)]"
            >
              <TaskUserAvatar initials={memberInitials(m)} size={16} />
              {memberLabel(m)}
              <button
                type="button"
                onClick={() => onChange(selectedIds.filter((id) => id !== m.id))}
                className="text-[var(--figma-gray500)] hover:text-[var(--figma-navy)]"
                aria-label={`Remove ${memberLabel(m)}`}
              >
                <MaterialIcon name="close" outlined size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface SubtaskDraft {
  title: string;
  assigneeIds: string[];
}

export function TaskCreateDialog({
  open,
  onOpenChange,
  defaultStatus,
  stages,
  milestones,
  milestoneParents,
  members,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: BoardColumnId;
  stages: ProjectStageView[];
  milestones: ProjectMilestoneView[];
  milestoneParents: Record<string, { stageId: string; stageName: string }>;
  members: User[];
  onCreate: (input: {
    title: string;
    description?: string;
    stageId?: string;
    milestoneId?: string;
    dueDate: string;
    priority: TaskablePriority;
    status: ReturnType<typeof apiStatusFromBoard>;
    assigneeUserIds: string[];
    subtasks?: { title: string; assigneeUserIds: string[] }[];
  }) => Promise<unknown>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");
  const [milestoneId, setMilestoneId] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<TaskablePriority>("MEDIUM");
  const [status, setStatus] = useState<BoardColumnId>(defaultStatus);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const stageMilestones = useMemo(
    () => milestones.filter((m) => milestoneParents[m.id]?.stageId === stageId),
    [milestones, milestoneParents, stageId],
  );

  const selectedMilestone = useMemo(
    () => milestones.find((m) => m.id === milestoneId),
    [milestones, milestoneId],
  );
  const selectedStage = useMemo(() => stages.find((s) => s.id === stageId), [stages, stageId]);

  const rangeStart = selectedMilestone
    ? selectedMilestone.startDate.slice(0, 10)
    : selectedStage
      ? selectedStage.startDate.slice(0, 10)
      : undefined;
  const rangeEnd = selectedMilestone
    ? selectedMilestone.endDate.slice(0, 10)
    : selectedStage
      ? selectedStage.endDate.slice(0, 10)
      : undefined;
  const rangeLabel = selectedMilestone ? "milestone" : "stage";

  useEffect(() => {
    if (rangeStart && dueDate < rangeStart) setDueDate(rangeStart);
    else if (rangeEnd && dueDate > rangeEnd) setDueDate(rangeEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    if (open) setStatus(defaultStatus);
  }, [open, defaultStatus]);

  function addSubtaskRow() {
    setSubtasks((prev) => [...prev, { title: "", assigneeIds: [] }]);
  }

  function updateSubtask(index: number, patch: Partial<SubtaskDraft>) {
    setSubtasks((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSubtask(index: number) {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setAssigneeIds([]);
    setSubtasks([]);
  }

  function handleClose() {
    onOpenChange(false);
  }

  async function submit() {
    if (!title.trim()) return;
    if (rangeStart && rangeEnd && (dueDate < rangeStart || dueDate > rangeEnd)) {
      toast.error(
        `Task due date must fall within the ${rangeLabel} period (${formatBoardDate(rangeStart)} – ${formatBoardDate(rangeEnd)})`,
      );
      return;
    }
    setIsSaving(true);
    try {
      await onCreate({
        title,
        description,
        stageId: stageId || undefined,
        milestoneId: milestoneId || undefined,
        dueDate,
        priority,
        status: apiStatusFromBoard(status),
        assigneeUserIds: assigneeIds,
        subtasks: subtasks
          .filter((s) => s.title.trim())
          .map((s) => ({ title: s.title, assigneeUserIds: s.assigneeIds })),
      });
      toast.success("Task created");
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  return (
    <HubModal
      onClose={handleClose}
      title="New task"
      subtitle="Add a task to this project's board"
      icon="add_task"
      maxWidth={560}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-2 font-[inherit] text-[13px] text-[var(--figma-gray500)] transition-colors hover:text-[var(--figma-navy)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!title.trim() || isSaving}
            className="gi-gradient-cta flex cursor-pointer items-center gap-2 rounded-[24px] px-7 py-[11px] text-sm font-semibold disabled:cursor-default disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                Creating…
              </>
            ) : (
              <>
                <MaterialIcon name="add" outlined size={16} />
                Add task
              </>
            )}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-[18px] pr-1">
        <HubField label="Title">
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Prepare concept mood boards"
            className={hubInputClass}
          />
        </HubField>

        <HubField label="Description">
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional details…"
            className={cn(hubInputClass, "resize-y leading-relaxed")}
          />
        </HubField>

        <div className="grid grid-cols-2 gap-3">
          <HubField label="Stage">
            <select
              value={stageId}
              onChange={(e) => {
                setStageId(e.target.value);
                setMilestoneId("");
              }}
              className={hubSelectClass}
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </HubField>
          <HubField
            label="Milestone"
            hint={
              stageMilestones.length === 0
                ? "No milestones in this stage. Add them in Manage Milestones."
                : undefined
            }
          >
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className={hubSelectClass}
              disabled={stageMilestones.length === 0}
            >
              <option value="">
                {stageMilestones.length === 0 ? "None — attach to stage" : "Optional"}
              </option>
              {stageMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </HubField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <HubField
            label="Due date"
            hint={
              rangeStart && rangeEnd
                ? `Within ${rangeLabel}: ${formatBoardDate(rangeStart)} – ${formatBoardDate(rangeEnd)}`
                : undefined
            }
          >
            <input
              type="date"
              value={dueDate}
              min={rangeStart}
              max={rangeEnd}
              onChange={(e) => setDueDate(e.target.value)}
              className={hubInputClass}
            />
          </HubField>
          <HubField label="Column">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BoardColumnId)}
              className={hubSelectClass}
            >
              {BOARD_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </HubField>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={hubLabelClass}>Priority</span>
          <div
            className="inline-flex gap-0.5 rounded-[14px] p-1 neu-inset"
            style={{ background: "var(--figma-gray100)" }}
          >
            {(["LOW", "MEDIUM", "HIGH"] as TaskablePriority[]).map((p) => {
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="min-w-[64px] cursor-pointer rounded-[10px] border-none px-3 py-2 text-[13px] transition-all duration-180"
                  style={{
                    background: active ? "#fff" : "transparent",
                    color: active ? "var(--figma-navy)" : "var(--figma-gray500)",
                    fontWeight: active ? 600 : 400,
                    boxShadow: active ? "var(--neu-raised)" : "none",
                  }}
                >
                  {p[0] + p.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        <HubField label="Assignees">
          <AssigneePicker members={members} selectedIds={assigneeIds} onChange={setAssigneeIds} />
        </HubField>

        <div className="space-y-2 rounded-[14px] border border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className={hubLabelClass}>Subtasks (optional)</span>
            <button
              type="button"
              onClick={addSubtaskRow}
              className="inline-flex cursor-pointer items-center gap-1 rounded-[20px] border-[1.5px] border-[var(--figma-teal)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--figma-teal)] transition-all neu-raised"
            >
              <MaterialIcon name="add" outlined size={14} />
              Add subtask
            </button>
          </div>
          {subtasks.length === 0 ? (
            <p className={hubHintClass}>
              Break this task into subtasks. Each can have its own assignees; the task completes when
              all subtasks are done.
            </p>
          ) : (
            <div className="space-y-3">
              {subtasks.map((st, i) => (
                <div
                  key={i}
                  className="space-y-1.5 rounded-[12px] border border-[var(--figma-border)] bg-white p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      value={st.title}
                      placeholder={`Subtask ${i + 1} title`}
                      onChange={(e) => updateSubtask(i, { title: e.target.value })}
                      className={cn(hubInputClass, "py-2")}
                    />
                    <button
                      type="button"
                      onClick={() => removeSubtask(i)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--figma-gray500)] hover:bg-[var(--figma-gray100)] hover:text-[var(--figma-alert)]"
                      aria-label="Remove subtask"
                    >
                      <MaterialIcon name="close" outlined size={16} />
                    </button>
                  </div>
                  <AssigneePicker
                    members={members}
                    selectedIds={st.assigneeIds}
                    onChange={(ids) => updateSubtask(i, { assigneeIds: ids })}
                    placeholder="Assign subtask to…"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HubModal>
  );
}
