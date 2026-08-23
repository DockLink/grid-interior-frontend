"use client";

import { useMemo, useState } from "react";

import { DemoCaption } from "@/components/demo/demo-caption";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetCloseButton,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  HOLD_STATUS_CFG,
  MOCK_GLOBAL_HOLDS,
  type GlobalHoldRequest,
  type GlobalHoldStatus,
} from "@/lib/hold-requests/mock-hold-requests";

type TabId = "queue" | "all" | "mine";

export function GlobalHoldRequestsPage() {
  const [tab, setTab] = useState<TabId>("queue");
  const [status, setStatus] = useState<GlobalHoldStatus | "all">("all");
  const [selected, setSelected] = useState<GlobalHoldRequest | null>(null);

  const filtered = useMemo(() => {
    return MOCK_GLOBAL_HOLDS.filter((h) => {
      if (tab === "queue" && h.status !== "pending") return false;
      if (tab === "mine" && !h.mine) return false;
      if (status !== "all" && h.status !== status) return false;
      return true;
    });
  }, [tab, status]);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#16233D]">Hold Requests</h2>
        <p className="text-[14px] text-[#5B6B85]">Studio-wide pause queue — demo overlay</p>
        <DemoCaption className="mt-1" />
      </div>

      <div className="mb-4 flex w-fit gap-1 rounded-full bg-[#F0F2F5] p-1">
        {(
          [
            { id: "queue" as const, label: "Review Queue" },
            { id: "all" as const, label: "All" },
            { id: "mine" as const, label: "Mine" },
          ]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="rounded-full px-4 py-1.5 text-[12px] font-semibold"
            style={{
              background: tab === t.id ? "#fff" : "transparent",
              color: tab === t.id ? "#0B2545" : "#5B6B85",
              boxShadow: tab === t.id ? "0 1px 4px rgba(11,37,69,0.1)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected", "resumed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize"
            style={{
              background: status === s ? "rgba(15,168,160,0.12)" : "#F0F2F5",
              color: status === s ? "#0FA8A0" : "#5B6B85",
            }}
          >
            {s === "all" ? "All statuses" : HOLD_STATUS_CFG[s].label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#E4E9F0] bg-white p-8 text-center text-[13px] text-[#5B6B85]">
            No hold requests in this view.
          </p>
        )}
        {filtered.map((h) => {
          const cfg = HOLD_STATUS_CFG[h.status];
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setSelected(h)}
              className="rounded-2xl border border-[#E4E9F0] bg-white p-5 text-left hover:border-[#0FA8A0]"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#16233D]">{h.task}</p>
                  <p className="text-[12px] text-[#5B6B85]">{h.project}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
              <p className="text-[13px] text-[#5B6B85]">{h.reason}</p>
              <p className="mt-2 text-[12px] text-[#5B6B85]">
                {h.requester} · {h.requestedStart} → {h.requestedEnd}
              </p>
            </button>
          );
        })}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-white">
          <SheetHeader className="relative">
            <SheetTitle>{selected?.task}</SheetTitle>
            <SheetCloseButton onClick={() => setSelected(null)} />
          </SheetHeader>
          <SheetBody className="space-y-4 text-[13px]">
            <p className="text-[#5B6B85]">{selected?.project}</p>
            <p>{selected?.reason}</p>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F8FAFB] p-4">
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-[#5B6B85] uppercase">
                  Original
                </p>
                <p className="mt-1 font-medium text-[#16233D]">
                  {selected?.originalStart}
                  <br />
                  {selected?.originalEnd}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-[#5B6B85] uppercase">
                  Requested
                </p>
                <p className="mt-1 font-medium text-[#0FA8A0]">
                  {selected?.requestedStart}
                  <br />
                  {selected?.requestedEnd}
                </p>
              </div>
            </div>
            <p className="text-[#5B6B85]">Requested by {selected?.requester}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
