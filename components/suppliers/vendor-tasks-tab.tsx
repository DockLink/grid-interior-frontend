"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useProjectContext } from "@/components/projects/project-context";
import {
  openVendorTasksPrintWindow,
  printMetaForParty,
} from "@/components/suppliers/vendor-tasks-print";
import { GradientButton, StatusPill } from "@/components/suppliers/supplier-ui";
import { useProjectLinks } from "@/hooks/use-project-links";
import { useProjects } from "@/hooks/use-projects";
import {
  getProjectNameFromCache,
  getVendorPartyContactFromCache,
  getVendorPartyNameFromCache,
  useVendorTasks,
} from "@/hooks/use-vendor-tasks";
import { handleApiError } from "@/lib/api/handle-api-error";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  displayVendorTaskStatus,
  formatVendorTaskDate,
  isVendorTaskOverdue,
  VENDOR_TASK_STATUS_OPTIONS,
} from "@/lib/suppliers/map-vendor-tasks";
import {
  downloadVendorTasksCsv,
  slugForFilename,
  vendorTaskToExportRow,
} from "@/lib/suppliers/vendor-tasks-export";
import type { VendorPartyKind, VendorTask, VendorTaskStatus } from "@/types/vendor-tasks";
import { cn } from "@/lib/utils";

function AuthDisabledCallout({ feature }: { feature: string }) {
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
      Live {feature} require auth. Copy <code className="font-mono">.env.local.example</code> to{" "}
      <code className="font-mono">.env.local</code> and set{" "}
      <code className="font-mono">NEXT_PUBLIC_ENABLE_AUTH=true</code>.
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-[var(--figma-border)] bg-white px-3.5 py-2 text-[13px] font-medium text-[var(--figma-navy)] neu-raised",
        disabled && "cursor-default opacity-50",
      )}
    >
      <MaterialIcon name={icon} outlined size={16} />
      {label}
    </button>
  );
}

type LinkedProjectOption = { projectId: string; name: string };

type LinkedPartyOption = {
  partyKind: VendorPartyKind;
  partyId: string;
  label: string;
};

interface TaskFormState {
  partyKind: VendorPartyKind;
  partyId: string;
  projectId: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: VendorTaskStatus;
}

function AddVendorTaskModal({
  open,
  onClose,
  editing,
  lockedParty,
  lockedProjectId,
  projectOptions,
  partyOptions,
  onSave,
  isSaving,
}: {
  open: boolean;
  onClose: () => void;
  editing: VendorTask | null;
  lockedParty?: { partyKind: VendorPartyKind; partyId: string };
  lockedProjectId?: string;
  projectOptions: LinkedProjectOption[];
  partyOptions: LinkedPartyOption[];
  onSave: (form: TaskFormState, editing: VendorTask | null) => Promise<void>;
  isSaving: boolean;
}) {
  if (!open) return null;
  return (
    <AddVendorTaskModalBody
      key={editing?.id ?? "new"}
      onClose={onClose}
      editing={editing}
      lockedParty={lockedParty}
      lockedProjectId={lockedProjectId}
      projectOptions={projectOptions}
      partyOptions={partyOptions}
      onSave={onSave}
      isSaving={isSaving}
    />
  );
}

function AddVendorTaskModalBody({
  onClose,
  editing,
  lockedParty,
  lockedProjectId,
  projectOptions,
  partyOptions,
  onSave,
  isSaving,
}: {
  onClose: () => void;
  editing: VendorTask | null;
  lockedParty?: { partyKind: VendorPartyKind; partyId: string };
  lockedProjectId?: string;
  projectOptions: LinkedProjectOption[];
  partyOptions: LinkedPartyOption[];
  onSave: (form: TaskFormState, editing: VendorTask | null) => Promise<void>;
  isSaving: boolean;
}) {
  const defaultParty = lockedParty ??
    (partyOptions[0]
      ? { partyKind: partyOptions[0].partyKind, partyId: partyOptions[0].partyId }
      : { partyKind: "supplier" as const, partyId: "" });
  const defaultProject = lockedProjectId ?? projectOptions[0]?.projectId ?? "";

  const [form, setForm] = useState<TaskFormState>(() =>
    editing
      ? {
          partyKind: editing.partyKind,
          partyId: editing.partyId,
          projectId: editing.projectId,
          title: editing.title,
          description: editing.description ?? "",
          startDate: editing.startDate ?? "",
          dueDate: editing.dueDate,
          status: editing.status,
        }
      : {
          partyKind: defaultParty.partyKind,
          partyId: defaultParty.partyId,
          projectId: defaultProject,
          title: "",
          description: "",
          startDate: "",
          dueDate: "",
          status: "todo",
        },
  );
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormState, string>>>({});

  const set = (field: keyof TaskFormState) => (value: string) => {
    if (field === "partyId") {
      const option = partyOptions.find((p) => `${p.partyKind}-${p.partyId}` === value);
      if (option) {
        setForm((prev) => ({ ...prev, partyKind: option.partyKind, partyId: option.partyId }));
      }
      return;
    }
    if (field === "status") {
      setForm((prev) => ({ ...prev, status: value as VendorTaskStatus }));
      if (errors.status) setErrors((prev) => ({ ...prev, status: undefined }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof TaskFormState, string>> = {};
    if (!form.title.trim()) next.title = "This field is required";
    if (!form.dueDate) next.dueDate = "This field is required";
    if (!form.projectId) next.projectId = "This field is required";
    if (!form.partyId) next.partyId = "This field is required";
    return next;
  };

  const handleSave = async () => {
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    try {
      await onSave(form, editing);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save task");
    }
  };

  const showPartySelect = !lockedParty;
  const showProjectSelect = !lockedProjectId;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto p-5 pt-10 backdrop-blur-[3px]"
      style={{ background: "rgba(27,42,74,0.18)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] rounded-[20px] bg-white p-8"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="mb-1 text-[20px] font-bold text-[var(--figma-navy)]">
              {editing ? "Edit task" : "Assign task"}
            </h2>
            <p className="text-[13px] text-[var(--figma-gray500)]">
              Deadline and status for a linked supplier or sub-vendor
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          {showPartySelect && (
            <FieldSelect
              label="Assignee"
              value={`${form.partyKind}-${form.partyId}`}
              onChange={set("partyId")}
              error={errors.partyId}
              options={partyOptions.map((p) => ({
                value: `${p.partyKind}-${p.partyId}`,
                label: p.label,
              }))}
            />
          )}
          {showProjectSelect && (
            <FieldSelect
              label="Project"
              value={form.projectId}
              onChange={set("projectId")}
              error={errors.projectId}
              options={projectOptions.map((p) => ({ value: p.projectId, label: p.name }))}
            />
          )}
          <FieldInput
            label="Task"
            value={form.title}
            onChange={set("title")}
            error={errors.title}
            placeholder="e.g. Deliver kitchen carcasses"
          />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Start" value={form.startDate} onChange={set("startDate")} type="date" />
            <FieldInput
              label="Deadline"
              value={form.dueDate}
              onChange={set("dueDate")}
              type="date"
              error={errors.dueDate}
            />
          </div>
          <FieldSelect
            label="Status"
            value={form.status}
            onChange={set("status")}
            options={VENDOR_TASK_STATUS_OPTIONS.map((s) => ({ value: s.id, label: s.label }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">
              Notes <span className="text-[11px] font-normal text-[var(--figma-gray400)]">(Optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              rows={3}
              placeholder="Scope, delivery notes, or site instructions…"
              className="hub-input-focus w-full resize-y rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none neu-inset"
            />
          </div>
        </div>

        <div className="mt-7 flex gap-2.5 border-t border-[var(--figma-border)] pt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-full border-[1.5px] border-[var(--figma-teal)] bg-white py-3 text-[14px] font-semibold text-[var(--figma-teal)] neu-raised"
          >
            Cancel
          </button>
          <GradientButton
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="flex-[2] justify-center py-3"
          >
            <MaterialIcon name="save" outlined size={16} />
            {editing ? "Save task" : "Assign task"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[13px] font-medium"
        style={{ color: error ? "var(--figma-alert)" : "var(--figma-navy)" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-[10px] bg-white px-3.5 py-2.5 text-[13px] text-[var(--figma-navy)] outline-none neu-inset",
          error
            ? "border-2 border-[var(--figma-alert)]"
            : focused
              ? "border-2 border-[var(--figma-teal)]"
              : "border-[1.5px] border-[var(--figma-border)]",
        )}
      />
      {error && <div className="text-[11px] text-[var(--figma-alert)]">{error}</div>}
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[var(--figma-navy)]">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] bg-white py-2.5 pr-9 pl-3.5 text-[13px] text-[var(--figma-navy)] outline-none neu-inset",
            error ? "border-[var(--figma-alert)]" : "border-[var(--figma-border)]",
            !value && "text-[var(--figma-gray400)]",
          )}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <MaterialIcon
          name="expand_more"
          outlined
          size={16}
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[var(--figma-gray400)]"
        />
      </div>
      {error && <div className="text-[11px] text-[var(--figma-alert)]">{error}</div>}
    </div>
  );
}

function VendorTasksTable({
  tasks,
  showProject,
  showParty,
  onEdit,
  onDelete,
  resolvePartyName,
  resolveProjectName,
}: {
  tasks: VendorTask[];
  showProject: boolean;
  showParty: boolean;
  onEdit: (task: VendorTask) => void;
  onDelete: (task: VendorTask) => void;
  resolvePartyName: (task: VendorTask) => string;
  resolveProjectName: (task: VendorTask) => string;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[var(--figma-border)] bg-white px-4 py-8 text-center text-[13px] text-[var(--figma-gray400)]">
        No tasks assigned yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--figma-border)] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--figma-gray50)]">
              {(showParty ? ["Party"] : [])
                .concat(showProject ? ["Project"] : [])
                .concat(["Task", "Start", "Deadline", "Status", ""])
                .map((col) => (
                  <th
                    key={col || "actions"}
                    className="border-b border-[var(--figma-border)] px-4 py-[11px] text-left text-[12px] font-semibold tracking-wide whitespace-nowrap text-[var(--figma-navy)]"
                  >
                    {col}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                showProject={showProject}
                showParty={showParty}
                isLast={i === tasks.length - 1}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task)}
                partyName={resolvePartyName(task)}
                projectName={resolveProjectName(task)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  showProject,
  showParty,
  isLast,
  onEdit,
  onDelete,
  partyName,
  projectName,
}: {
  task: VendorTask;
  showProject: boolean;
  showParty: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  partyName: string;
  projectName: string;
}) {
  const [hov, setHov] = useState(false);
  const overdue = isVendorTaskOverdue(task);
  const status = displayVendorTaskStatus(task);

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn("transition-colors duration-120", !isLast && "border-b border-[var(--figma-border)]")}
      style={{ background: hov ? "rgba(14,124,134,0.03)" : overdue ? "rgba(242,109,109,0.04)" : "#fff" }}
    >
      {showParty && (
        <td className="px-4 py-3 text-[13px] font-medium text-[var(--figma-navy)]">{partyName}</td>
      )}
      {showProject && (
        <td className="px-4 py-3 text-[13px] font-medium text-[var(--figma-navy)]">{projectName}</td>
      )}
      <td className="px-4 py-3">
        <div className="text-[13px] font-medium text-[var(--figma-navy)]">{task.title}</div>
        {task.description && (
          <div className="mt-0.5 max-w-[360px] truncate text-[11px] text-[var(--figma-gray500)]">
            {task.description}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">
        {formatVendorTaskDate(task.startDate)}
      </td>
      <td
        className="px-4 py-3 text-[12px] font-medium"
        style={{ color: overdue ? "var(--figma-alert)" : "var(--figma-gray500)" }}
      >
        {formatVendorTaskDate(task.dueDate)}
      </td>
      <td className="px-4 py-3">
        <StatusPill label={status.label} color={status.color} bg={status.bg} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            title="Edit task"
            className={cn(
              "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-none",
              hov ? "bg-[var(--figma-gray100)]" : "bg-transparent",
            )}
          >
            <MaterialIcon name="edit" outlined size={16} className="text-[var(--figma-gray500)]" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete task"
            className={cn(
              "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-none",
              hov ? "bg-[rgba(242,109,109,0.10)]" : "bg-transparent",
            )}
          >
            <MaterialIcon name="delete" outlined size={16} className="text-[var(--figma-alert)]" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function TasksToolbar({
  filter,
  filterOptions,
  onFilterChange,
  onAdd,
  onPrint,
  onCsv,
  addDisabled,
}: {
  filter?: string;
  filterOptions?: { value: string; label: string }[];
  onFilterChange?: (v: string) => void;
  onAdd: () => void;
  onPrint: () => void;
  onCsv: () => void;
  addDisabled?: boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        {filterOptions && onFilterChange ? (
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="min-w-[180px] cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2 pr-8 pl-3.5 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <MaterialIcon
              name="expand_more"
              outlined
              size={16}
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[var(--figma-gray400)]"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[12px] text-[var(--figma-gray500)]">
            <MaterialIcon name="info" outlined size={16} className="text-[var(--figma-teal)]" />
            Assign only to parties already linked to this project
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <ToolbarButton icon="download" label="CSV" onClick={onCsv} />
        <ToolbarButton icon="print" label="Print" onClick={onPrint} />
        <GradientButton onClick={onAdd} disabled={addDisabled} className="px-3.5 py-2 text-[12px]">
          <MaterialIcon name="add" outlined size={14} />
          Add task
        </GradientButton>
      </div>
    </div>
  );
}

function useTaskResolvers() {
  const qc = useQueryClient();
  return useMemo(
    () => ({
      partyName: (task: VendorTask) =>
        getVendorPartyNameFromCache(qc, task.partyKind, task.partyId),
      projectName: (task: VendorTask) => getProjectNameFromCache(qc, task.projectId),
    }),
    [qc],
  );
}

function exportCsv(
  tasks: VendorTask[],
  filename: string,
  resolvers: ReturnType<typeof useTaskResolvers>,
) {
  if (tasks.length === 0) {
    toast.error("No tasks to export");
    return;
  }
  downloadVendorTasksCsv(
    tasks.map((task) =>
      vendorTaskToExportRow(
        task,
        displayVendorTaskStatus(task).label,
        resolvers.partyName(task),
        resolvers.projectName(task),
      ),
    ),
    filename,
  );
  toast.success("CSV downloaded");
}

function printTasks(
  tasks: VendorTask[],
  meta: {
    title: string;
    subtitle: string;
    projectLabel: string;
    partyKind?: VendorPartyKind;
    partyId?: string;
  },
  qc: ReturnType<typeof useQueryClient>,
  resolvePartyName: (task: VendorTask) => string,
) {
  if (tasks.length === 0) {
    toast.error("No tasks to print");
    return;
  }
  const printMeta =
    meta.partyKind != null && meta.partyId != null
      ? printMetaForParty(
          getVendorPartyContactFromCache(qc, meta.partyKind, meta.partyId),
          meta.projectLabel,
        )
      : { title: meta.title, subtitle: meta.subtitle, projectLabel: meta.projectLabel };

  const opened = openVendorTasksPrintWindow(printMeta, tasks, resolvePartyName);
  if (!opened) toast.error("Allow pop-ups to print the handover sheet");
}

export function VendorTasksTab({
  partyKind,
  partyId,
}: {
  partyKind: VendorPartyKind;
  partyId: string;
}) {
  const authDisabled = isAuthDisabled();
  const qc = useQueryClient();
  const resolvers = useTaskResolvers();
  const {
    tasks: mine,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
    isDeleting,
  } = useVendorTasks({ party_id: partyId, party_kind: partyKind });
  const { projects } = useProjects({ page: 1, limit: 100 });

  const projectOptions = useMemo(
    () => projects.map((p) => ({ projectId: p.id, name: p.name })),
    [projects],
  );

  const linkedProjects = useMemo(() => {
    const byId = new Map(projects.map((p) => [p.id, p.name]));
    const seen = new Set<string>();
    return mine
      .filter((task) => {
        if (seen.has(task.projectId)) return false;
        seen.add(task.projectId);
        return true;
      })
      .map((task) => ({
        projectId: task.projectId,
        name: byId.get(task.projectId) ?? getProjectNameFromCache(qc, task.projectId),
      }));
  }, [mine, projects, qc]);

  const [projectFilter, setProjectFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VendorTask | null>(null);

  const filtered = useMemo(
    () => (projectFilter === "all" ? mine : mine.filter((t) => t.projectId === projectFilter)),
    [mine, projectFilter],
  );

  const partyName = getVendorPartyNameFromCache(qc, partyKind, partyId);
  const projectLabel =
    projectFilter === "all"
      ? "All projects"
      : (linkedProjects.find((p) => p.projectId === projectFilter)?.name ?? "Project");

  const handleSave = async (form: TaskFormState, editingTask: VendorTask | null) => {
    if (editingTask) {
      await updateTask(editingTask.id, {
        title: form.title,
        description: form.description || undefined,
        start_date: form.startDate || undefined,
        due_date: form.dueDate,
        status: form.status,
      });
      toast.success("Task updated");
    } else {
      await createTask({
        party_kind: form.partyKind,
        party_id: form.partyId,
        project_id: form.projectId,
        title: form.title,
        description: form.description || undefined,
        start_date: form.startDate || undefined,
        due_date: form.dueDate,
        status: form.status,
      });
      toast.success("Task assigned");
    }
  };

  const handleDelete = async (task: VendorTask) => {
    if (!window.confirm(`Delete task “${task.title}”?`)) return;
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
    } catch (err) {
      handleApiError(err, { toast: true });
    }
  };

  if (authDisabled) {
    return <AuthDisabledCallout feature="vendor tasks" />;
  }

  if (isLoading) {
    return <div className="py-10 text-center text-[13px] text-[var(--figma-gray500)]">Loading tasks…</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div>
      <TasksToolbar
        filter={projectFilter}
        filterOptions={[
          { value: "all", label: "All projects" },
          ...linkedProjects.map((p) => ({ value: p.projectId, label: p.name })),
        ]}
        onFilterChange={setProjectFilter}
        onAdd={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        addDisabled={projectOptions.length === 0}
        onPrint={() =>
          printTasks(
            filtered,
            {
              title: `${partyName} — Tasks & Deadlines`,
              subtitle: "Handover sheet for on-site work. Sign and return a copy to GRID.",
              projectLabel,
              partyKind,
              partyId,
            },
            qc,
            resolvers.partyName,
          )
        }
        onCsv={() => exportCsv(filtered, `${slugForFilename(partyName)}-tasks-deadlines.csv`, resolvers)}
      />
      {mine.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[var(--figma-border)] bg-white px-4 py-8 text-center text-[13px] text-[var(--figma-gray400)]">
          No tasks assigned yet. Use Add task to assign work against any project.
        </div>
      ) : (
        <VendorTasksTable
          tasks={filtered}
          showProject
          showParty={false}
          onEdit={(task) => {
            setEditing(task);
            setModalOpen(true);
          }}
          onDelete={(task) => void handleDelete(task)}
          resolvePartyName={resolvers.partyName}
          resolveProjectName={resolvers.projectName}
        />
      )}
      <AddVendorTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        lockedParty={{ partyKind, partyId }}
        projectOptions={projectOptions}
        partyOptions={[]}
        onSave={handleSave}
        isSaving={isCreating || isUpdating || isDeleting}
      />
    </div>
  );
}

export function ProjectVendorTasksSection({ projectId }: { projectId: string }) {
  const authDisabled = isAuthDisabled();
  const qc = useQueryClient();
  const resolvers = useTaskResolvers();
  const { project } = useProjectContext();
  const projectName = project?.name ?? "Project";
  const { links, isLoading: linksLoading, error: linksError } = useProjectLinks(projectId);
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
    isDeleting,
  } = useVendorTasks({ project_id: projectId });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VendorTask | null>(null);

  const partyOptions: LinkedPartyOption[] = useMemo(
    () => [
      ...links.suppliers.map((s) => ({
        partyKind: "supplier" as const,
        partyId: s.id,
        label: `${s.name} (Supplier)`,
      })),
      ...links.subVendors.map((v) => ({
        partyKind: "subvendor" as const,
        partyId: v.id,
        label: `${v.name} (Sub-vendor)`,
      })),
    ],
    [links],
  );

  const groups = partyOptions.map((party) => ({
    party,
    tasks: tasks.filter((t) => t.partyKind === party.partyKind && t.partyId === party.partyId),
  }));

  const handleSave = async (form: TaskFormState, editingTask: VendorTask | null) => {
    if (editingTask) {
      await updateTask(editingTask.id, {
        title: form.title,
        description: form.description || undefined,
        start_date: form.startDate || undefined,
        due_date: form.dueDate,
        status: form.status,
      });
      toast.success("Task updated");
    } else {
      await createTask({
        party_kind: form.partyKind,
        party_id: form.partyId,
        project_id: form.projectId,
        title: form.title,
        description: form.description || undefined,
        start_date: form.startDate || undefined,
        due_date: form.dueDate,
        status: form.status,
      });
      toast.success("Task assigned");
    }
  };

  const handleDelete = async (task: VendorTask) => {
    if (!window.confirm(`Delete task “${task.title}”?`)) return;
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
    } catch (err) {
      handleApiError(err, { toast: true });
    }
  };

  if (authDisabled) {
    return (
      <section>
        <AuthDisabledCallout feature="vendor tasks" />
      </section>
    );
  }

  const isLoading = linksLoading || tasksLoading;
  const error = linksError ?? tasksError;

  if (isLoading) {
    return (
      <section>
        <div className="py-6 text-center text-[13px] text-[var(--figma-gray500)]">Loading tasks…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <MaterialIcon name="task_alt" outlined size={18} className="text-[var(--figma-teal)]" />
        <h2 className="m-0 text-sm font-bold text-[var(--figma-navy)]">Tasks & Deadlines</h2>
        <span className="rounded-full bg-[rgba(27,42,74,0.08)] px-2 py-0.5 text-[11px] font-semibold text-[var(--figma-navy)]">
          {tasks.length}
        </span>
      </div>
      <TasksToolbar
        onAdd={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        addDisabled={partyOptions.length === 0}
        onPrint={() =>
          printTasks(
            tasks,
            {
              title: `${projectName} — Contractor tasks`,
              subtitle: "Handover sheet for on-site work. Sign and return a copy to GRID.",
              projectLabel: projectName,
            },
            qc,
            resolvers.partyName,
          )
        }
        onCsv={() => exportCsv(tasks, `${slugForFilename(projectName)}-vendor-tasks.csv`, resolvers)}
      />
      {partyOptions.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[var(--figma-border)] bg-white px-4 py-8 text-center text-[13px] text-[var(--figma-gray400)]">
          Link a supplier or sub-vendor to this project before assigning tasks.
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={`${group.party.partyKind}-${group.party.partyId}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-[13px] font-semibold text-[var(--figma-navy)]">
                  {group.party.label}
                </div>
                <ToolbarButton
                  icon="print"
                  label="Print"
                  onClick={() =>
                    printTasks(
                      group.tasks,
                      {
                        title: `${getVendorPartyNameFromCache(qc, group.party.partyKind, group.party.partyId)} — Tasks & Deadlines`,
                        subtitle: "Handover sheet for on-site work. Sign and return a copy to GRID.",
                        projectLabel: projectName,
                        partyKind: group.party.partyKind,
                        partyId: group.party.partyId,
                      },
                      qc,
                      resolvers.partyName,
                    )
                  }
                />
              </div>
              <VendorTasksTable
                tasks={group.tasks}
                showProject={false}
                showParty={false}
                onEdit={(task) => {
                  setEditing(task);
                  setModalOpen(true);
                }}
                onDelete={(task) => void handleDelete(task)}
                resolvePartyName={resolvers.partyName}
                resolveProjectName={resolvers.projectName}
              />
            </div>
          ))}
        </div>
      )}
      <AddVendorTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        lockedProjectId={projectId}
        projectOptions={[{ projectId, name: projectName }]}
        partyOptions={partyOptions}
        onSave={handleSave}
        isSaving={isCreating || isUpdating || isDeleting}
      />
    </section>
  );
}
