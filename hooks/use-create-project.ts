"use client";

import { useCallback } from "react";

import { authApiClient } from "@/lib/api/authenticated-client";
import { withTaskEndDate } from "@/lib/tasks/create-task-payload";
import type {
  CreateProjectRequest,
  CreateProjectStageInput,
  Project,
  ProjectMemberAssignRequest,
  ProjectWithMembers,
} from "@/types/projects";
import { PROJECT_LEAD_ROLE } from "@/types/projects";
import type { CreateTaskRequest } from "@/types/tasks";

export function useCreateProject() {
  const createProject = useCallback(
    async (
      payload: CreateProjectRequest,
      options?: {
        stages?: CreateProjectStageInput[];
        memberUserIds?: string[];
        projectLeadUserId?: string | null;
        /** Existing client id — used to correct the link if create minted a duplicate. */
        clientId?: string;
      }
    ) => {
      let project = await authApiClient<Project>("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Historical creates send status: INACTIVE; backend may ignore it and default to ACTIVE.
      if (payload.status === "INACTIVE" && project.status !== "INACTIVE") {
        project = await authApiClient<Project>(`/projects/${project.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "INACTIVE" }),
        });
        if (project.status !== "INACTIVE") {
          throw new Error(
            "Project was created but could not be marked historical (INACTIVE). It may appear under Active projects."
          );
        }
      }

      const desiredClientId = options?.clientId ?? payload.client?.id;
      // Safety net: re-link via /links if create still pointed at a different client,
      // then remove the orphan minted during create.
      if (desiredClientId && project.client?.id !== desiredClientId) {
        const mintedClientId = project.client?.id ?? null;
        await authApiClient(`/projects/${project.id}/links`, {
          method: "PATCH",
          body: JSON.stringify({ client_id: desiredClientId }),
        });
        if (mintedClientId && mintedClientId !== desiredClientId) {
          try {
            await authApiClient(`/clients/${mintedClientId}`, { method: "DELETE" });
          } catch {
            // Orphan cleanup is best-effort; project is already correctly linked.
          }
        }
        project = await authApiClient<Project>(`/projects/${project.id}`);
      }

      if (options?.stages?.length) {
        for (const stage of options.stages) {
          const taskPayload: CreateTaskRequest & { end_date?: string; duration?: string } = {
            project_id: project.id,
            title: stage.name,
            start_date: stage.start_date,
            end_date: stage.end_date,
            duration: stage.duration,
            order: stage.order,
            taskable_type: "STAGE",
            ...(stage.status ? { status: stage.status } : {}),
          };
          await authApiClient("/tasks", {
            method: "POST",
            body: JSON.stringify(withTaskEndDate(taskPayload)),
          });
        }
      }

      if (options?.memberUserIds?.length) {
        const uniqueIds = [...new Set(options.memberUserIds)];
        const leadId = options.projectLeadUserId ?? null;
        const membersPayload: ProjectMemberAssignRequest = {
          members: uniqueIds.map((user_id) => ({
            user_id,
            status: "ACTIVE",
            role: leadId && user_id === leadId ? PROJECT_LEAD_ROLE : "MEMBER",
          })),
        };
        await authApiClient<ProjectWithMembers>(`/projects/${project.id}/members`, {
          method: "PUT",
          body: JSON.stringify(membersPayload),
        });
      }

      return project;
    },
    []
  );

  return { createProject };
}
