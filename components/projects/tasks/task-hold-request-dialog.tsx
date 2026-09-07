"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  HubField,
  HubModal,
  hubInputClass,
} from "@/components/projects/hub/hub-modal";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { formatBoardDate } from "@/lib/tasks/task-board";
import type { ProjectTaskView } from "@/lib/tasks/task-board";
import { cn } from "@/lib/utils";

function clampDate(dateIso: string, min: string, max: string): string {
  if (dateIso < min) return min;
  if (dateIso > max) return max;
  return dateIso;
}

function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function TaskHoldRequestDialog({
  open,
  onOpenChange,
  task,
  stageRange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProjectTaskView;
  stageRange?: { start: string; end: string } | null;
  onSubmit: (input: {
    taskId: string;
    reason: string;
    startDate: string;
    endDate: string;
    note?: string;
  }) => Promise<unknown>;
}) {
  const hasStage = Boolean(stageRange);
  const taskStart = stageRange ? stageRange.start.slice(0, 10) : task.startDate.slice(0, 10);
  const taskEnd = stageRange ? stageRange.end.slice(0, 10) : task.dueDate;
  const windowLabel = hasStage ? "stage" : "task";
  const today = new Date().toISOString().slice(0, 10);

  const defaultStart = useMemo(
    () => clampDate(today < taskStart ? taskStart : today, taskStart, taskEnd),
    [today, taskStart, taskEnd],
  );
  const defaultEnd = useMemo(() => {
    const suggested = addDays(defaultStart, 3);
    return clampDate(suggested < defaultStart ? addDays(defaultStart, 1) : suggested, taskStart, taskEnd);
  }, [defaultStart, taskStart, taskEnd]);

  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setNote("");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, [open, defaultStart, defaultEnd]);

  const canSubmit = Boolean(reason.trim() && startDate && endDate);

  async function handleSubmit() {
    if (!canSubmit) return;
    if (endDate < startDate) {
      toast.error("End date must be on or after the start date");
      return;
    }
    if (startDate < taskStart || startDate > taskEnd) {
      toast.error(
        `Hold must start within the ${windowLabel} period (${formatBoardDate(taskStart)} – ${formatBoardDate(taskEnd)})`,
      );
      return;
    }
    if (endDate > taskEnd) {
      toast.error(
        `Hold must end within the ${windowLabel} period (${formatBoardDate(taskStart)} – ${formatBoardDate(taskEnd)})`,
      );
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        taskId: task.id,
        reason: reason.trim(),
        startDate,
        endDate,
        note: note.trim() || undefined,
      });
      toast.success("Hold request submitted");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit hold request");
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  return (
    <HubModal
      onClose={() => onOpenChange(false)}
      title="Request task hold"
      subtitle={`Pause work on “${task.title}”`}
      icon="pause_circle"
      maxWidth={480}
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-2 font-[inherit] text-[13px] text-[var(--figma-gray500)] transition-colors hover:text-[var(--figma-navy)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSaving}
            onClick={() => void handleSubmit()}
            className="gi-gradient-cta flex cursor-pointer items-center gap-2 rounded-[24px] px-7 py-[11px] text-sm font-semibold disabled:cursor-default disabled:opacity-70"
          >
            {isSaving ? "Submitting…" : "Submit request"}
            {!isSaving && <MaterialIcon name="send" outlined size={16} />}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-[18px]">
        <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">
          The hold period must fall within the {windowLabel} window (
          {formatBoardDate(taskStart)} – {formatBoardDate(taskEnd)}).
        </p>

        <HubField label="Reason">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why does this task need to be on hold?"
            rows={3}
            className={cn(hubInputClass, "min-h-[72px] resize-none leading-relaxed")}
          />
        </HubField>

        <div className="grid grid-cols-2 gap-3">
          <HubField label="Hold starts">
            <input
              type="date"
              min={taskStart}
              max={taskEnd}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={hubInputClass}
            />
          </HubField>
          <HubField label="Hold ends">
            <input
              type="date"
              min={startDate || taskStart}
              max={taskEnd}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={hubInputClass}
            />
          </HubField>
        </div>

        <HubField label="Additional note (optional)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any extra context for the reviewer…"
            rows={2}
            className={cn(hubInputClass, "min-h-[56px] resize-none leading-relaxed")}
          />
        </HubField>
      </div>
    </HubModal>
  );
}
