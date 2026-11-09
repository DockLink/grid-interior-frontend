"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { handleApiError } from "@/lib/api/handle-api-error";
import type {
  CreateSupplierOrderPayload,
  DeliveryStatus,
  PaymentStatus,
  SupplierOrder,
} from "@/types/suppliers";

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function AddSupplierOrderModal({
  supplierName,
  projects,
  projectsLoading = false,
  isSaving,
  editOrder = null,
  onClose,
  onSubmit,
}: {
  supplierName: string;
  projects: { id: string; name: string }[];
  projectsLoading?: boolean;
  isSaving: boolean;
  editOrder?: SupplierOrder | null;
  onClose: () => void;
  onSubmit: (payload: CreateSupplierOrderPayload) => Promise<unknown>;
}) {
  const isEdit = Boolean(editOrder);
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );
  const [projectId, setProjectId] = useState(editOrder?.projectId ?? "");
  const [item, setItem] = useState(editOrder?.item ?? "");
  const [quantity, setQuantity] = useState(
    editOrder?.quantity && editOrder.quantity !== "—" ? editOrder.quantity : "",
  );
  const [amount, setAmount] = useState(
    editOrder && editOrder.amountValue > 0 ? String(editOrder.amountValue) : "",
  );
  const [orderDate, setOrderDate] = useState(editOrder?.orderDate || todayIso());
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(
    editOrder?.deliveryStatus ?? "Pending",
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    editOrder?.paymentStatus ?? "Unpaid",
  );

  useEffect(() => {
    if (projectId && sortedProjects.some((project) => project.id === projectId)) return;
    if (editOrder?.projectId && sortedProjects.some((p) => p.id === editOrder.projectId)) {
      setProjectId(editOrder.projectId);
      return;
    }
    if (editOrder?.project) {
      const byName = sortedProjects.find((p) => p.name === editOrder.project);
      if (byName) {
        setProjectId(byName.id);
        return;
      }
    }
    setProjectId(sortedProjects[0]?.id ?? "");
  }, [projectId, sortedProjects, editOrder]);

  const handleSubmit = async () => {
    const project = sortedProjects.find((entry) => entry.id === projectId);
    if (!project) {
      toast.error("Select a project");
      return;
    }
    const trimmedItem = item.trim();
    if (!trimmedItem) {
      toast.error("Enter an item");
      return;
    }
    const trimmedQty = quantity.trim();
    if (!trimmedQty) {
      toast.error("Enter a quantity");
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(orderDate)) {
      toast.error("Choose an order date");
      return;
    }

    try {
      await onSubmit({
        project_id: project.id,
        project_name: project.name,
        item: trimmedItem,
        quantity: trimmedQty,
        amount: parsed,
        order_date: orderDate,
        delivery_status: deliveryStatus,
        payment_status: paymentStatus,
      });
      toast.success(isEdit ? "Order updated" : "Order added to history");
      onClose();
    } catch (err) {
      handleApiError(err, { toast: true });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.20)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}
    >
      <div
        className="hub-modal-in max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-[20px] bg-white px-8 py-7"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">
              {isEdit ? "Edit order" : "Add order"}
            </h2>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
              {isEdit
                ? `Update order details for ${supplierName}.`
                : `Record an order placed with ${supplierName}.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="order-project">
            Project
          </label>
          {projectsLoading ? (
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">Loading projects…</p>
          ) : sortedProjects.length === 0 ? (
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
              No projects are available to attach this order to.
            </p>
          ) : (
            <select
              id="order-project"
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
          <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="order-item">
            Item
          </label>
          <input
            id="order-item"
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="e.g. Varenna Kitchen"
            className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
          />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="order-qty">
              Quantity
            </label>
            <input
              id="order-qty"
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 6 LM"
              className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="order-amount">
              Amount (LKR)
            </label>
            <input
              id="order-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
            />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]" htmlFor="order-date">
            Order date
          </label>
          <input
            id="order-date"
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
          />
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[13px] font-medium text-[var(--figma-navy)]"
              htmlFor="order-delivery"
            >
              Delivery status
            </label>
            <select
              id="order-delivery"
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
              className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
            >
              <option value="Pending">Pending</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[13px] font-medium text-[var(--figma-navy)]"
              htmlFor="order-payment"
            >
              Payment status
            </label>
            <select
              id="order-payment"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2.5">
          <OutlineButton onClick={onClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton
            icon="check"
            className="flex-[2]"
            disabled={isSaving || projectsLoading || sortedProjects.length === 0}
            onClick={() => void handleSubmit()}
          >
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Add order"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
