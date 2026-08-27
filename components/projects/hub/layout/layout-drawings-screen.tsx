"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { ClientConfirmationWidget } from "@/components/projects/hub/shared/client-confirmation-widget";
import { TimelineWidget } from "@/components/projects/hub/shared/timeline-widget";
import {
  AreaTabs,
  SectionCard,
  SectionTitle,
  UploadDropzone,
  WorkspaceBreadcrumb,
} from "@/components/projects/hub/shared/workspace-ui";
import {
  LAYOUT_ALL_AREA_ID,
  LAYOUT_AREAS,
  LAYOUT_INITIAL_DRAWINGS,
  LAYOUT_INITIAL_TASKS,
} from "@/lib/projects/mock-layout";
import { TEAM_MEMBERS } from "@/lib/projects/mock-projects";
import { cn } from "@/lib/utils";
import type { ActiveProjectView } from "@/types/project-hub";
import type { LayoutDrawingFile, LayoutTask, LayoutTaskStatus } from "@/types/layout";

const TYPE_CONFIG = {
  pdf: { icon: "picture_as_pdf", color: "#EF4444", bg: "#FEE2E2", label: "PDF" },
  dwg: { icon: "architecture", color: "var(--figma-navy)", bg: "var(--figma-gray100)", label: "DWG" },
  img: { icon: "image", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)", label: "IMG" },
} as const;

const STATUS_CFG: Record<LayoutTaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "var(--figma-gray400)", bg: "var(--figma-gray100)" },
  "in-progress": { label: "In Progress", color: "#D97706", bg: "#FEF3C7" },
  done: { label: "Done", color: "#3FA66B", bg: "#DCFCE7" },
};

function DrawingCard({ file, onDelete }: { file: LayoutDrawingFile; onDelete: () => void }) {
  const [hover, setHover] = useState(false);
  const cfg = TYPE_CONFIG[file.type];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="overflow-hidden rounded-[14px] bg-white transition-all duration-200"
      style={{
        boxShadow: hover ? "var(--neu-card-hover, var(--neu-card))" : "var(--neu-card)",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <div
        className="relative flex h-[100px] items-center justify-center"
        style={{ background: cfg.bg }}
      >
        <MaterialIcon name={cfg.icon} outlined size={40} style={{ color: cfg.color }} />
        <span
          className="absolute right-2 top-2 rounded-md border px-[7px] py-0.5 text-[9px] font-bold tracking-wider bg-white"
          style={{ color: cfg.color, borderColor: cfg.color }}
        >
          {cfg.label}
        </span>
        {hover && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[rgba(27,42,74,0.32)]">
            <button
              type="button"
              className="flex size-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-white/90"
            >
              <MaterialIcon name="open_in_full" outlined size={16} className="text-[var(--figma-navy)]" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex size-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(242,109,109,0.9)]"
            >
              <MaterialIcon name="delete" outlined size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <div className="mb-0.5 truncate text-[11px] font-semibold text-[var(--figma-navy)]">{file.name}</div>
        <div className="text-[10px] text-[var(--figma-gray400)]">
          {file.size} · {file.date}
        </div>
      </div>
    </div>
  );
}

function TeamRow() {
  const [assigned, setAssigned] = useState([1, 2]);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <SectionCard className="px-5 py-4">
      <SectionTitle icon="group" title="Team Assignment" />
      <div className="flex flex-wrap items-center gap-2">
        {assigned.map((id) => {
          const member = TEAM_MEMBERS.find((m) => m.id === id)!;
          return (
            <div
              key={id}
              className="flex items-center gap-[7px] rounded-[20px] border-[1.5px] border-[var(--figma-border)] bg-[var(--figma-gray50)] py-1.5 pl-1.5 pr-3 neu-inset"
            >
              <div
                className="flex size-[26px] items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: member.color }}
              >
                {member.initials}
              </div>
              <span className="text-xs font-medium text-[var(--figma-navy)]">{member.name}</span>
              <button
                type="button"
                onClick={() => setAssigned((prev) => prev.filter((x) => x !== id))}
                className="flex cursor-pointer border-none bg-transparent p-0"
              >
                <MaterialIcon name="close" outlined size={14} className="text-[var(--figma-gray400)]" />
              </button>
            </div>
          );
        })}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="flex cursor-pointer items-center gap-1.5 rounded-[20px] border-[1.5px] border-dashed border-[var(--figma-teal)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--figma-teal)]"
          >
            <MaterialIcon name="person_add" outlined size={14} />
            Assign
          </button>
          {showPicker && (
            <div
              className="absolute left-0 top-[110%] z-50 min-w-[180px] rounded-xl border border-[var(--figma-border)] bg-white py-2"
              style={{ boxShadow: "var(--neu-dropdown, 0 8px 24px rgba(27,42,74,0.12))" }}
            >
              {TEAM_MEMBERS.filter((m) => !assigned.includes(m.id)).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setAssigned((prev) => [...prev, m.id]);
                    setShowPicker(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3.5 py-2 text-left hover:bg-[var(--figma-gray50)]"
                >
                  <div
                    className="flex size-[26px] items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: m.color }}
                  >
                    {m.initials}
                  </div>
                  <span className="text-[13px] text-[var(--figma-navy)]">{m.name}</span>
                </button>
              ))}
              {TEAM_MEMBERS.filter((m) => !assigned.includes(m.id)).length === 0 && (
                <div className="px-3.5 py-2.5 text-xs text-[var(--figma-gray400)]">All members assigned</div>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function TaskItem({ task, onToggle }: { task: LayoutTask; onToggle: (id: number) => void }) {
  const status = STATUS_CFG[task.status];
  const member = TEAM_MEMBERS.find((m) => m.id === task.assigneeId)!;

  return (
    <div className="flex items-center gap-3 border-b border-[var(--figma-border)] py-2.5">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className={cn(
          "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border-2 transition-all duration-150 neu-inset",
          task.status === "done"
            ? "border-[#3FA66B] bg-[#3FA66B]"
            : "border-[var(--figma-border)] bg-white",
        )}
      >
        {task.status === "done" && <MaterialIcon name="check" size={12} className="text-white" />}
      </button>
      <span
        className={cn(
          "flex-1 text-[13px] text-[var(--figma-navy)]",
          task.status === "done" && "line-through opacity-60",
        )}
      >
        {task.title}
      </span>
      <div
        className="flex size-[26px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
        style={{ background: member.color }}
      >
        {member.initials}
      </div>
      <span
        className="rounded-[10px] px-2 py-0.5 text-[10px] font-semibold"
        style={{ color: status.color, background: status.bg }}
      >
        {status.label}
      </span>
    </div>
  );
}

export function LayoutDrawingsScreen({
  project,
  onBack,
  conceptConfirmed = true,
}: {
  project: ActiveProjectView;
  onBack: () => void;
  conceptConfirmed?: boolean;
}) {
  const [activeArea, setActiveArea] = useState(LAYOUT_ALL_AREA_ID);
  const [drawings, setDrawings] = useState(LAYOUT_INITIAL_DRAWINGS);
  const [tasks, setTasks] = useState(LAYOUT_INITIAL_TASKS);
  const [newTask, setNewTask] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [taskFocused, setTaskFocused] = useState(false);

  const area = LAYOUT_AREAS.find((a) => a.id === activeArea)!;
  const isAllArea = activeArea === LAYOUT_ALL_AREA_ID;
  const areaDrawings = drawings.filter((d) => d.areaId === activeArea);
  const drawingsTitle = isAllArea
    ? "Full Layout — All Rooms"
    : `${area.name} — Layout Drawings`;
  const uploadLabel = isAllArea ? "Upload Full Layout Drawing" : "Upload Layout Drawing";

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: newTask.trim(), assigneeId: 1, status: "todo" },
    ]);
    setNewTask("");
    setAddingTask(false);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== id ? t : { ...t, status: t.status === "done" ? "todo" : "done" },
      ),
    );
  };

  return (
    <div className="px-10 py-8">
      <WorkspaceBreadcrumb
        items={["Projects", project.name, "Layout"]}
        onBack={onBack}
      />

      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="mb-1 text-[28px] font-bold text-[var(--figma-navy)]">Layout</h1>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
              Follows concept sign-off · Full layout for all rooms, or drawings per area
            </p>
          </div>
        </div>

        {!conceptConfirmed && (
          <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#FECACA] bg-[#FEF2F2] px-[18px] py-[11px]">
            <MaterialIcon name="lock" outlined size={18} className="text-[var(--figma-alert,#EF4444)]" />
            <span className="text-[13px] font-medium text-[#991B1B]">
              Concept Design must be confirmed before proceeding to Layout phase.
            </span>
          </div>
        )}
      </div>

      <AreaTabs areas={LAYOUT_AREAS} activeId={activeArea} setActiveId={setActiveArea} />

      <div
        className="transition-opacity duration-200"
        style={{
          opacity: conceptConfirmed ? 1 : 0.45,
          pointerEvents: conceptConfirmed ? "auto" : "none",
        }}
      >
        <SectionCard>
          <SectionTitle
            icon="upload_file"
            title={drawingsTitle}
            right={
              <span className="text-[11px] text-[var(--figma-gray400)]">
                {areaDrawings.length} file{areaDrawings.length !== 1 ? "s" : ""}
              </span>
            }
          />
          {isAllArea && (
            <p className="mb-3.5 mt-[-4px] text-[12px] text-[var(--figma-gray500)]">
              Combined layout drawing covering all rooms in one document — the usual client deliverable.
            </p>
          )}
          <UploadDropzone
            label={uploadLabel}
            onUpload={() =>
              setDrawings((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  areaId: activeArea,
                  name: isAllArea
                    ? "Full_Layout_All_Rooms_new.pdf"
                    : `${area.name}_Layout_new.pdf`,
                  type: "pdf",
                  size: "—",
                  date: "Just now",
                },
              ])
            }
          />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {areaDrawings.map((file) => (
              <DrawingCard
                key={file.id}
                file={file}
                onDelete={() => setDrawings((prev) => prev.filter((x) => x.id !== file.id))}
              />
            ))}
          </div>
          {areaDrawings.length === 0 && (
            <div className="py-4 text-center text-[13px] text-[var(--figma-gray400)]">
              {isAllArea
                ? "No full layout yet — upload the combined all-rooms drawing."
                : `No drawings for ${area.name} yet.`}
            </div>
          )}
        </SectionCard>

        <TimelineWidget phase="Layout" />
        <TeamRow />

        <SectionCard>
          <SectionTitle
            icon="task_alt"
            title="Tasks"
            right={
              <button
                type="button"
                onClick={() => setAddingTask((v) => !v)}
                className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-xs font-semibold text-[var(--figma-teal)]"
              >
                <MaterialIcon name="add" outlined size={15} />
                Add Task
              </button>
            }
          />

          {addingTask && (
            <div className="mb-3 flex animate-[fadeIn_160ms_ease] gap-2">
              <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>
              <input
                autoFocus
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                  if (e.key === "Escape") setAddingTask(false);
                }}
                onFocus={() => setTaskFocused(true)}
                onBlur={() => setTaskFocused(false)}
                placeholder="Task title…"
                className={cn(
                  "flex-1 rounded-[9px] bg-white px-3 py-2 text-xs text-[var(--figma-navy)] outline-none transition-all duration-150 neu-inset",
                  taskFocused
                    ? "border-2 border-[var(--figma-teal)]"
                    : "border-[1.5px] border-[var(--figma-border)]",
                )}
              />
              <button
                type="button"
                onClick={addTask}
                className="cursor-pointer rounded-[9px] border-none bg-[var(--figma-teal)] px-3.5 py-2 text-xs font-semibold text-white"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingTask(false);
                  setNewTask("");
                }}
                className="cursor-pointer rounded-[9px] border border-[var(--figma-border)] bg-white px-2.5 py-2 text-xs text-[var(--figma-gray400)]"
              >
                ✕
              </button>
            </div>
          )}

          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))}

          {tasks.length === 0 && !addingTask && (
            <div className="py-5 text-center text-[13px] text-[var(--figma-gray400)]">
              No tasks yet — click &quot;Add Task&quot; to create one.
            </div>
          )}
        </SectionCard>

        <ClientConfirmationWidget phase="Layout" nextPhase="3D Design" />
      </div>
    </div>
  );
}
