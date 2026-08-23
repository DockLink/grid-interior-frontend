"use client";

import { CheckSquare } from "lucide-react";

import type { AttentionItem } from "@/components/dashboard/studio/demo-data";
import { Button } from "@/components/ui/button";

function typeLabel(type: AttentionItem["type"]) {
  if (type === "access") return "Access Request";
  if (type === "hold") return "Hold Request";
  return "Task";
}

function typeColors(type: AttentionItem["type"]) {
  if (type === "access") return { bg: "rgba(15,168,160,0.1)", color: "#0FA8A0" };
  if (type === "hold") return { bg: "rgba(255,107,107,0.1)", color: "#FF6B6B" };
  return { bg: "rgba(11,37,69,0.08)", color: "#0B2545" };
}

export function AttentionPanel({
  items,
  title = "Needs Your Attention",
  onAction,
}: {
  items: AttentionItem[];
  title?: string;
  onAction?: (id: number, action: "approve" | "decline") => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E9F0] bg-white shadow-[0px_4px_16px_rgba(11,37,69,0.06)]">
      <div className="flex items-center justify-between border-b border-[#E4E9F0] px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#16233D]">{title}</h3>
          <p className="text-[12px] text-[#5B6B85]">
            {items.length} pending item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{
            background: items.length > 0 ? "#FDECEC" : "#E7F9EE",
            color: items.length > 0 ? "#FF6B6B" : "#2FBE6B",
          }}
        >
          {items.length > 0 ? `${items.length} pending` : "All clear"}
        </span>
      </div>

      <div className="divide-y divide-[#E4E9F0]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[rgba(11,37,69,0.06)]">
              <CheckSquare className="size-6 text-[#0B2545]" />
            </div>
            <div className="mb-1 text-[14px] font-semibold text-[#16233D]">
              You&apos;re all caught up
            </div>
            <div className="text-[12px] text-[#5B6B85]">
              No pending items at the moment.
            </div>
          </div>
        ) : (
          items.map((item) => {
            const colors = typeColors(item.type);
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold text-white"
                  style={{ background: item.color }}
                >
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-[#16233D]">
                      {item.requester}
                    </span>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={colors}
                    >
                      {typeLabel(item.type)}
                    </span>
                  </div>
                  <div className="truncate text-[11px] text-[#5B6B85]">
                    {item.project}
                    {item.detail ? ` · ${item.detail}` : ""} · {item.date}
                  </div>
                </div>
                {onAction && (item.type === "access" || item.type === "hold") ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      className="h-7 rounded-full bg-[#E7F9EE] px-3 text-[11px] font-semibold text-[#2FBE6B] hover:bg-[#d8f5e3]"
                      onClick={() => onAction(item.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 rounded-full bg-[#FDECEC] px-3 text-[11px] font-semibold text-[#FF6B6B] hover:bg-[#fadada]"
                      onClick={() => onAction(item.id, "decline")}
                    >
                      Decline
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
