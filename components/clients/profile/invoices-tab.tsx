"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useInvoices } from "@/hooks/use-invoices";
import type { Client, InvoiceStatus } from "@/types/clients";

function formatEuro(amount: number): string {
  return `€${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function UploadInvoiceModal({
  isUploading,
  onClose,
  onUpload,
}: {
  isUploading: boolean;
  onClose: () => void;
  onUpload: (payload: { file: File; amount: number; status: InvoiceStatus }) => Promise<unknown>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("Unpaid");

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please choose an invoice file");
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid amount greater than 0");
      return;
    }

    try {
      await onUpload({ file, amount: parsed, status });
      toast.success("Invoice uploaded successfully");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload invoice");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.20)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isUploading && onClose()}
    >
      <div
        className="hub-modal-in w-full max-w-[440px] rounded-[20px] bg-white px-8 py-7"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">Upload Invoice</h2>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
              Attach the invoice file and set amount &amp; status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--figma-navy)]">Amount (€)</label>
          <input
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
          <label className="text-[13px] font-medium text-[var(--figma-navy)]">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
          >
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="mb-5 rounded-xl border border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] p-4 text-center">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <MaterialIcon name="upload_file" outlined size={28} className="mb-2 text-[var(--figma-teal)]" />
          <p className="m-0 mb-2 text-[13px] text-[var(--figma-gray500)]">
            {file ? file.name : "PDF or image (PNG, JPG)"}
          </p>
          <GradientButton icon="upload" size="sm" onClick={() => inputRef.current?.click()}>
            {file ? "Change File" : "Choose File"}
          </GradientButton>
        </div>

        <div className="flex gap-2">
          <OutlineButton onClick={onClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton
            icon="check"
            className="flex-1"
            disabled={isUploading}
            onClick={() => void handleSubmit()}
          >
            {isUploading ? "Uploading…" : "Upload"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}

export function InvoicesTab({ client }: { client: Client }) {
  const { invoices, isLoading, uploadInvoice, isUploading } = useInvoices(client.id);
  const [showUpload, setShowUpload] = useState(false);

  const summary = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const received = invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = invoices
      .filter((inv) => inv.status !== "Paid")
      .reduce((sum, inv) => sum + inv.amount, 0);
    return { total, received, outstanding };
  }, [invoices]);

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-3.5">
        {[
          {
            label: "Total Invoiced",
            val: isLoading ? "…" : formatEuro(summary.total),
            icon: "receipt_long",
            color: "var(--figma-navy)",
          },
          {
            label: "Amount Received",
            val: isLoading ? "…" : formatEuro(summary.received),
            icon: "check_circle",
            color: "#3FA66B",
          },
          {
            label: "Outstanding",
            val: isLoading ? "…" : formatEuro(summary.outstanding),
            icon: "pending",
            color: "#D97706",
          },
        ].map((tile) => (
          <div key={tile.label} className="flex items-center gap-3.5 rounded-[14px] bg-white p-5 neu-card">
            <div
              className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] neu-inset"
              style={{ background: `${tile.color}12` }}
            >
              <MaterialIcon name={tile.icon} outlined size={20} style={{ color: tile.color }} />
            </div>
            <div>
              <div className="text-lg font-extrabold text-[var(--figma-navy)]">{tile.val}</div>
              <div className="text-[11px] text-[var(--figma-gray500)]">{tile.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[14px] bg-white neu-card">
        <div className="flex items-center justify-between border-b border-[var(--figma-border)] px-4 py-3.5">
          <span className="text-[13px] font-bold text-[var(--figma-navy)]">Invoice History</span>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            disabled={isUploading}
            className="flex cursor-pointer items-center gap-2 rounded-lg border-none bg-[var(--figma-navy)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <MaterialIcon name="upload" size={16} />
            Upload Invoice
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="m-0 text-sm font-medium text-[var(--figma-gray500)]">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <MaterialIcon name="receipt_long" outlined size={40} className="text-[var(--figma-gray400)]" />
            <p className="m-0 text-sm font-medium text-[var(--figma-navy)]">No invoices exist</p>
            <p className="m-0 max-w-md text-[13px] text-[var(--figma-gray500)]">
              There are currently no invoices for this client. Upload an invoice to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--figma-border)]">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100">
                    <MaterialIcon name="description" outlined size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--figma-navy)]">{invoice.fileName}</div>
                    <div className="text-xs text-[var(--figma-gray500)]">
                      {invoice.createdAt
                        ? new Date(invoice.createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--figma-navy)]">
                      {formatEuro(invoice.amount)}
                    </div>
                    <div className="text-xs font-medium text-gray-500">{invoice.status}</div>
                  </div>
                  {invoice.fileUrl && invoice.fileUrl !== "#" ? (
                    <a
                      href={invoice.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    >
                      <MaterialIcon name="download" size={16} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      aria-label="Download unavailable"
                    >
                      <MaterialIcon name="download" size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUpload ? (
        <UploadInvoiceModal
          isUploading={isUploading}
          onClose={() => setShowUpload(false)}
          onUpload={uploadInvoice}
        />
      ) : null}
    </div>
  );
}
