"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useConsultation } from "@/hooks/use-consultation";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { getApiErrorMessage } from "@/lib/api/handle-api-error";
import { toConsultTaskStatusApi } from "@/lib/consultation/map-consultation";
import { useHubTeam } from "@/lib/projects/hub-team-context";
import { findStageTaskable } from "@/lib/projects/seed-phases";
import type { ConsultTask, ConsultTaskUpdatePayload, ModeType } from "@/types/consultation";
import type { ActiveProjectView, HubTeamMember } from "@/types/project-hub";

import { ConsultHeader } from "./consult-header";
import {
  GradientBtn,
  ModeBadge,
  NeuTextarea,
  OutlineBtn,
  SectionCard,
  SectionTitle,
} from "./consultation-ui";

const TASK_STATUSES = ["Pending", "In Progress", "Done"] as const;

function taskDotColor(status: string) {
  if (status === "Done") return "#3FA66B";
  if (status === "In Progress") return "var(--figma-teal)";
  return "var(--figma-gray400)";
}

function displayTaskStatus(status: string) {
  if (status === "Done" || status === "In Progress") return status;
  return "Pending";
}

function readConsultationDateTime(projectId: string) {
  try {
    const saved = localStorage.getItem(`consultation-date-time-${projectId}`);
    if (!saved) return { d: "", t: "" };
    const parsed = JSON.parse(saved) as { d?: string; t?: string };
    return { d: parsed.d ?? "", t: parsed.t ?? "" };
  } catch {
    return { d: "", t: "" };
  }
}

function ConsultTaskRow({
  task,
  teamMembers,
  readOnly,
  showDivider,
  onSave,
}: {
  task: ConsultTask;
  teamMembers: HubTeamMember[];
  readOnly: boolean;
  showDivider: boolean;
  onSave: (payload: ConsultTaskUpdatePayload, local: Partial<ConsultTask>) => Promise<void>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const title = draft ?? task.title;
  const assignee = teamMembers.find((member) => member.userId && member.userId === String(task.assigneeId));
  const assignable = teamMembers.filter((member) => member.userId);
  const assigneeKnown = !task.assigneeId || assignable.some((member) => member.userId === task.assigneeId);
  const status = displayTaskStatus(task.status);

  const saveTitle = () => {
    const next = title.trim();
    if (!next || next === task.title || readOnly) {
      setDraft(null);
      return;
    }
    void onSave({ title: next }, { title: next }).finally(() => setDraft(null));
  };

  return (
    <div
      className="flex items-center gap-3 py-[11px]"
      style={{ borderBottom: showDivider ? "1px solid var(--figma-border)" : "none" }}
    >
      <div
        className="size-[7px] shrink-0 rounded-full"
        style={{ background: taskDotColor(status) }}
      />
      <input
        type="text"
        value={title}
        disabled={readOnly}
        aria-label="Task title"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={saveTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className="box-border min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-2.5 py-1.5 text-[13px] text-[var(--figma-navy)] outline-none disabled:cursor-not-allowed disabled:opacity-70"
      />
      {assignee ? (
        <div
          title={assignee.name}
          className="flex size-[26px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ background: assignee.color }}
        >
          {assignee.initials}
        </div>
      ) : (
        <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--figma-gray200)] text-[9px] font-bold text-[var(--figma-gray500)]">
          —
        </div>
      )}
      <select
        aria-label="Team member"
        value={task.assigneeId ?? ""}
        disabled={readOnly}
        onChange={(e) => {
          const assigneeId = e.target.value || null;
          if (assigneeId === (task.assigneeId ?? null)) return;
          onSave({ assignee_user_id: assigneeId }, { assigneeId });
        }}
        className="box-border max-w-[140px] rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-2 py-1.5 text-[12px] text-[var(--figma-navy)] outline-none disabled:cursor-not-allowed disabled:opacity-70"
      >
        <option value="">Unassigned</option>
        {!assigneeKnown && task.assigneeId ? (
          <option value={task.assigneeId}>Assigned member</option>
        ) : null}
        {assignable.map((member) => (
          <option key={member.userId} value={member.userId}>
            {member.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Task status"
        value={status}
        disabled={readOnly}
        onChange={(e) => {
          const next = e.target.value;
          if (next === status) return;
          onSave({ status: toConsultTaskStatusApi(next) }, { status: next });
        }}
        className="box-border rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-2 py-1.5 text-[12px] font-semibold text-[var(--figma-navy)] outline-none disabled:cursor-not-allowed disabled:opacity-70"
      >
        {TASK_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FreeConsultationRecord({
  project,
  mode,
  onBack,
  onConvertToPaid,
  readOnly = false,
}: {
  project: ActiveProjectView;
  mode: ModeType;
  onBack: () => void;
  onConvertToPaid: () => void;
  readOnly?: boolean;
}) {
  const teamMembers = useHubTeam();
  const {
    tasks: remoteTasks,
    createTask,
    updateTask,
    completeConsultation,
    isAuthOff,
  } = useConsultation(project.id);
  const {
    tasks: stages,
    isLoading: stagesLoading,
  } = useProjectTaskables(project.id, "STAGE", { limit: 100 });
  const consultationStage = findStageTaskable(stages, "Consultation");
  const stageCompleted = consultationStage?.status === "COMPLETED";

  const [tasks, setTasks] = useState<ConsultTask[]>(remoteTasks);
  const [tasksSource, setTasksSource] = useState(remoteTasks);
  const [notes, setNotes] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("");
  const [dateSourceId, setDateSourceId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);

  if (tasksSource !== remoteTasks) {
    const previousRemoteIds = new Set(tasksSource.map((task) => task.id));
    setTasksSource(remoteTasks);
    setTasks((current) => {
      const localOnly = current.filter((task) => !previousRemoteIds.has(task.id));
      const localIds = new Set(localOnly.map((task) => task.id));
      return [
        ...remoteTasks.filter((task) => !localIds.has(task.id)),
        ...localOnly,
      ];
    });
  }

  if (typeof window !== "undefined" && dateSourceId !== project.id) {
    const saved = readConsultationDateTime(project.id);
    setDateSourceId(project.id);
    setDateVal(saved.d);
    setTimeVal(saved.t);
  }

  useEffect(() => {
    if (dateVal || timeVal) {
      localStorage.setItem(
        `consultation-date-time-${project.id}`,
        JSON.stringify({ d: dateVal, t: timeVal }),
      );
    }
  }, [dateVal, timeVal, project.id]);

  const saveTask = async (
    task: ConsultTask,
    payload: ConsultTaskUpdatePayload,
    local: Partial<ConsultTask>,
  ) => {
    setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, ...local } : item)));
    try {
      await updateTask(task.id, payload);
    } catch (err) {
      setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
      toast.error(getApiErrorMessage(err) || "Failed to update task");
    }
  };

  const isComplete = stageCompleted || localCompleted;
  const completeDisabled =
    readOnly || completing || isComplete || (!isAuthOff && stagesLoading);

  const handleComplete = async () => {
    if (completeDisabled) return;
    setCompleting(true);
    try {
      const result = await completeConsultation({
        notes: notes.trim() || undefined,
        date: dateVal || undefined,
        time: timeVal || undefined,
        mode,
        consult_type: "free",
      });

      if (!result?.completed && result?.stage?.status !== "COMPLETED") {
        throw new Error("Consultation stage was not marked COMPLETED");
      }

      setLocalCompleted(true);
      setNotes("");
      toast.success("Consultation marked complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark consultation complete");
    } finally {
      setCompleting(false);
    }
  };

  const inputClass =
    "box-border w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-[9px] text-[13px] text-[var(--figma-navy)] outline-none neu-inset";

  return (
    <div className="max-w-[860px] px-10 py-8">
      <ConsultHeader project={project} consultType="free" mode={mode} onBack={onBack} showModeBadge />

      <SectionCard>
        <SectionTitle icon="event" title="Consultation Details" />
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--figma-navy)]">Date</label>
            <input
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className={inputClass}
              disabled={readOnly}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--figma-navy)]">Time</label>
            <input
              type="time"
              value={timeVal}
              onChange={(e) => setTimeVal(e.target.value)}
              className={inputClass}
              disabled={readOnly}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--figma-navy)]">Mode</label>
            <div className="flex h-10 items-center">
              <ModeBadge mode={mode} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle
          icon="task_alt"
          title="Task Updates"
          right={
            readOnly ? undefined : (
              <button
                type="button"
                onClick={() => {
                  void createTask({
                    title: "New task",
                    status: "pending",
                  })
                    .then((task) => {
                      if (!task) return;
                      setTasks((p) => (p.some((t) => t.id === task.id) ? p : [...p, task]));
                    })
                    .catch((err) => {
                      toast.error(getApiErrorMessage(err) || "Failed to add task");
                    });
                }}
                className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-xs font-semibold text-[var(--figma-teal)]"
              >
                <MaterialIcon name="add" outlined size={15} />
                Add Task
              </button>
            )
          }
        />
        <div className="flex flex-col">
          {tasks.map((task, idx) => (
            <ConsultTaskRow
              key={task.id}
              task={task}
              teamMembers={teamMembers}
              readOnly={readOnly}
              showDivider={idx < tasks.length - 1}
              onSave={(payload, local) => saveTask(task, payload, local)}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="sticky_note_2" title="Notes" />
        <NeuTextarea
          value={notes}
          onChange={setNotes}
          placeholder="Add consultation notes here… (optional)"
          rows={4}
          disabled={readOnly}
        />
      </SectionCard>

      <div className="flex flex-wrap items-center gap-3">
        <GradientBtn
          label={
            completing
              ? "Saving…"
              : isComplete
                ? "Consultation Complete"
                : "Mark Consultation Complete"
          }
          icon={isComplete ? "check" : "check_circle"}
          onClick={() => void handleComplete()}
          disabled={completeDisabled}
        />
        {!readOnly && (
          <OutlineBtn
            label="Convert to Paid Consultation"
            icon="upgrade"
            onClick={onConvertToPaid}
            color="var(--figma-navy)"
          />
        )}
      </div>
    </div>
  );
}
