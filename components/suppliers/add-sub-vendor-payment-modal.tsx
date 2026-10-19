"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { handleApiError } from "@/lib/api/handle-api-error";
import type { CreateSubVendorPaymentPayload, PaymentStatus } from "@/types/suppliers";

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function AddSubVendorPaymentModal({
  subVendorName,
  projects,
  projectsLoading = false,
  isCreating,
  onClose,
  onCreate,
}: {
  subVendorName: string;
  projects: { id: string; name: string }[];
  projectsLoading?: boolean;
  isCreating: boolean;
  onClose: () => void;
  onCreate: (payload: CreateSubVendorPaymentPayload) => Promise<unknown>;
}) {
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayIso);
  const [status, setStatus] = useState<PaymentStatus>("Paid");

  useEffect(() => {
    if (projectId && sortedProjects.some((project) => project.id === projectId)) return;
    setProjectId(sortedProjects[0]?.id ?? "");
  }, [projectId, sortedProjects]);

  const handleSubmit = async () => {
    const project = sortedProjects.find((item) => item.id === projectId);
    if (!project) {
      toast.error("Select a project");
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
      toast.error("Choose a payment date");
      return;
    }

    try {
      await onCreate({
        project_id: project.id,
        project_name: project.name,
        amount: parsed,
        payment_date: paymentDate,
        status,
      });
      toast.success("Payment record added");
      onClose();
    } catch (err) {
      handleApiError(err, { toast: true });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.20)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isCreating && onClose()}
    >
      <div
        className="hub-modal-in w-full max-w-[440px] rounded-[20px] bg-white px-8 py-7"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">Add payment</h2>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
              Record a line-item payment for {subVendorName}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="payment-project">
            Project
          </label>
          {projectsLoading ? (
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">Loading projects…</p>
          ) : sortedProjects.length === 0 ? (
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
              No projects are available to attach this payment to.
            </p>
          ) : (
            <select
              id="payment-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
            >
              {sortedProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="payment-amount">
            Amount (LKR)
          </label>
          <input
            id="payment-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
          />
        </div>

        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="payment-date">
            Date
          </label>
          <input
            id="payment-date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
          />
        </div>

        <div className="mb-5 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="payment-status">
            Status
          </label>
          <select
            id="payment-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
          >
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        <div className="flex gap-2.5">
          <OutlineButton onClick={onClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton
            icon="check"
            className="flex-[2]"
            disabled={isCreating || projectsLoading || sortedProjects.length === 0}
            onClick={() => void handleSubmit()}
          >
            {isCreating ? "Saving…" : "Add payment"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
