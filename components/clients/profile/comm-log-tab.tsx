"use client";

import Link from "next/link";
import { useState } from "react";

import { GradientButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { clientCommLogRoute } from "@/types/navigation";
import type { CommLogEntry } from "@/types/clients";
import { CommLogAttachmentChips } from "@/components/clients/comm-log-attachments";
import { cn } from "@/lib/utils";

const ICON_CFG = {
  call: { icon: "phone", color: "var(--figma-success)", bg: "rgba(63,166,107,0.10)" },
  email: { icon: "email", color: "var(--figma-teal)", bg: "rgba(14,124,134,0.10)" },
  meeting: { icon: "groups", color: "var(--figma-navy)", bg: "rgba(27,42,74,0.09)" },
} as const;

export function CommLogTab({
  clientId,
  entries,
  onLog,
  isLoading,
}: {
  clientId: string;
  entries: CommLogEntry[];
  onLog: () => void;
  isLoading?: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "call" | "email" | "meeting">("all");
  const filtered = entries.filter((e) => filter === "all" || e.type === filter);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "call", "email", "meeting"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border-none px-4 py-1.5 text-xs transition-all duration-150",
                filter === f ? "gi-gradient-cta font-semibold text-white" : "bg-[var(--figma-gray100)] font-normal text-[var(--figma-gray500)]",
              )}
            >
              {f === "all" ? "All" : `${f.charAt(0).toUpperCase()}${f.slice(1)}s`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Link
            href={clientCommLogRoute(clientId)}
            className="flex items-center gap-1 rounded-full border border-[var(--figma-border)] bg-white px-4 py-2 text-xs font-medium text-[var(--figma-navy)] no-underline neu-raised"
          >
            Full log
            <MaterialIcon name="open_in_new" outlined size={13} />
          </Link>
          <GradientButton icon="add" size="sm" onClick={onLog}>
            Log Communication
          </GradientButton>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-[var(--figma-gray500)]">Loading communication log…</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--figma-gray500)]">No communication entries yet.</div>
        ) : (
          filtered.map((entry, i) => {
            const cfg = ICON_CFG[entry.type];
            return (
              <div key={entry.id} className="relative flex gap-3.5">
                {i < filtered.length - 1 ? (
                  <div className="absolute bottom-[-12px] left-[19px] top-11 z-0 w-0.5 bg-[var(--figma-border)]" />
                ) : null}
                <div
                  className="relative z-[1] flex size-10 shrink-0 items-center justify-center rounded-full neu-card"
                  style={{ background: cfg.bg }}
                >
                  <MaterialIcon name={cfg.icon} outlined size={18} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 rounded-xl border border-[rgba(229,231,235,0.5)] bg-white p-4 neu-card">
                  <div className="mb-2 flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold capitalize" style={{ color: cfg.color }}>
                        {entry.type}
                      </span>
                      <span className="text-[11px] text-[var(--figma-gray400)]">·</span>
                      <span className="text-xs text-[var(--figma-gray500)]">
                        {entry.date} · {entry.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex size-[22px] items-center justify-center rounded-full text-[9px] font-bold text-white gi-gradient-cta">
                        {entry.initials}
                      </div>
                      <span className="text-xs text-[var(--figma-gray500)]">{entry.member}</span>
                    </div>
                  </div>
                  {entry.note ? (
                    <p className="m-0 text-[13px] leading-relaxed text-[var(--figma-gray500)]">{entry.note}</p>
                  ) : null}
                  {entry.attachments?.length ? (
                    <div className={entry.note ? "mt-3" : undefined}>
                      <CommLogAttachmentChips attachments={entry.attachments} />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
