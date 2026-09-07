"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { Button } from "@/components/ui/button";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useUsers } from "@/hooks/use-users";
import { PROJECT_LEAD_ROLE } from "@/types/projects";
import { getUserInitials, getUserListPrimaryLabel } from "@/lib/user/display";

const MEMBER_COLORS = ["#0E7C86", "#7C3AED", "#0891B2", "#D97706", "#1B2A4A", "#BE185D"];

function memberColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i)) % MEMBER_COLORS.length;
  }
  return MEMBER_COLORS[hash] ?? MEMBER_COLORS[0];
}

export function ManageTeamModal({ onClose }: { onClose: () => void }) {
  const { members, projectLeadUserIds, updateMembers } = useProjectMembers();
  const { users, isLoading: usersLoading } = useUsers({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const studioUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          !u.roles.includes("GUEST") &&
          !u.roles.includes("CLIENT_FULL_ACCESS") &&
          u.status === "ACTIVE",
      ),
    [users],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [leadUserId, setLeadUserId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const active = members.filter((m) => m.status === "ACTIVE").map((m) => m.user_id);
    setSelectedIds(active);
    setLeadUserId(projectLeadUserIds[0] ?? active[0] ?? "");
  }, [members, projectLeadUserIds]);

  function toggleUser(userId: string) {
    setSelectedIds((prev) => {
      const next = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      if (!next.includes(leadUserId)) {
        setLeadUserId(next[0] ?? "");
      }
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateMembers(
        {
          members: selectedIds.map((user_id) => ({
            user_id,
            status: "ACTIVE" as const,
            role: user_id === leadUserId ? PROJECT_LEAD_ROLE : "MEMBER",
          })),
        },
        leadUserId ? [leadUserId] : [],
      );
      toast.success("Team updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/35"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-1/2 left-1/2 z-[201] w-[min(480px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6"
        style={{ boxShadow: "var(--neu-dropdown)" }}
        role="dialog"
        aria-labelledby="manage-team-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="manage-team-title"
              className="m-0 text-base font-semibold text-[var(--figma-navy)]"
            >
              Manage team
            </h2>
            <p className="mt-1 mb-0 text-[13px] text-[var(--figma-gray500)]">
              Assign studio members to this project.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border-0 bg-transparent text-[var(--figma-gray500)] hover:bg-[var(--figma-gray100)]"
            aria-label="Close"
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="mb-4 max-h-[320px] overflow-y-auto">
          {usersLoading && (
            <div className="py-4 text-[13px] text-[var(--figma-gray500)]">Loading users…</div>
          )}
          {!usersLoading && studioUsers.length === 0 && (
            <div className="py-4 text-[13px] text-[var(--figma-gray500)]">No active users found.</div>
          )}
          <div className="flex flex-col gap-2">
            {studioUsers.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              const name = getUserListPrimaryLabel(user);
              const initials = getUserInitials(user);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-[11px] text-left font-[inherit] transition-all duration-150"
                  style={{
                    background: isSelected ? "rgba(14,124,134,0.05)" : "#fff",
                    borderColor: isSelected ? "var(--figma-teal)" : "var(--figma-border)",
                    borderWidth: isSelected ? 2 : 1.5,
                  }}
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: memberColor(user.id) }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-[var(--figma-navy)]">{name}</div>
                    <div className="text-[11px] text-[var(--figma-gray500)]">
                      {user.roles[0] ?? "Member"}
                    </div>
                  </div>
                  <div
                    className="flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: isSelected ? "var(--figma-teal)" : "var(--figma-gray100)",
                      border: isSelected ? "none" : "1.5px solid var(--figma-border)",
                    }}
                  >
                    {isSelected && (
                      <MaterialIcon name="check" size={13} className="text-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">
              Project lead
            </label>
            <select
              value={leadUserId}
              onChange={(e) => setLeadUserId(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--figma-border)] bg-white px-3 text-[13px] text-[var(--figma-navy)]"
            >
              {selectedIds.map((id) => {
                const user = studioUsers.find((u) => u.id === id);
                return (
                  <option key={id} value={id}>
                    {user ? getUserListPrimaryLabel(user) : id}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="flex-1 bg-[var(--figma-teal)] text-white hover:bg-[#0a636b]"
          >
            {isSaving ? "Saving…" : "Save team"}
          </Button>
        </div>
      </div>
    </>
  );
}
