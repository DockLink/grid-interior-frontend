"use client";

import { useState } from "react";
import { DemoCaption } from "@/components/demo/demo-caption";
import {
  MOCK_TASKS,
  PRIORITY_CFG,
  STATUS_CFG,
  STATUS_ORDER,
  type MockComment,
  type MockPriority,
  type MockTask,
  type MockTaskStatus,
} from "@/lib/tasks/mock-tasks";

// ── Design tokens (mirroring globals.css --figma-* / --neu-*) ──────────────
const T = {
  navy: "#1B2A4A",
  teal: "#0E7C86",
  tealLight: "#138f9b",
  alert: "#F26D6D",
  success: "#3FA66B",
  border: "#E5E7EB",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
};

const S = {
  raised:
    "6px 6px 14px rgba(163,177,198,0.45), -4px -4px 10px rgba(255,255,255,0.90)",
  raisedHover:
    "9px 9px 20px rgba(163,177,198,0.55), -6px -6px 16px rgba(255,255,255,0.95)",
  card: "8px 8px 20px rgba(163,177,198,0.40), -6px -6px 14px rgba(255,255,255,0.95)",
  cardHover:
    "10px 10px 24px rgba(163,177,198,0.50), -8px -8px 18px rgba(255,255,255,0.98)",
  inset:
    "inset 3px 3px 8px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.90)",
  modal:
    "16px 16px 40px rgba(163,177,198,0.45), -10px -10px 28px rgba(255,255,255,0.95)",
  dropdown:
    "12px 12px 30px rgba(163,177,198,0.40), -8px -8px 20px rgba(255,255,255,0.95)",
};

// ── Shared primitives ─────────────────────────────────────────────────────────
function GradBtn({
  label,
  icon,
  onClick,
  small = false,
}: {
  label: string;
  icon?: string;
  onClick?: () => void;
  small?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: small ? "8px 18px" : "11px 24px",
        borderRadius: 24,
        border: "none",
        background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
        color: T.white,
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: hov ? S.raisedHover : S.raised,
        transform: hov ? "scale(1.01)" : "scale(1)",
        transition: "all 150ms",
      }}
    >
      {icon && (
        <span
          className="material-icons-outlined"
          style={{ fontSize: small ? 14 : 16 }}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  );
}

function PriorityBadge({ priority }: { priority: MockPriority }) {
  const cfg = PRIORITY_CFG[priority];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: 10,
        color: cfg.color,
        background: cfg.bg,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: MockTaskStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: 10,
        color: cfg.color,
        background: cfg.bg,
      }}
    >
      {cfg.label}
    </span>
  );
}

function Avatar({
  initials,
  color,
  size = 28,
  title = "",
}: {
  initials: string;
  color: string;
  size?: number;
  title?: string;
}) {
  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: S.raised,
      }}
    >
      <span style={{ fontSize: size * 0.36, fontWeight: 700, color: T.white }}>
        {initials}
      </span>
    </div>
  );
}

function ViewToggle({
  view,
  setView,
}: {
  view: "list" | "board";
  setView: (v: "list" | "board") => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: T.gray100,
        borderRadius: 22,
        padding: 3,
        boxShadow: S.inset,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          bottom: 3,
          width: "calc(50% - 3px)",
          left: view === "board" ? "calc(50%)" : "3px",
          background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
          borderRadius: 18,
          boxShadow: S.raised,
          transition: "left 250ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
      {(["list", "board"] as const).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 18px",
            border: "none",
            background: "transparent",
            color: view === v ? T.white : T.gray400,
            fontSize: 12,
            fontWeight: view === v ? 700 : 400,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "color 200ms",
          }}
        >
          <span className="material-icons-outlined" style={{ fontSize: 15 }}>
            {v === "list" ? "list" : "view_kanban"}
          </span>
          {v === "list" ? "My Tasks" : "Board"}
        </button>
      ))}
    </div>
  );
}

// ── Field select (used in detail modal) ──────────────────────────────────────
function FieldSelect({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: T.gray400,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 9,
          background: T.gray50,
          border: `1.5px solid ${T.border}`,
          boxShadow: S.inset,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 12,
          color: T.navy,
        }}
      >
        {label === "Priority" && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: PRIORITY_CFG[value as MockPriority]?.dot,
              flexShrink: 0,
            }}
          />
        )}
        {labels[options.indexOf(value)]}
        <span className="material-icons-outlined" style={{ fontSize: 14, color: T.gray400 }}>
          expand_more
        </span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            zIndex: 100,
            background: T.white,
            borderRadius: 10,
            padding: "5px 0",
            boxShadow: S.dropdown,
            border: `1px solid ${T.border}`,
            minWidth: 140,
          }}
        >
          {options.map((opt, idx) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: value === opt ? T.gray50 : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                fontSize: 13,
                color: value === opt ? T.teal : T.navy,
                fontWeight: value === opt ? 600 : 400,
              }}
            >
              {label === "Priority" && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: PRIORITY_CFG[options[idx] as MockPriority]?.dot,
                  }}
                />
              )}
              {labels[idx]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TASK DETAIL MODAL ────────────────────────────────────────────────────────
function TaskDetailModal({
  task,
  onClose,
}: {
  task: MockTask;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [status, setStatus] = useState<MockTaskStatus>(task.status);
  const [priority, setPriority] = useState<MockPriority>(task.priority);
  const [comments, setComments] = useState<MockComment[]>(task.comments);
  const [newComment, setNewComment] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [commentFocused, setCommentFocused] = useState(false);

  const sendComment = () => {
    if (!newComment.trim()) return;
    setComments((p) => [
      ...p,
      {
        id: Date.now(),
        author: "Priya Nair",
        initials: "PN",
        color: "#7C3AED",
        time: "Just now",
        text: newComment.trim(),
      },
    ]);
    setNewComment("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(27,42,74,0.28)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
        padding: 32,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(8px)}to{opacity:1;transform:none}}`}</style>
      <div
        style={{
          background: T.white,
          borderRadius: 18,
          width: "100%",
          maxWidth: 680,
          boxShadow: S.modal,
          display: "flex",
          flexDirection: "column",
          maxHeight: "88vh",
          animation: "modalIn 200ms ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 26px 18px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  color: T.teal,
                  fontWeight: 600,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{ fontSize: 13 }}
                >
                  folder_open
                </span>
                {task.project}
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: T.navy,
                  fontFamily: "inherit",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  borderBottom: titleFocused
                    ? `2px solid ${T.teal}`
                    : "2px solid transparent",
                  padding: "2px 0",
                  transition: "border-color 150ms",
                }}
              />
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: "none",
                background: T.gray100,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                className="material-icons-outlined"
                style={{ fontSize: 17, color: T.gray500 }}
              >
                close
              </span>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            <FieldSelect
              label="Priority"
              value={priority}
              options={["high", "medium", "low"]}
              labels={["High", "Medium", "Low"]}
              onChange={(v) => setPriority(v as MockPriority)}
            />
            <FieldSelect
              label="Status"
              value={status}
              options={STATUS_ORDER}
              labels={STATUS_ORDER.map((s) => STATUS_CFG[s].label)}
              onChange={(v) => setStatus(v as MockTaskStatus)}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  color: T.gray400,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Due Date
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: 9,
                  background: T.gray50,
                  border: `1.5px solid ${T.border}`,
                  boxShadow: S.inset,
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{
                    fontSize: 14,
                    color: task.overdue ? T.alert : T.gray400,
                  }}
                >
                  event
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: task.overdue ? T.alert : T.navy,
                    fontWeight: 500,
                  }}
                >
                  {task.dueDate}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  color: T.gray400,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Assignee
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "5px 12px",
                  borderRadius: 9,
                  background: T.gray50,
                  border: `1.5px solid ${T.border}`,
                  boxShadow: S.inset,
                }}
              >
                <Avatar
                  initials={task.assignee.initials}
                  color={task.assignee.color}
                  size={22}
                />
                <span style={{ fontSize: 12, color: T.navy }}>
                  {task.assignee.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "18px 26px" }}
        >
          <div style={{ marginBottom: 22 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.gray500,
                display: "block",
                marginBottom: 6,
              }}
            >
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
              rows={3}
              placeholder="Add a description…"
              style={{
                width: "100%",
                padding: "10px 13px",
                borderRadius: 10,
                fontSize: 13,
                fontFamily: "inherit",
                color: T.navy,
                background: T.white,
                lineHeight: 1.6,
                resize: "vertical",
                border: descFocused
                  ? `2px solid ${T.teal}`
                  : `1.5px solid ${T.border}`,
                boxShadow: S.inset,
                outline: "none",
                boxSizing: "border-box",
                transition: "all 150ms",
              }}
            />
          </div>

          {/* Comments */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.navy,
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <span
                className="material-icons-outlined"
                style={{ fontSize: 16, color: T.teal }}
              >
                chat_bubble_outline
              </span>
              Comments{" "}
              {comments.length > 0 && (
                <span style={{ fontSize: 11, color: T.gray400 }}>
                  ({comments.length})
                </span>
              )}
            </div>
            {comments.length === 0 && (
              <div
                style={{
                  padding: "14px 0",
                  textAlign: "center",
                  fontSize: 12,
                  color: T.gray400,
                  marginBottom: 16,
                }}
              >
                No comments yet — be the first to add one.
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 18,
              }}
            >
              {comments.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 11 }}>
                  <Avatar initials={c.initials} color={c.color} size={30} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: T.navy,
                        }}
                      >
                        {c.author}
                      </span>
                      <span style={{ fontSize: 11, color: T.gray400 }}>
                        {c.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: T.gray700,
                        lineHeight: 1.5,
                        padding: "9px 13px",
                        borderRadius: 10,
                        background: T.gray50,
                        boxShadow: S.inset,
                      }}
                    >
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div
              style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
            >
              <Avatar initials="PN" color="#7C3AED" size={30} />
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => setCommentFocused(true)}
                  onBlur={() => setCommentFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendComment();
                    }
                  }}
                  placeholder="Write a comment… (Enter to send)"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "9px 50px 9px 13px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontFamily: "inherit",
                    color: T.navy,
                    background: T.white,
                    resize: "none",
                    border: commentFocused
                      ? `2px solid ${T.teal}`
                      : `1.5px solid ${T.border}`,
                    boxShadow: S.inset,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "all 150ms",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    display: "flex",
                    gap: 6,
                  }}
                >
                  <button
                    onClick={sendComment}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      background: newComment.trim()
                        ? `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`
                        : T.gray200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 150ms",
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{
                        fontSize: 14,
                        color: newComment.trim() ? T.white : T.gray400,
                      }}
                    >
                      send
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 26px 20px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <GradBtn label="Save Changes" icon="check" />
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              color: T.alert,
              fontWeight: 500,
            }}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MY TASKS LIST ─────────────────────────────────────────────────────────────
function MyTasksList({
  tasks: propTasks,
  onOpenTask,
}: {
  tasks?: MockTask[];
  onOpenTask: (t: MockTask) => void;
}) {
  const [tasks, setTasks] = useState<MockTask[]>(propTasks ?? MOCK_TASKS);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    MockPriority | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"due" | "priority" | "project">("due");
  const [focused, setFocused] = useState(false);

  const statusCounts = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = tasks.filter((t) => t.status === s).length;
      return acc;
    },
    {} as Record<MockTaskStatus, number>
  );

  const STAT_TILES = [
    {
      status: "todo" as MockTaskStatus,
      icon: "radio_button_unchecked",
      color: T.gray500,
    },
    {
      status: "in-progress" as MockTaskStatus,
      icon: "pending",
      color: "#D97706",
    },
    { status: "review" as MockTaskStatus, icon: "rate_review", color: T.teal },
    {
      status: "done" as MockTaskStatus,
      icon: "check_circle",
      color: "#3FA66B",
    },
  ];

  const filtered = tasks
    .filter((t) => priorityFilter === "all" || t.priority === priorityFilter)
    .filter(
      (t) =>
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.project.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "priority")
        return (
          ["high", "medium", "low"].indexOf(a.priority) -
          ["high", "medium", "low"].indexOf(b.priority)
        );
      if (sortBy === "project") return a.project.localeCompare(b.project);
      return a.overdue === b.overdue
        ? a.dueDate.localeCompare(b.dueDate)
        : a.overdue
        ? -1
        : 1;
    });

  const toggleDone = (id: number) =>
    setTasks((p) =>
      p.map((t) =>
        t.id !== id
          ? t
          : { ...t, status: t.status === "done" ? "todo" : "done" }
      )
    );

  return (
    <div style={{ padding: "32px 40px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: T.navy,
              margin: "0 0 4px",
            }}
          >
            My Tasks
          </h1>
          <p style={{ fontSize: 13, color: T.gray500, margin: 0 }}>
            All tasks across all your projects
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ViewToggle view="list" setView={() => {}} />
          <GradBtn label="New Task" icon="add" small />
        </div>
      </div>

      {/* Stat tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {STAT_TILES.map((st) => {
          const cfg = STATUS_CFG[st.status];
          return (
            <div
              key={st.status}
              style={{
                background: T.white,
                borderRadius: 14,
                padding: "16px 18px",
                boxShadow: S.card,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: cfg.bg,
                  boxShadow: S.inset,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-icons-outlined"
                  style={{ fontSize: 20, color: cfg.color }}
                >
                  {st.icon}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: T.navy,
                    lineHeight: 1,
                  }}
                >
                  {statusCounts[st.status]}
                </div>
                <div style={{ fontSize: 11, color: T.gray500, marginTop: 3 }}>
                  {cfg.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative" }}>
          <span
            className="material-icons-outlined"
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 16,
              color: focused ? T.teal : T.gray400,
              pointerEvents: "none",
            }}
          >
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or projects…"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              padding: "8px 12px 8px 34px",
              borderRadius: 22,
              fontSize: 12,
              fontFamily: "inherit",
              color: T.navy,
              background: T.white,
              border: focused
                ? `2px solid ${T.teal}`
                : `1.5px solid ${T.border}`,
              boxShadow: S.inset,
              outline: "none",
              width: 220,
              transition: "all 150ms",
            }}
          />
        </div>

        {/* Priority filters */}
        <div style={{ display: "flex", gap: 5 }}>
          {(["all", "high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                padding: "6px 14px",
                borderRadius: 18,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
                fontWeight: priorityFilter === p ? 700 : 400,
                background:
                  priorityFilter === p
                    ? `linear-gradient(135deg, ${T.navy}, ${T.teal})`
                    : T.white,
                color: priorityFilter === p ? T.white : T.gray500,
                boxShadow: priorityFilter === p ? S.raised : S.inset,
                transition: "all 180ms",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {p !== "all" && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background:
                      priorityFilter === p
                        ? "rgba(255,255,255,0.8)"
                        : PRIORITY_CFG[p].dot,
                  }}
                />
              )}
              {p === "all" ? "All" : PRIORITY_CFG[p].label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span style={{ fontSize: 12, color: T.gray500 }}>Sort:</span>
          {(["due", "priority", "project"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                padding: "5px 12px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
                fontWeight: sortBy === s ? 600 : 400,
                background: sortBy === s ? T.gray100 : "transparent",
                color: sortBy === s ? T.teal : T.gray400,
                transition: "all 150ms",
              }}
            >
              {s === "due"
                ? "Due Date"
                : s === "priority"
                ? "Priority"
                : "Project"}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "70px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            className="material-icons-outlined"
            style={{ fontSize: 52, color: T.gray200 }}
          >
            task_alt
          </span>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: T.navy,
                marginBottom: 4,
              }}
            >
              No tasks match your filters
            </div>
            <div style={{ fontSize: 13, color: T.gray500 }}>
              Try adjusting filters or create a new task.
            </div>
          </div>
          <GradBtn label="Create Task" icon="add" />
        </div>
      ) : (
        <div
          style={{
            background: T.white,
            borderRadius: 16,
            boxShadow: S.card,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "26px 1fr 160px 90px 120px 110px 36px",
              gap: 0,
              padding: "10px 18px",
              background: T.gray50,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {["", "Task", "Project", "Priority", "Due Date", "Status", ""].map(
              (h, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: T.gray500,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {h}
                </span>
              )
            )}
          </div>
          {filtered.map((t, idx) => (
            <TaskRow
              key={t.id}
              task={t}
              isLast={idx === filtered.length - 1}
              onToggle={toggleDone}
              onClick={() => onOpenTask(t)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  isLast,
  onToggle,
  onClick,
}: {
  task: MockTask;
  isLast: boolean;
  onToggle: (id: number) => void;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const done = task.status === "done";
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "26px 1fr 160px 90px 120px 110px 36px",
        gap: 0,
        padding: "13px 18px",
        cursor: "pointer",
        borderBottom: isLast ? "none" : `1px solid ${T.border}`,
        background: hov ? `rgba(14,124,134,0.04)` : T.white,
        transition: "background 150ms",
        alignItems: "center",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          flexShrink: 0,
          border: done ? "none" : `2px solid ${T.border}`,
          background: done ? "#3FA66B" : T.white,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: done ? S.raised : S.inset,
          transition: "all 150ms",
        }}
      >
        {done && (
          <span
            className="material-icons"
            style={{ fontSize: 13, color: T.white }}
          >
            check
          </span>
        )}
      </button>
      <div onClick={onClick} style={{ paddingRight: 16 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: T.navy,
            textDecoration: done ? "line-through" : "none",
            opacity: done ? 0.55 : 1,
            marginBottom: 1,
          }}
        >
          {task.title}
        </div>
      </div>
      <div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 10,
            color: task.projectColor,
            background: `${task.projectColor}14`,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
            maxWidth: 145,
          }}
        >
          {task.project}
        </span>
      </div>
      <div>
        <PriorityBadge priority={task.priority} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          className="material-icons-outlined"
          style={{
            fontSize: 13,
            color: task.overdue ? T.alert : T.gray400,
          }}
        >
          {task.overdue ? "alarm" : "event"}
        </span>
        <span
          style={{
            fontSize: 12,
            color: task.overdue ? T.alert : T.navy,
            fontWeight: task.overdue ? 600 : 400,
          }}
        >
          {task.dueDate}
        </span>
      </div>
      <div>
        <StatusBadge status={task.status} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Avatar
          initials={task.assignee.initials}
          color={task.assignee.color}
          size={26}
          title={task.assignee.name}
        />
      </div>
    </div>
  );
}

// ── TASK BOARD (KANBAN) ───────────────────────────────────────────────────────
function TaskBoard({
  tasks: propTasks,
  onOpenTask,
}: {
  tasks?: MockTask[];
  onOpenTask: (t: MockTask) => void;
}) {
  const [tasks, setTasks] = useState<MockTask[]>(propTasks ?? MOCK_TASKS);
  const [project, setProject] = useState("All Projects");
  const [projOpen, setProjOpen] = useState(false);

  const projects = [
    "All Projects",
    "Marchetti Villa",
    "Bianchi Office",
    "Romano Penthouse",
    "De Luca Townhouse",
    "Visconti Showroom",
  ];

  const filtered =
    project === "All Projects"
      ? tasks
      : tasks.filter((t) => t.project === project);

  const COLUMN_CFG: Record<
    MockTaskStatus,
    { label: string; accent: string; headerBg: string }
  > = {
    todo: { label: "To Do", accent: T.gray200, headerBg: T.gray100 },
    "in-progress": {
      label: "In Progress",
      accent: "#F59E0B",
      headerBg: "#FEF9EE",
    },
    review: {
      label: "Under Review",
      accent: T.teal,
      headerBg: `rgba(14,124,134,0.06)`,
    },
    done: { label: "Completed", accent: "#3FA66B", headerBg: "#F0FDF4" },
  };

  const moveTask = (id: number, newStatus: MockTaskStatus) => {
    setTasks((p) =>
      p.map((t) => (t.id !== id ? t : { ...t, status: newStatus }))
    );
  };

  return (
    <div style={{ padding: "32px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: T.navy,
              margin: "0 0 2px",
            }}
          >
            Task Board
          </h1>
          {/* Project selector */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProjOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 22,
                border: `1.5px solid ${T.border}`,
                background: T.white,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                color: T.navy,
                fontWeight: 500,
                boxShadow: S.raised,
              }}
            >
              <span
                className="material-icons-outlined"
                style={{ fontSize: 15, color: T.teal }}
              >
                folder_open
              </span>
              {project}
              <span
                className="material-icons-outlined"
                style={{ fontSize: 15, color: T.gray400 }}
              >
                expand_more
              </span>
            </button>
            {projOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  zIndex: 50,
                  background: T.white,
                  borderRadius: 12,
                  padding: "6px 0",
                  boxShadow: S.dropdown,
                  border: `1px solid ${T.border}`,
                  minWidth: 200,
                }}
              >
                {projects.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setProject(p);
                      setProjOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 14px",
                      background: project === p ? T.gray50 : "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      fontSize: 13,
                      color: project === p ? T.teal : T.navy,
                      fontWeight: project === p ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ViewToggle view="board" setView={() => {}} />
          <GradBtn label="New Task" icon="add" small />
        </div>
      </div>

      {/* Kanban columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {STATUS_ORDER.map((status) => {
          const cfg = COLUMN_CFG[status];
          const colTasks = filtered.filter((t) => t.status === status);
          const statusCfg = STATUS_CFG[status];
          return (
            <div
              key={status}
              style={{
                borderRadius: 16,
                background: cfg.headerBg,
                overflow: "hidden",
                boxShadow: S.card,
              }}
            >
              <div
                style={{
                  padding: "13px 14px 10px",
                  borderBottom: `2px solid ${cfg.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: T.navy }}
                  >
                    {cfg.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 8px",
                      borderRadius: 9,
                      color: statusCfg.color,
                      background: statusCfg.bg,
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    className="material-icons-outlined"
                    style={{ fontSize: 18, color: T.gray400 }}
                  >
                    more_horiz
                  </span>
                </button>
              </div>

              <div
                style={{
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  minHeight: 200,
                }}
              >
                {colTasks.map((t) => (
                  <KanbanCard
                    key={t.id}
                    task={t}
                    onOpen={() => onOpenTask(t)}
                    onMove={moveTask}
                    currentStatus={status}
                  />
                ))}
                <button
                  style={{
                    width: "100%",
                    padding: "8px 0",
                    borderRadius: 10,
                    border: `1.5px dashed ${T.border}`,
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 12,
                    color: T.gray400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    transition: "all 150ms",
                    marginTop: 4,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.teal;
                    e.currentTarget.style.color = T.teal;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.color = T.gray400;
                  }}
                >
                  <span
                    className="material-icons-outlined"
                    style={{ fontSize: 15 }}
                  >
                    add
                  </span>
                  Add Task
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  task,
  onOpen,
  onMove,
  currentStatus,
}: {
  task: MockTask;
  onOpen: () => void;
  onMove: (id: number, s: MockTaskStatus) => void;
  currentStatus: MockTaskStatus;
}) {
  const [hov, setHov] = useState(false);
  const pCfg = PRIORITY_CFG[task.priority];
  const nextStatus =
    STATUS_ORDER[(STATUS_ORDER.indexOf(currentStatus) + 1) % STATUS_ORDER.length];

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.white,
        borderRadius: 12,
        boxShadow: hov ? S.cardHover : S.card,
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all 200ms ease",
        cursor: "pointer",
        borderLeft: `3px solid ${pCfg.dot}`,
        padding: "12px 12px 10px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 8,
          color: T.gray400,
          opacity: hov ? 0.7 : 0,
          transition: "opacity 150ms",
        }}
      >
        <span className="material-icons-outlined" style={{ fontSize: 16 }}>
          drag_indicator
        </span>
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: T.navy,
          marginBottom: 8,
          paddingRight: 20,
          lineHeight: 1.4,
        }}
      >
        {task.title}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 9,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 8,
            color: task.projectColor,
            background: `${task.projectColor}14`,
          }}
        >
          {task.project.split(" ")[0]}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            className="material-icons-outlined"
            style={{
              fontSize: 12,
              color: task.overdue ? T.alert : T.gray400,
            }}
          >
            {task.overdue ? "alarm" : "event"}
          </span>
          <span
            style={{
              fontSize: 11,
              color: task.overdue ? T.alert : T.gray400,
              fontWeight: task.overdue ? 600 : 400,
            }}
          >
            {task.dueDate}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {task.comments.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span
                className="material-icons-outlined"
                style={{ fontSize: 12, color: T.gray400 }}
              >
                chat_bubble_outline
              </span>
              <span style={{ fontSize: 10, color: T.gray400 }}>
                {task.comments.length}
              </span>
            </div>
          )}
          <Avatar
            initials={task.assignee.initials}
            color={task.assignee.color}
            size={22}
          />
        </div>
      </div>

      {hov && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(task.id, nextStatus);
          }}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "5px 0",
            borderRadius: 7,
            border: `1px solid ${T.border}`,
            background: T.gray50,
            fontSize: 10,
            color: T.teal,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <span className="material-icons-outlined" style={{ fontSize: 12 }}>
            arrow_forward
          </span>
          Move to {STATUS_CFG[nextStatus].label}
        </button>
      )}
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function TasksWorkspace({
  initialView = "list",
  tasks,
}: {
  initialView?: "list" | "board";
  tasks?: MockTask[];
}) {
  const [view, setView] = useState<"list" | "board">(initialView);
  const [selectedTask, setSelectedTask] = useState<MockTask | null>(null);

  const handleSetView = (v: "list" | "board") => setView(v);

  return (
    <div style={{ position: "relative" }}>
      {/* Intercept ViewToggle clicks at workspace level */}
      <div
        style={{ position: "absolute", top: 32, right: 40 + 120, zIndex: 10 }}
      >
        <ViewToggle view={view} setView={handleSetView} />
      </div>

      {view === "list" && (
        <MyTasksList
          tasks={tasks}
          onOpenTask={(t) => setSelectedTask(t)}
        />
      )}
      {view === "board" && (
        <TaskBoard
          tasks={tasks}
          onOpenTask={(t) => setSelectedTask(t)}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
