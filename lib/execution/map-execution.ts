import type {
  EndedAfterBoqResponse,
  ExecutionStageApi,
  ExecutionStageStatus,
  ExecutionStagesResponse,
  ExecutionSiteResponse,
  SiteSubStage,
  SiteSubStageApi,
  SiteSubStageStatus,
} from "@/types/execution";

const STAGE_STATUSES: ExecutionStageStatus[] = [
  "complete",
  "in-progress",
  "upcoming",
];

const SITE_STATUSES: SiteSubStageStatus[] = [
  "complete",
  "in-progress",
  "upcoming",
  "blocked",
];

export function asExecutionStageStatus(status: string): ExecutionStageStatus {
  const s = status.toLowerCase().replace(/_/g, "-");
  if (STAGE_STATUSES.includes(s as ExecutionStageStatus)) {
    return s as ExecutionStageStatus;
  }
  if (s === "completed") return "complete";
  return "upcoming";
}

export function asSiteSubStageStatus(status: string): SiteSubStageStatus {
  const s = status.toLowerCase().replace(/_/g, "-");
  if (SITE_STATUSES.includes(s as SiteSubStageStatus)) {
    return s as SiteSubStageStatus;
  }
  return "upcoming";
}

export function mapSiteSubStageApi(raw: SiteSubStageApi): SiteSubStage {
  return {
    id: raw.id,
    number: raw.number,
    name: raw.name,
    detail: raw.detail ?? "",
    status: asSiteSubStageStatus(raw.status),
    startDay: Number(raw.start_day) || 1,
    durationDays: Number(raw.duration_days) || 1,
    checkpoint: Boolean(raw.checkpoint),
    blockedBy: raw.blocked_by ?? undefined,
  };
}

export function mapExecutionSiteResponse(raw: ExecutionSiteResponse): {
  substages: SiteSubStage[];
  totalDays: number;
} {
  return {
    substages: (raw.substages ?? []).map(mapSiteSubStageApi),
    totalDays: Number(raw.total_days) || 52,
  };
}

export function mapExecutionStageApi(raw: ExecutionStageApi) {
  return {
    id: raw.id,
    name: raw.name,
    detail: raw.detail ?? "",
    status: asExecutionStageStatus(raw.status),
    taskableId: raw.taskable_id,
    order: raw.order ?? 0,
  };
}

export function mapExecutionStagesResponse(raw: ExecutionStagesResponse) {
  return (raw.stages ?? []).map(mapExecutionStageApi);
}

export function mapEndedAfterBoq(raw: EndedAfterBoqResponse): boolean {
  return Boolean(raw.ended_after_boq);
}

/** Next status when cycling a site substage card. */
export function nextSiteSubstageStatus(
  current: SiteSubStageStatus,
  blockedBy?: string,
): SiteSubStageStatus {
  if (current === "blocked") return "in-progress";
  if (current === "upcoming") return "in-progress";
  if (current === "in-progress") return "complete";
  return blockedBy ? "blocked" : "upcoming";
}
