"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useConsultation } from "@/hooks/use-consultation";
import { useProjectTaskables } from "@/hooks/use-project-taskables";
import { useHubTeam } from "@/lib/projects/hub-team-context";
import { findStageTaskable } from "@/lib/projects/seed-phases";
import type { ConsultTask, ModeType } from "@/types/consultation";
import type { ActiveProjectView } from "@/types/project-hub";

import { ConsultHeader } from "./consult-header";
import {
  GradientBtn,
  ModeBadge,
  NeuTextarea,
  OutlineBtn,
  SectionCard,
  SectionTitle,
  TaskBadge,
} from "./consultation-ui";

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
  const [notes, setNotes] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("");
  const [completing, setCompleting] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`consultation-date-time-${project.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.d) setDateVal(parsed.d);
        if (parsed.t) setTimeVal(parsed.t);
      } catch {
        // ignore
      }
    }
  }, [project.id]);

  useEffect(() => {
    if (dateVal || timeVal) {
      localStorage.setItem(
        `consultation-date-time-${project.id}`,
        JSON.stringify({ d: dateVal, t: timeVal }),
      );
    }
  }, [dateVal, timeVal, project.id]);

  useEffect(() => {
    setTasks(remoteTasks);
  }, [remoteTasks]);

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
                    assignee_user_id: teamMembers[0] ? String(teamMembers[0].id) : "1",
                    status: "pending",
                  })
                    .then((task) => {
                      if (!task) return;
                      setTasks((p) => (p.some((t) => t.id === task.id) ? p : [...p, task]));
                    })
                    .catch((err) => {
                      toast.error(
                        err instanceof Error ? err.message : "Failed to add task",
                      );
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
          {tasks.map((task, idx) => {
            const m = teamMembers.find((t) => String(t.id) === String(task.assigneeId));
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 py-[11px]"
                style={{
                  borderBottom: idx < tasks.length - 1 ? "1px solid var(--figma-border)" : "none",
                }}
              >
                <div
                  className="size-[7px] shrink-0 rounded-full"
                  style={{
                    background:
                      task.status === "Done"
                        ? "#3FA66B"
                        : task.status === "In Progress"
                          ? "var(--figma-teal)"
                          : "var(--figma-gray400)",
                  }}
                />
                <span className="flex-1 text-[13px] text-[var(--figma-navy)]">{task.title}</span>
                {m && (
                  <div
                    title={m.name}
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: m.color }}
                  >
                    {m.initials}
                  </div>
                )}
                <TaskBadge status={task.status} />
              </div>
            );
          })}
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
