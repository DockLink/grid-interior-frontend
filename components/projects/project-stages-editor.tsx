"use client";

import { useMemo, useState } from "react";
import { Check, Layers, Pencil, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { mapStageToView } from "@/lib/projects/map-stages";
import { resolveTaskEndDateIso } from "@/lib/tasks/task-dates";
import type { CreateTaskRequest, Task } from "@/types/tasks";

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function ProjectStagesEditor({
  projectId,
  onUpdated,
}: {
  projectId: string;
  onUpdated?: () => void | Promise<void>;
}) {
  const {
    tasks: stages,
    refetch: refetchStages,
    createTaskable,
    updateTaskable,
    updateTaskableDates,
    setTaskableStatus,
    reopenTaskable,
  } = useProjectTaskables(projectId, "STAGE");

  const [newStageName, setNewStageName] = useState("");
  const [newStageStart, setNewStageStart] = useState("");
  const [newStageEnd, setNewStageEnd] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  const stageById = useMemo(() => {
    const map = new Map<string, Task>();
    for (const stage of stages) map.set(stage.id, stage);
    return map;
  }, [stages]);

  const stageViews = useMemo(
    () => stages.map((s) => mapStageToView(s)).sort((a, b) => a.order - b.order),
    [stages],
  );

  const completedCount = stageViews.filter((s) => s.isCompleted).length;

  async function notifyUpdated() {
    await refetchStages();
    await onUpdated?.();
  }

  async function handleMarkComplete(stageId: string) {
    setBusyId(stageId);
    try {
      await setTaskableStatus(stageId, "COMPLETED");
      await notifyUpdated();
      toast.success("Stage marked complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update stage");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReopen(stageId: string) {
    setBusyId(stageId);
    try {
      await reopenTaskable(stageId);
      await notifyUpdated();
      toast.success("Stage reopened");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reopen stage");
    } finally {
      setBusyId(null);
    }
  }

  function beginEdit(stageId: string) {
    const stage = stageById.get(stageId);
    if (!stage) return;
    setEditingId(stageId);
    setEditName(stage.title);
    setEditStart(toDateInput(stage.start_date));
    setEditEnd(toDateInput(resolveTaskEndDateIso(stage)));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditStart("");
    setEditEnd("");
  }

  async function handleSaveEdit(stageId: string) {
    const stage = stageById.get(stageId);
    if (!stage) return;
    if (!editName.trim() || !editStart || !editEnd) {
      toast.error("Stage name, start and end dates are required");
      return;
    }
    if (new Date(editEnd) < new Date(editStart)) {
      toast.error("End date must be on or after the start date");
      return;
    }

    setIsEditSaving(true);
    try {
      if (editName.trim() !== stage.title) {
        await updateTaskable(stageId, { title: editName.trim() });
      }
      const currentStart = toDateInput(stage.start_date);
      const currentEnd = toDateInput(resolveTaskEndDateIso(stage));
      if (editStart !== currentStart || editEnd !== currentEnd) {
        await updateTaskableDates(
          stageId,
          new Date(`${editStart}T00:00:00`).toISOString(),
          new Date(`${editEnd}T23:59:59`).toISOString(),
        );
      }
      await notifyUpdated();
      cancelEdit();
      toast.success("Stage updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update stage");
    } finally {
      setIsEditSaving(false);
    }
  }

  async function handleCreateStage() {
    if (!newStageName.trim() || !newStageStart || !newStageEnd) return;
    if (new Date(newStageEnd) < new Date(newStageStart)) {
      toast.error("End date must be on or after the start date");
      return;
    }
    setIsCreating(true);
    try {
      const payload: CreateTaskRequest & { end_date: string } = {
        project_id: projectId,
        title: newStageName.trim(),
        start_date: new Date(newStageStart).toISOString(),
        end_date: new Date(newStageEnd + "T23:59:59").toISOString(),
        taskable_type: "STAGE",
        order: stages.length,
      };
      await createTaskable(payload);
      await notifyUpdated();
      setNewStageName("");
      setNewStageStart("");
      setNewStageEnd("");
      toast.success("Stage created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create stage");
    } finally {
      setIsCreating(false);
    }
  }

  const canCreate =
    !!newStageName.trim() && !!newStageStart && !!newStageEnd && !isCreating;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-[var(--figma-teal)]" />
          <span className="text-[13px] font-semibold text-[var(--figma-navy)]">Timeline stages</span>
        </div>
        <span className="text-[11px] text-[var(--figma-gray500)]">
          {stageViews.length} stage{stageViews.length === 1 ? "" : "s"}
          {completedCount > 0 ? ` · ${completedCount} complete` : ""}
        </span>
      </div>

      <p className="text-[12px] leading-relaxed text-[var(--figma-gray500)]">
        Edit stage names and dates, mark stages complete, or add new phases to the project timeline.
      </p>

      {stageViews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] px-4 py-6 text-center">
          <p className="text-[13px] font-medium text-[var(--figma-gray500)]">No stages yet</p>
          <p className="text-[12px] text-[var(--figma-gray500)]">Add your first stage below.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stageViews.map((stage, index) => {
            const isEditing = editingId === stage.id;
            return (
              <div
                key={stage.id}
                className="rounded-[14px] border border-[var(--figma-border)] bg-white px-3.5 py-3 neu-raised"
              >
                {isEditing ? (
                  <div className="space-y-2.5">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="hub-input-focus h-9 w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
                      placeholder="Stage name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="hub-input-focus h-9 w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
                      />
                      <input
                        type="date"
                        value={editEnd}
                        min={editStart || undefined}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="hub-input-focus h-9 w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={isEditSaving}
                        className="rounded-[20px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-1.5 text-[12px] text-[var(--figma-gray500)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSaveEdit(stage.id)}
                        disabled={isEditSaving}
                        className="gi-gradient-cta rounded-[20px] px-4 py-1.5 text-[12px] font-semibold"
                      >
                        {isEditSaving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                          stage.isCompleted
                            ? "bg-[var(--figma-success)] text-white"
                            : "bg-[rgba(14,124,134,0.12)] text-[var(--figma-teal)]"
                        }`}
                      >
                        {stage.isCompleted ? <Check size={14} /> : index + 1}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`truncate text-[13.5px] font-medium ${
                            stage.isCompleted ? "text-[var(--figma-success)]" : "text-[var(--figma-navy)]"
                          }`}
                        >
                          {stage.name}
                        </div>
                        <div className="text-[11.5px] text-[var(--figma-gray500)]">
                          {new Date(stage.startDate).toLocaleDateString()} –{" "}
                          {new Date(stage.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        title="Edit stage"
                        onClick={() => beginEdit(stage.id)}
                        disabled={busyId === stage.id}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--figma-border)] text-[var(--figma-gray500)] hover:bg-[var(--figma-gray50)]"
                      >
                        <Pencil size={13} />
                      </button>
                      {stage.isCompleted ? (
                        <button
                          type="button"
                          onClick={() => void handleReopen(stage.id)}
                          disabled={busyId === stage.id}
                          title="Reopen stage"
                          className="flex items-center gap-1 rounded-lg border border-[var(--figma-border)] px-2 py-1.5 text-[11px] font-medium text-[var(--figma-gray500)] hover:bg-[var(--figma-gray50)] disabled:opacity-50"
                        >
                          <RotateCcw size={12} /> Reopen
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleMarkComplete(stage.id)}
                          disabled={busyId === stage.id}
                          title="Mark stage complete"
                          className="flex items-center gap-1 rounded-lg border border-[var(--figma-success)]/30 bg-[var(--figma-success)]/8 px-2 py-1.5 text-[11px] font-medium text-[var(--figma-success)] hover:bg-[var(--figma-success)]/15 disabled:opacity-50"
                        >
                          <Check size={12} /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-[14px] border border-[var(--figma-border)] bg-[var(--figma-gray50)] p-3.5">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--figma-gray500)]">
          Add stage
        </div>
        <input
          placeholder="Stage name"
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          className="hub-input-focus mb-2 h-9 w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
        />
        <div className="mb-2.5 grid grid-cols-2 gap-2">
          <input
            type="date"
            value={newStageStart}
            onChange={(e) => setNewStageStart(e.target.value)}
            className="hub-input-focus h-9 w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
          />
          <input
            type="date"
            value={newStageEnd}
            min={newStageStart || undefined}
            onChange={(e) => setNewStageEnd(e.target.value)}
            className="hub-input-focus h-9 w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleCreateStage()}
          disabled={!canCreate}
          className="gi-gradient-cta flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[24px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={15} />
          {isCreating ? "Creating…" : "Add stage"}
        </button>
      </div>
    </div>
  );
}
