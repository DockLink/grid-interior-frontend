"use client";

import { toast } from "sonner";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useInvoices } from "@/hooks/use-invoices";
import type { Client, Invoice } from "@/types/clients";

export function InvoicesTab({ client }: { client: Client }) {
  const { invoices, isLoading, uploadInvoice, isUploading } = useInvoices(client.id);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadInvoice({
        file,
        amount: 0,
        status: "Unpaid",
      });
      toast.success("Invoice uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload invoice");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-3.5">
        {[
          { label: "Total Invoiced", val: client.totalInvoiced || "—", icon: "receipt_long", color: "var(--figma-navy)" },
          { label: "Amount Received", val: "—", icon: "check_circle", color: "#3FA66B" },
          { label: "Outstanding", val: "—", icon: "pending", color: "#D97706" },
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
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--figma-navy)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
            <MaterialIcon name="upload" size={16} />
            {isUploading ? "Uploading..." : "Upload Invoice"}
            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} disabled={isUploading} />
          </label>
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
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--figma-navy)]">
                      €{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                      <MaterialIcon name="download" size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
