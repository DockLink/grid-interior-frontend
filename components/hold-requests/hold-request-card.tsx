"use client";

import { useState } from "react";
import { Check, X, Play, Clock } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProcessHoldRequestPayload } from "@/hooks/use-project-hold-requests";
import {
  formatHoldDate,
  holdRequestStatusLabel,
  holdRequestStatusStyle,
} from "@/lib/hold-requests/display";
import type { TaskableHoldRequest } from "@/types/hold-requests";

export function HoldRequestCard({
  req,
  isProcessing,
  canProcess,
  onProcess,
  projectName,
}: {
  req: TaskableHoldRequest;
  isProcessing: boolean;
  canProcess: boolean;
  onProcess: (payload: ProcessHoldRequestPayload) => Promise<void>;
  projectName?: string;
}) {
  const [remark, setRemark] = useState("");
  const [adjustDates, setAdjustDates] = useState(false);
  const [adjStart, setAdjStart] = useState(
    (req.requestedStartDate || new Date().toISOString()).slice(0, 10),
  );
  const [adjEnd, setAdjEnd] = useState(
    (req.requestedEndDate || new Date().toISOString()).slice(0, 10),
  );
  const style = holdRequestStatusStyle(req.status);

  const isPending = req.status === "PENDING";
  const isApproved = req.status === "APPROVED" || req.status === "APPROVED_MODIFIED";
  const canApproveReject = canProcess && isPending;
  const canResume = canProcess && isApproved && !req.resumedAt;

  async function handle(action: ProcessHoldRequestPayload["action"]) {
    try {
      const payload: ProcessHoldRequestPayload = {
        taskableHoldRequestId: req.id,
        action,
        reviewRemark: remark.trim() || undefined,
      };
      if (action === "approve" && adjustDates) {
        if (new Date(adjEnd) < new Date(adjStart)) {
          toast.error("Adjusted end date must be on or after the start date");
          return;
        }
        payload.approvedStartDate = new Date(`${adjStart}T00:00:00`).toISOString();
        payload.approvedEndDate = new Date(`${adjEnd}T23:59:59`).toISOString();
      }
      await onProcess(payload);
      toast.success(
        action === "approve"
          ? "Hold request approved — task timeline extended"
          : action === "reject"
            ? "Hold request rejected"
            : "Task resumed — unused hold time released",
      );
      setRemark("");
      setAdjustDates(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process request");
    }
  }

  const taskTitle = req.task?.title?.trim() || "Task";

  return (
    <div className="rounded-xl border border-[var(--ds-separator)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="border-0 text-[11px]"
              style={{ background: style.bg, color: style.color }}
            >
              {holdRequestStatusLabel(req.status)}
            </Badge>
            <span className="text-xs text-[var(--ds-secondary-label)]">
              {req.requestedBy?.firstName ?? ""} {req.requestedBy?.lastName ?? ""}
              {req.requestedBy?.email ? ` · ${req.requestedBy.email}` : ""}
            </span>
          </div>
          <p className="text-sm font-medium text-[var(--ds-label)]">{taskTitle}</p>
          {projectName && (
            <p className="text-xs text-[var(--ds-secondary-label)]">{projectName}</p>
          )}
          <p className="mt-1 text-sm text-[var(--ds-label)]">{req.reason}</p>
          {req.requestedNote && (
            <p className="mt-0.5 text-xs text-[var(--ds-secondary-label)]">{req.requestedNote}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs text-[var(--ds-secondary-label)]">
          <Clock className="size-3" />
          <span>
            {formatHoldDate(req.requestedStartDate)} – {formatHoldDate(req.requestedEndDate)}
          </span>
        </div>
      </div>

      {req.adminNote && (
        <p className="mb-3 rounded-lg bg-[var(--ds-bg)] px-3 py-2 text-xs text-[var(--ds-secondary-label)]">
          <span className="font-medium">Admin note: </span>
          {req.adminNote}
        </p>
      )}

      {req.reviewedAt && (
        <p className="mb-2 text-xs text-[var(--ds-secondary-label)]">
          Reviewed {formatHoldDate(req.reviewedAt)}
          {req.appliedAt ? ` · Applied ${formatHoldDate(req.appliedAt)}` : ""}
          {req.resumedAt ? ` · Resumed ${formatHoldDate(req.resumedAt)}` : ""}
        </p>
      )}

      {(canApproveReject || canResume) && (
        <div className="mt-3 border-t border-[rgba(90,60,30,0.08)] pt-3">
          <input
            type="text"
            placeholder="Optional remark…"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="mb-2 w-full rounded-lg border border-[rgba(90,60,30,0.15)] bg-[var(--ds-bg)] px-3 py-1.5 text-xs placeholder-[#C4B5A5] outline-none"
          />

          {canApproveReject && (
            <div className="mb-2">
              <label className="flex items-center gap-2 text-xs text-[var(--ds-secondary-label)]">
                <input
                  type="checkbox"
                  checked={adjustDates}
                  onChange={(e) => setAdjustDates(e.target.checked)}
                />
                Adjust the approved timeline
              </label>
              {adjustDates && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={adjStart}
                      onChange={(e) => setAdjStart(e.target.value)}
                      className="flex-1 rounded-lg border border-[rgba(90,60,30,0.15)] bg-[var(--ds-bg)] px-2 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="date"
                      value={adjEnd}
                      min={adjStart}
                      onChange={(e) => setAdjEnd(e.target.value)}
                      className="flex-1 rounded-lg border border-[rgba(90,60,30,0.15)] bg-[var(--ds-bg)] px-2 py-1.5 text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {canApproveReject && (
              <>
                <Button
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => void handle("approve")}
                  className="h-7 gap-1 bg-[#3D8B5E] text-xs text-white hover:bg-[#2D7A4E]"
                >
                  <Check className="size-3" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => void handle("reject")}
                  className="h-7 gap-1 border-red-200 text-xs text-red-600 hover:bg-red-50"
                >
                  <X className="size-3" /> Reject
                </Button>
              </>
            )}
            {canResume && (
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={() => void handle("resume")}
                className="h-7 gap-1 bg-[var(--ds-accent)] text-xs text-white hover:bg-[#C4956A]"
              >
                <Play className="size-3" /> Resume task
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
