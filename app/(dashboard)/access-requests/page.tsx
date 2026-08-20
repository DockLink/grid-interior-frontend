"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { useAccessRequests } from "@/hooks/use-access-requests";
import { authApiClient } from "@/lib/api/authenticated-client";
import { getPrimaryRole } from "@/lib/auth/rbac";
import { toSidebarRole } from "@/lib/navigation/sidebar-role";
import {
  accessRequestStatusLabel,
  accessRequestStatusStyle,
} from "@/lib/notifications/access-request-map";
import { toProjectsQueryString } from "@/lib/projects/query-string";
import {
  dsCallout,
  dsLargeTitle,
  dsSubtitle,
} from "@/lib/styles/dashboard-tokens";
import type { AccessRequest } from "@/types/access-requests";
import type { ProjectsListResponse } from "@/types/projects";
import { PROJECT_LEAD_ROLE } from "@/types/projects";

function requesterLabel(req: AccessRequest): string {
  const u = req.requestedBy;
  const name = [u?.firstName ?? u?.first_name, u?.lastName ?? u?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || u?.email || "Unknown user";
}

export default function AccessRequestsPage() {
  // ── MOCK DATA ──
  const [busyId, setBusyId] = useState<string | null>(null);
  const [visible, setVisible] = useState<AccessRequest[]>([
    {
      id: "req_1",
      projectId: "proj_1",
      project: { id: "proj_1", name: "Marchetti Villa" } as any,
      requestedById: "user_2",
      requestedBy: { id: "user_2", firstName: "Dania", lastName: "Sorour", email: "dania@grid-interior.ae" } as any,
      status: "PENDING",
      requestNote: "Need access to check the 3D renders for the living room.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "req_2",
      projectId: "proj_2",
      project: { id: "proj_2", name: "Al-Mansoori Suite" } as any,
      requestedById: "user_3",
      requestedBy: { id: "user_3", firstName: "Yuki", lastName: "Tanaka", email: "yuki@grid-interior.ae" } as any,
      status: "PENDING",
      requestNote: "Please grant access so I can update the timeline.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const canReview = true;
  const isLoading = false;
  const error = null;

  async function handleReview(
    req: AccessRequest,
    action: "approve" | "reject",
    grantedRole?: "MEMBER" | "VIEWER"
  ) {
    setBusyId(req.id);
    try {
      await new Promise(r => setTimeout(r, 600));
      setVisible(prev => prev.filter(r => r.id !== req.id));
      toast.success(
        action === "reject"
          ? "Access request rejected"
          : grantedRole === "VIEWER"
            ? "Limited access granted"
            : "Full access granted"
      );
    } catch (err) {
      toast.error("Failed to process request");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "rgba(0,122,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserPlus size={22} color="#0071E3" />
        </div>
        <div>
          <div style={dsLargeTitle}>Access Requests</div>
          <div style={{ ...dsSubtitle, marginTop: 6 }}>
            Review pending requests from team members who need project access.
          </div>
        </div>
      </div>

      {error && (
        <div style={{ ...dsCallout, color: "var(--ds-destructive)", background: "#FEE2E2", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {isLoading && <div style={dsCallout}>Loading access requests…</div>}

      {!isLoading && visible.length === 0 && (
        <div style={{ ...dsCallout, textAlign: "center", padding: "40px 20px", color: "var(--ds-secondary-label)" }}>
          No pending access requests.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((req) => {
          const style = accessRequestStatusStyle(req.status);
          const busy = busyId === req.id;
          return (
            <div
              key={req.id}
              style={{
                borderRadius: 12,
                border: "1px solid var(--ds-separator)",
                background: "var(--ds-surface-elevated)",
                padding: "16px 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ds-label)" }}>
                    {req.project?.name ?? "Project"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ds-secondary-label)", marginTop: 4 }}>
                    Requested by <strong>{requesterLabel(req)}</strong>
                  </div>
                  {req.requestNote && (
                    <div style={{ fontSize: 13, color: "var(--ds-secondary-label)", marginTop: 6, lineHeight: 1.45 }}>
                      {req.requestNote}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 8,
                    padding: "3px 10px",
                    background: style.bg,
                    color: style.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {accessRequestStatusLabel(req.status)}
                </span>
              </div>

              {req.status === "PENDING" && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleReview(req, "approve", "MEMBER")}
                    style={btnPrimary}
                  >
                    <Check size={14} /> {busy ? "Processing…" : "Grant full access"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleReview(req, "approve", "VIEWER")}
                    style={btnSecondary}
                  >
                    <Check size={14} /> Limited access
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleReview(req, "reject")}
                    style={btnDanger}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 34,
  padding: "0 14px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  border: "none",
  background: "#3D8B5E",
  color: "white",
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  border: "1px solid rgba(90,60,30,0.18)",
  background: "white",
  color: "var(--ds-secondary-label)",
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  border: "1px solid rgba(255,59,48,0.3)",
  background: "white",
  color: "#C0392B",
};
