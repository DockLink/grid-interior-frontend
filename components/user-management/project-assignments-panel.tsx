"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DemoCaption } from "@/components/demo/demo-caption";
import { useProjects } from "@/hooks/use-projects";
import { useTeam } from "@/hooks/use-team";
import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { mapProjectMembersList } from "@/lib/projects/map-project-members";
import { queryKeys } from "@/lib/query/keys";
import { memberColorFromId } from "@/lib/team/map-team";
import type { StudioMember } from "@/lib/team/mock-team";
import type { ProjectMember, ProjectMemberAssignRequest } from "@/types/projects";

const T = {
  navy: "#1B2A4A",
  teal: "#0E7C86",
  success: "#3FA66B",
  border: "#E5E7EB",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
};

const S = {
  raised:
    "6px 6px 14px rgba(163,177,198,0.45), -4px -4px 10px rgba(255,255,255,0.90)",
  card: "8px 8px 20px rgba(163,177,198,0.40), -6px -6px 14px rgba(255,255,255,0.95)",
  inset:
    "inset 3px 3px 8px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.90)",
};

const PROJECT_COLORS = [
  "#0E7C86",
  "#0891B2",
  "#8B5CF6",
  "#059669",
  "#EC4899",
  "#D97706",
  "#7C3AED",
  "#BE185D",
];

function projectColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i)) % PROJECT_COLORS.length;
  }
  return PROJECT_COLORS[hash] ?? PROJECT_COLORS[0];
}

type AssignmentMember = {
  id: string;
  name: string;
  role: string;
  ini: string;
  color: string;
  projects: string[];
};

function toAssignmentMember(m: StudioMember, projectIds: string[]): AssignmentMember {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    ini: m.initials,
    color: m.color || memberColorFromId(m.id),
    projects: projectIds,
  };
}

export function ProjectAssignmentsPanel() {
  const authDisabled = isAuthDisabled();
  const qc = useQueryClient();
  const { members: studioMembers, isLoading: teamLoading, authDisabled: teamAuthOff } = useTeam();
  const { projects, isLoading: projectsLoading } = useProjects({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);

  const memberQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: queryKeys.projects.members(projectId),
      queryFn: async () => {
        const result = await authApiClient<{ members: ProjectMember[] }>(
          `/projects/${projectId}/members`,
        );
        return mapProjectMembersList(result);
      },
      staleTime: 30_000,
      enabled: !authDisabled && Boolean(projectId),
    })),
  });

  const membersLoading = memberQueries.some((q) => q.isLoading);

  const liveAssignments = useMemo(() => {
    const byUser = new Map<string, string[]>();
    memberQueries.forEach((q, idx) => {
      const projectId = projectIds[idx];
      if (!projectId || !q.data) return;
      for (const member of q.data) {
        if (member.status !== "ACTIVE") continue;
        const list = byUser.get(member.user_id) ?? [];
        list.push(projectId);
        byUser.set(member.user_id, list);
      }
    });
    return byUser;
  }, [memberQueries, projectIds]);

  const [team, setTeam] = useState<AssignmentMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<AssignmentMember | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) return;
    setTeam(
      studioMembers.map((m) =>
        toAssignmentMember(m, liveAssignments.get(m.id) ?? []),
      ),
    );
  }, [studioMembers, liveAssignments, dirty]);

  useEffect(() => {
    if (!selectedMember) return;
    const next = team.find((m) => m.id === selectedMember.id);
    if (next && next !== selectedMember) setSelectedMember(next);
  }, [team, selectedMember]);

  const projectCards = useMemo(
    () =>
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        color: projectColor(p.id),
      })),
    [projects],
  );

  const toggleProject = (memberId: string, projectId: string) => {
    setTeam((prev) =>
      prev.map((m) =>
        m.id !== memberId
          ? m
          : {
              ...m,
              projects: m.projects.includes(projectId)
                ? m.projects.filter((p) => p !== projectId)
                : [...m.projects, projectId],
            },
      ),
    );
    setSaved(false);
    setDirty(true);
  };

  const saveAssignments = useCallback(async () => {
    if (authDisabled) {
      setSaved(true);
      toast.message("Enable auth to persist assignments.");
      return;
    }
    if (!selectedMember) return;

    const original = liveAssignments.get(selectedMember.id) ?? [];
    const next = team.find((m) => m.id === selectedMember.id)?.projects ?? [];
    const originalSet = new Set(original);
    const nextSet = new Set(next);
    const changedProjects = projectIds.filter(
      (id) => originalSet.has(id) !== nextSet.has(id),
    );

    if (!changedProjects.length) {
      setSaved(true);
      setDirty(false);
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        changedProjects.map(async (projectId) => {
          const current =
            qc.getQueryData<ProjectMember[]>(queryKeys.projects.members(projectId)) ??
            [];
          const others = current
            .filter((m) => m.user_id !== selectedMember.id && m.status === "ACTIVE")
            .map((m) => ({
              user_id: m.user_id,
              status: "ACTIVE" as const,
              role: m.role === "PRU" || m.role === "VIEWER" ? m.role : ("MEMBER" as const),
            }));

          const shouldInclude = nextSet.has(projectId);
          const payload: ProjectMemberAssignRequest = {
            members: shouldInclude
              ? [
                  ...others,
                  {
                    user_id: selectedMember.id,
                    status: "ACTIVE",
                    role: "MEMBER",
                  },
                ]
              : others,
          };

          const result = await authApiClient(`/projects/${projectId}/members`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          qc.setQueryData(
            queryKeys.projects.members(projectId),
            mapProjectMembersList(result as { members?: ProjectMember[] }),
          );
        }),
      );
      setSaved(true);
      setDirty(false);
      toast.success("Assignments saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save assignments");
    } finally {
      setSaving(false);
    }
  }, [
    authDisabled,
    selectedMember,
    liveAssignments,
    team,
    projectIds,
    qc,
  ]);

  const loading = teamLoading || projectsLoading || membersLoading;

  return (
    <div style={{ padding: "28px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.navy,
              margin: "0 0 4px",
            }}
          >
            Project Assignments
          </h1>
          <p style={{ fontSize: 12, color: T.gray500, margin: 0 }}>
            Assign team members to projects
          </p>
          {teamAuthOff || authDisabled ? <DemoCaption className="mt-1" /> : null}
          {loading ? (
            <p style={{ fontSize: 12, color: T.gray400, marginTop: 6 }}>Loading…</p>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div
          style={{
            width: 300,
            flexShrink: 0,
            background: T.white,
            borderRadius: 16,
            boxShadow: S.card,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: T.gray50,
              borderBottom: `1px solid ${T.border}`,
              fontSize: 12,
              fontWeight: 700,
              color: T.gray500,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Team Members
          </div>
          {team.map((member, idx) => (
            <button
              key={member.id}
              type="button"
              onClick={() =>
                setSelectedMember(selectedMember?.id === member.id ? null : member)
              }
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: selectedMember?.id === member.id ? `${T.teal}08` : T.white,
                border: "none",
                borderBottom: idx < team.length - 1 ? `1px solid ${T.border}` : "none",
                borderLeft:
                  selectedMember?.id === member.id
                    ? `3px solid ${T.teal}`
                    : "3px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all 150ms",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: member.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: S.raised,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: T.white }}>
                  {member.ini}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: selectedMember?.id === member.id ? T.teal : T.navy,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {member.name}
                </div>
                <div style={{ fontSize: 11, color: T.gray400 }}>{member.role}</div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 8,
                  background: `${T.teal}14`,
                  color: T.teal,
                  flexShrink: 0,
                }}
              >
                {member.projects.length}
              </span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          {!selectedMember ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 280,
                gap: 12,
                background: T.white,
                borderRadius: 16,
                boxShadow: S.card,
                color: T.gray400,
                fontSize: 13,
              }}
            >
              <span
                className="material-icons-outlined"
                style={{ fontSize: 44, color: T.gray200 }}
              >
                assignment_ind
              </span>
              <div>Select a team member to manage their project assignments</div>
            </div>
          ) : (
            <div
              style={{
                background: T.white,
                borderRadius: 16,
                boxShadow: S.card,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${T.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: selectedMember.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: S.raised,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.white }}>
                    {selectedMember.ini}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>
                    {selectedMember.name}
                  </div>
                  <div style={{ fontSize: 12, color: T.gray500 }}>{selectedMember.role}</div>
                </div>
              </div>

              <div style={{ padding: "16px 20px" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.gray500,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 14,
                  }}
                >
                  Assigned Projects
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 10,
                  }}
                >
                  {projectCards.map((project) => {
                    const member = team.find((m) => m.id === selectedMember.id)!;
                    const assigned = member.projects.includes(project.id);
                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => toggleProject(selectedMember.id, project.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 14px",
                          borderRadius: 12,
                          border: `2px solid ${assigned ? project.color : T.border}`,
                          background: assigned ? `${project.color}10` : T.white,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                          boxShadow: assigned ? S.raised : S.inset,
                          transition: "all 150ms",
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: assigned ? project.color : T.gray100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {assigned && (
                            <span
                              className="material-icons"
                              style={{ fontSize: 14, color: T.white }}
                            >
                              check
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: assigned ? 700 : 400,
                            color: assigned ? project.color : T.gray500,
                          }}
                        >
                          {project.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveAssignments()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 999,
                      border: "none",
                      background: `linear-gradient(135deg, ${T.teal}, #138f9b)`,
                      color: T.white,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: saving ? "wait" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span className="material-icons-outlined" style={{ fontSize: 16 }}>
                      save
                    </span>
                    {saving ? "Saving…" : "Save Assignments"}
                  </button>
                  {saved && (
                    <span
                      style={{
                        fontSize: 13,
                        color: T.success,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span
                        className="material-icons-outlined"
                        style={{ fontSize: 15 }}
                      >
                        check_circle
                      </span>
                      Saved!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
