"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { SAMPLE_TASKS } from "@/lib/projects/mock-consultation";
import { TEAM_MEMBERS } from "@/lib/projects/mock-projects";
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
}: {
  project: ActiveProjectView;
  mode: ModeType;
  onBack: () => void;
  onConvertToPaid: () => void;
}) {
  const [tasks, setTasks] = useState<ConsultTask[]>(SAMPLE_TASKS);
  const [notes, setNotes] = useState("");
  const [dateVal, setDateVal] = useState("2026-07-24");
  const [timeVal, setTimeVal] = useState("10:00");
  const [completing, setCompleting] = useState(false);

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => setCompleting(false), 1200);
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
            <input type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--figma-navy)]">Time</label>
            <input type="time" value={timeVal} onChange={(e) => setTimeVal(e.target.value)} className={inputClass} />
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
            <button
              type="button"
              onClick={() =>
                setTasks((p) => [...p, { id: Date.now(), title: "New task", assigneeId: 1, status: "Pending" }])
              }
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-xs font-semibold text-[var(--figma-teal)]"
            >
              <MaterialIcon name="add" outlined size={15} />
              Add Task
            </button>
          }
        />
        <div className="flex flex-col">
          {tasks.map((task, idx) => {
            const m = TEAM_MEMBERS.find((t) => t.id === task.assigneeId);
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
        <NeuTextarea value={notes} onChange={setNotes} placeholder="Add consultation notes here… (optional)" rows={4} />
      </SectionCard>

      <div className="flex flex-wrap items-center gap-3">
        <GradientBtn
          label={completing ? "Marked Complete!" : "Mark Consultation Complete"}
          icon={completing ? "check" : "check_circle"}
          onClick={handleComplete}
        />
        <OutlineBtn label="Convert to Paid Consultation" icon="upgrade" onClick={onConvertToPaid} color="var(--figma-navy)" />
      </div>
    </div>
  );
}
