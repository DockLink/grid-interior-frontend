"use client";

import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  BOARD_COLUMNS,
  PRIORITY_DOT,
  dueDateColor,
  formatBoardDate,
  type BoardColumnId,
  type ProjectTaskView,
} from "@/lib/tasks/task-board";
import { cn } from "@/lib/utils";

import { TaskUserAvatar } from "./task-user-avatar";

export const TaskKanbanCard = memo(function TaskKanbanCard({
  task,
  isDragging,
  showAssigneeNames = false,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  task: ProjectTaskView;
  isDragging: boolean;
  showAssigneeNames?: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  const isOverdue = task.dueDate < new Date().toISOString().slice(0, 10) && task.status !== "done";
  const isDone = task.status === "done";
  const visibleAssignees = task.assignees.slice(0, showAssigneeNames ? 3 : 4);
  const overflow = task.assignees.length - visibleAssignees.length;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        // Delay so the browser captures the drag ghost at full opacity before React
        // re-renders the card as a faded placeholder.
        requestAnimationFrame(() => onDragStart());
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "mb-2 cursor-grab rounded-[12px] border border-[var(--figma-border)] bg-white p-3 shadow-[var(--neu-card)] active:cursor-grabbing select-none transition-opacity",
        isDragging && "opacity-20 pointer-events-none border-dashed"
      )}
    >
      <div className="mb-2.5 flex items-start gap-2">
        <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: PRIORITY_DOT[task.priority] }} />
        <span
          className={cn(
            "text-[13px] leading-snug font-medium",
            isDone ? "text-[var(--figma-gray500)] line-through" : "text-[var(--figma-navy)]"
          )}
        >
          {task.title}
        </span>
      </div>

      {/* Assignees row */}
      <div className="flex items-center justify-between pl-3.5">
        {showAssigneeNames ? (
          <div className="flex min-w-0 flex-col gap-1">
            {visibleAssignees.map((a) => (
              <div key={a.userId} className="flex min-w-0 items-center gap-1.5">
                <TaskUserAvatar initials={a.initials} size={16} />
                <span className="truncate text-[11px] font-medium leading-none text-[var(--figma-gray500)]">
                  {a.name}
                </span>
              </div>
            ))}
            {overflow > 0 && (
              <span className="pl-5 text-[10px] text-[var(--figma-gray400)]">+{overflow} more</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {visibleAssignees.map((a) => (
              <div key={a.userId} title={a.name}>
                <TaskUserAvatar initials={a.initials} size={18} />
              </div>
            ))}
            {overflow > 0 && (
              <span className="flex size-[18px] items-center justify-center rounded-full bg-[var(--ds-accent-muted)] text-[9px] font-semibold text-[var(--ds-accent)]">
                +{overflow}
              </span>
            )}
          </div>
        )}
        <span
          className="ml-2 shrink-0 text-[11px]"
          style={{ color: dueDateColor(task.dueDate, task.status), fontWeight: isOverdue ? 500 : 400 }}
        >
          {formatBoardDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
});

export const TaskKanbanColumn = memo(function TaskKanbanColumn({
  columnId,
  tasks,
  draggedId,
  isOver,
  showAssigneeNames,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onAddTask,
  onCardClick,
  onCardDragStart,
  onCardDragEnd,
  canAdd,
}: {
  columnId: BoardColumnId;
  tasks: ProjectTaskView[];
  draggedId: string | null;
  isOver: boolean;
  showAssigneeNames?: boolean;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onAddTask: (status: BoardColumnId) => void;
  onCardClick: (task: ProjectTaskView) => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
  canAdd: boolean;
}) {
  const column = BOARD_COLUMNS.find((c) => c.id === columnId)!;

  return (
    <div className="flex min-w-[220px] flex-1 flex-col">
      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: column.accent }} />
          <span className="text-[13px] font-medium text-[var(--figma-navy)]">{column.label}</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={() => onAddTask(columnId)}
            className="text-[var(--figma-gray400)] hover:text-[var(--ds-accent)]"
          >
            +
          </button>
        )}
      </div>
      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          onDrop();
        }}
        className={cn(
          "min-h-[480px] flex-1 rounded-xl p-2",
          isOver
            ? "border border-dashed border-[var(--ds-accent)]/60 bg-[var(--ds-accent)]/5"
            : "bg-[var(--figma-gray50)]"
        )}
      >
        {tasks.map((task) => (
          <TaskKanbanCard
            key={task.id}
            task={task}
            isDragging={task.id === draggedId}
            showAssigneeNames={showAssigneeNames}
            onDragStart={() => onCardDragStart(task.id)}
            onDragEnd={onCardDragEnd}
            onClick={() => onCardClick(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-20 items-center justify-center text-xs text-[var(--figma-gray400)]">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
});
