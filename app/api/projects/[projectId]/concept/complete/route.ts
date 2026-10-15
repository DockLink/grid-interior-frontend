import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import { findStageTaskable } from "@/lib/projects/seed-phases";
import type { Task, TasksListResponse } from "@/types/tasks";

type RouteContext = { params: Promise<{ projectId: string }> };

function asTaskList(raw: TasksListResponse | Task[]): Task[] {
  if (Array.isArray(raw)) return raw;
  return Array.isArray(raw?.data) ? raw.data : [];
}

/**
 * Marks the project's Concept Design STAGE as COMPLETED.
 * Uses the same PATCH /tasks/:id status update as consultation complete.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId } = await context.params;
  const authHeaders = { Authorization: authorization! };

  const listQuery = new URLSearchParams({
    page: "1",
    limit: "100",
    taskable_type: "STAGE",
    projects: JSON.stringify([projectId]),
  });

  const listResult = await backendFetch<TasksListResponse>(
    `/tasks?${listQuery.toString()}`,
    { method: "GET", headers: authHeaders },
  );

  if (!listResult.ok) {
    return NextResponse.json(listResult.error, { status: listResult.status });
  }

  const stages = asTaskList(listResult.data);
  const stage = findStageTaskable(stages, "Concept Design");

  if (!stage?.id) {
    return NextResponse.json(
      {
        statusCode: 404,
        message:
          "Concept Design stage not found. Open Manage stages and add a Concept Design stage first.",
        error: "Not Found",
      },
      { status: 404 },
    );
  }

  let updatedStage = stage;
  if (stage.status !== "COMPLETED") {
    const patchResult = await backendFetch<Task>(`/tasks/${stage.id}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ status: "COMPLETED" }),
    });

    if (!patchResult.ok) {
      return NextResponse.json(patchResult.error, { status: patchResult.status });
    }

    updatedStage = patchResult.data;
    if (updatedStage.status !== "COMPLETED") {
      return NextResponse.json(
        {
          statusCode: 502,
          message:
            "Stage status update did not persist as COMPLETED. Check PATCH /v2/tasks/:id accepts status for STAGE taskables.",
          error: "Bad Gateway",
        },
        { status: 502 },
      );
    }
  }

  const nextStage = stages
    .filter((s) => s.id !== stage.id && s.status !== "COMPLETED")
    .sort((a, b) => a.order - b.order)[0];

  let nextStageUpdated: Task | null = null;
  if (nextStage && nextStage.status !== "IN_PROGRESS" && nextStage.status !== "IN_REVIEW") {
    const nextPatch = await backendFetch<Task>(`/tasks/${nextStage.id}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    if (nextPatch.ok) nextStageUpdated = nextPatch.data;
  }

  return NextResponse.json({
    stage: updatedStage,
    next_stage: nextStageUpdated,
    completed: true,
  });
}
