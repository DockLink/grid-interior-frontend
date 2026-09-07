"use client";

import { useMemo, useState } from "react";

import { HoldRequestCard } from "@/components/hold-requests/hold-request-card";
import { useAuth } from "@/hooks/use-auth";
import { useHoldRequests } from "@/hooks/use-project-hold-requests";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  holdRequestStatusLabel,
  holdRequestStatusStyle,
} from "@/lib/hold-requests/display";
import { toSidebarRole } from "@/lib/navigation/sidebar-role";
import type { TaskableHoldRequestStatus } from "@/types/hold-requests";

type TabId = "queue" | "all" | "mine";

const STATUS_FILTERS: Array<{ id: TaskableHoldRequestStatus | "all"; label: string }> = [
  { id: "all", label: "All statuses" },
  { id: "PENDING", label: "Pending review" },
  { id: "APPROVED", label: "Approved" },
  { id: "APPROVED_MODIFIED", label: "Approved (modified)" },
  { id: "DECLINED", label: "Declined" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "EXPIRED", label: "Expired" },
];

export function GlobalHoldRequestsPage() {
  const { user, primaryRole } = useAuth();
  const authDisabled = isAuthDisabled();
  const sidebarRole = primaryRole ? toSidebarRole(primaryRole) : null;
  const canProcess = sidebarRole === "admin" || sidebarRole === "superadmin";

  const [tab, setTab] = useState<TabId>("queue");
  const [status, setStatus] = useState<TaskableHoldRequestStatus | "all">("all");

  const apiStatus = tab === "queue" ? ("PENDING" as const) : status === "all" ? undefined : status;

  const { requests, isLoading, isProcessing, error, processRequest } = useHoldRequests({
    status: apiStatus,
    requestedById: tab === "mine" ? user?.id : undefined,
    limit: 100,
  });

  const filtered = useMemo(() => {
    if (tab === "queue" || status === "all") return requests;
    return requests.filter((r) => r.status === status);
  }, [requests, tab, status]);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#16233D]">Hold Requests</h2>
        <p className="text-[14px] text-[#5B6B85]">Studio-wide pause queue for task timeline holds</p>
        {authDisabled && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            Live hold requests require auth. Copy <code className="font-mono">.env.local.example</code> to{" "}
            <code className="font-mono">.env.local</code> and set{" "}
            <code className="font-mono">NEXT_PUBLIC_ENABLE_AUTH=true</code>.
          </div>
        )}
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

      {tab !== "queue" && (
        <div className="mb-5 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatus(s.id)}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                background: status === s.id ? "rgba(15,168,160,0.12)" : "#F0F2F5",
                color: status === s.id ? "#0FA8A0" : "#5B6B85",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <p className="text-[13px] text-[#5B6B85]">Loading hold requests…</p>
      )}
      {error && <p className="text-[13px] text-red-600">{error}</p>}

      <div className="grid gap-3">
        {!isLoading && filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#E4E9F0] bg-white p-8 text-center text-[13px] text-[#5B6B85]">
            No hold requests in this view.
          </p>
        )}
        {filtered.map((req) => {
          const style = holdRequestStatusStyle(req.status);
          return (
            <div key={req.id} className="space-y-2">
              <div className="flex items-center justify-end px-1">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ background: style.bg, color: style.color }}
                >
                  {holdRequestStatusLabel(req.status)}
                </span>
              </div>
              <HoldRequestCard
                req={req}
                isProcessing={isProcessing === req.id}
                canProcess={canProcess}
                onProcess={processRequest}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
