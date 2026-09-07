"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { HoldRequestCard } from "@/components/hold-requests/hold-request-card";
import { useProjectContext } from "@/components/projects/project-context";
import { useHoldRequests } from "@/hooks/use-project-hold-requests";
import { useProjectMembers } from "@/hooks/use-project-members";

export default function ProjectHoldRequestsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { project } = useProjectContext();
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "all">("PENDING");
  const { effectiveRole } = useProjectMembers();
  const canProcess = effectiveRole === "admin" || effectiveRole === "lead";

  const { requests, isLoading, isProcessing, error, processRequest } = useHoldRequests({
    projectId,
    status: filter === "all" ? undefined : filter,
    limit: 50,
  });

  const tabs = [
    { id: "PENDING" as const, label: "Pending" },
    { id: "APPROVED" as const, label: "Approved" },
    { id: "all" as const, label: "All" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--ds-label)]">Hold Requests</h2>
        <p className="text-xs text-[var(--ds-secondary-label)]">
          {canProcess
            ? "Review and process hold requests submitted by team members."
            : "Hold requests submitted for tasks in this project."}
        </p>
      </div>

      <div className="flex w-fit gap-1 rounded-lg bg-[var(--ds-bg)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              filter === tab.id
                ? "bg-white text-[var(--ds-accent)] shadow-sm"
                : "text-[var(--ds-secondary-label)] hover:text-[var(--ds-secondary-label)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-sm text-[var(--ds-secondary-label)]">Loading hold requests…</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isLoading && requests.length === 0 && (
        <div className="rounded-xl border border-[var(--ds-separator)] bg-[var(--ds-surface-elevated)] px-6 py-12 text-center text-sm text-[var(--ds-secondary-label)]">
          No{filter === "PENDING" ? " pending" : filter === "APPROVED" ? " approved" : ""} hold
          requests for {project?.name ?? "this project"}.
        </div>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <HoldRequestCard
            key={req.id}
            req={req}
            isProcessing={isProcessing === req.id}
            canProcess={canProcess}
            onProcess={processRequest}
            projectName={project?.name}
          />
        ))}
      </div>
    </div>
  );
}
