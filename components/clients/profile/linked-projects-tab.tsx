"use client";

import { useRouter } from "next/navigation";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { CLIENT_PROJECT_STATUS_CFG } from "@/lib/clients/map-client-projects";
import { projectRoute } from "@/types/navigation";
import type { ClientLinkedProject } from "@/types/clients";

export function LinkedProjectsTab({
  projects,
  isLoading,
}: {
  clientId: string;
  projects: ClientLinkedProject[];
  isLoading?: boolean;
  onRefresh?: () => void;
}) {
  const router = useRouter();

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-[var(--figma-gray500)]">Loading linked projects…</div>;
  }

  return (
    <div className="flex flex-col gap-3.5">
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--figma-border)] bg-white px-6 py-10 text-center">
          <MaterialIcon name="folder_off" outlined size={36} className="mb-2 text-[var(--figma-gray400)]" />
          <p className="m-0 text-sm text-[var(--figma-gray500)]">No projects linked to this client yet.</p>
        </div>
      ) : (
        projects.map((p) => {
          const sc = CLIENT_PROJECT_STATUS_CFG[p.status] ?? CLIENT_PROJECT_STATUS_CFG.active;
          return (
            <div key={p.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-[14px] bg-white p-5 neu-card">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-bold text-[var(--figma-navy)]">{p.name}</span>
                  <span
                    className="rounded-lg px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {sc.label}
                  </span>
                  <span className="rounded-lg bg-[rgba(27,42,74,0.06)] px-2.5 py-0.5 text-[11px] text-[var(--figma-navy)]">
                    {p.phase}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="mb-1 flex justify-between">
                    <span className="text-[11px] text-[var(--figma-gray500)]">Progress</span>
                    <span className="text-[11px] font-bold text-[var(--figma-navy)]">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-sm bg-[var(--figma-gray100)]">
                    <div className="h-full rounded-sm gi-gradient-cta" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex gap-4 text-[11px] text-[var(--figma-gray400)]">
                  <span className="flex items-center gap-1">
                    <MaterialIcon name="play_circle" outlined size={13} />
                    Started: {p.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MaterialIcon name="event" outlined size={13} />
                    Updated: {p.dueDate}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-end">
                <button
                  type="button"
                  onClick={() => router.push(projectRoute(p.id))}
                  className="flex items-center gap-1 rounded-2xl border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-1.5 text-xs text-[var(--figma-navy)] neu-raised"
                >
                  Open
                  <MaterialIcon name="arrow_forward" outlined size={13} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
