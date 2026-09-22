import { NextRequest, NextResponse } from "next/server";

import { requireAuthorization } from "@/lib/api/bff-auth";
import { backendFetch } from "@/lib/api/backend";
import type { ConsultNoteApi } from "@/types/consultation";
import type { Task, TasksListResponse } from "@/types/tasks";

type RouteContext = { params: Promise<{ projectId: string }> };

type CompleteBody = {
  notes?: string;
  date?: string;
  time?: string;
  mode?: string;
  consult_type?: "free" | "paid";
};

function findConsultationStage(tasks: Task[]): Task | undefined {
  const needle = "consultation";
  return (
    tasks.find((t) => (t.title ?? "").trim().toLowerCase() === needle) ??
    tasks.find((t) => (t.title ?? "").toLowerCase().includes(needle))
  );
}

function asTaskList(raw: TasksListResponse | Task[]): Task[] {
  if (Array.isArray(raw)) return raw;
  return Array.isArray(raw?.data) ? raw.data : [];
}

/**
 * Marks the project's Consultation STAGE as COMPLETED.
 * Optionally appends a consultation note with completion context.
 * Prefer Nest `POST /projects/:id/consultation/complete` once available.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const authorization = req.headers.get("authorization");
  const authError = requireAuthorization(authorization);
  if (authError) return authError;

  const { projectId } = await context.params;
  const body = (await req.json().catch(() => ({}))) as CompleteBody;
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
  const stage = findConsultationStage(stages);

  if (!stage?.id) {
    return NextResponse.json(
      {
        statusCode: 404,
        message:
          "Consultation stage not found. Open Manage stages and add a Consultation stage first.",
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

  let note: ConsultNoteApi | null = null;
  const trimmedNotes = body.notes?.trim();
  const metaParts = [
    body.consult_type ? `type=${body.consult_type}` : null,
    body.mode ? `mode=${body.mode}` : null,
    body.date ? `date=${body.date}` : null,
    body.time ? `time=${body.time}` : null,
  ].filter(Boolean);

  const noteText =
    trimmedNotes ||
    (metaParts.length
      ? `Consultation marked complete (${metaParts.join(", ")})`
      : "Consultation marked complete");

  if (trimmedNotes || metaParts.length) {
    const noteResult = await backendFetch<ConsultNoteApi>(
      `/projects/${projectId}/consultation/notes`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ text: noteText }),
      },
    );
    if (noteResult.ok) {
      note = noteResult.data;
    }
    // Note failure should not roll back a successful stage completion.
  }

  // Best-effort: promote the next incomplete stage to IN_PROGRESS.
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
    note,
    completed: true,
  });
}
