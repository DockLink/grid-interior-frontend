"use client";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import type { Client } from "@/types/clients";

export function InvoicesTab({ client }: { client: Client }) {
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
        <div className="border-b border-[var(--figma-border)] px-4 py-3.5">
          <span className="text-[13px] font-bold text-[var(--figma-navy)]">Invoice History</span>
        </div>
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <MaterialIcon name="receipt_long" outlined size={40} className="text-[var(--figma-gray400)]" />
          <p className="m-0 text-sm font-medium text-[var(--figma-navy)]">No invoice records yet</p>
          <p className="m-0 max-w-md text-[13px] text-[var(--figma-gray500)]">
            Invoice tracking will appear here once the billing module is connected. Total invoiced on
            the client profile is synced from the server when available.
          </p>
        </div>
      </div>
    </div>
  );
}
