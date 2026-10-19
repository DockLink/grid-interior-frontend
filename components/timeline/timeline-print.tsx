import { parseCalendarDate, toCalendarDateIso } from "@/lib/projects/calendar-date";
import type { SiteOverlapBar } from "@/lib/projects/mock-execution";
import type {
  ClientKeyDateCard,
  ClientSubStageCard,
} from "@/lib/timeline/map-client-view";
import {
  PROJECT_END,
  PROJECT_NAME,
  PROJECT_START,
  type GanttPhase,
  type Milestone,
} from "@/lib/timeline/mock-timeline";
import { statusLabel, weekToDateLabel } from "@/lib/timeline/timeline-export";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeColor(value: string, fallback: string): string {
  if (/^#[0-9A-Fa-f]{3,8}$/.test(value)) return value;
  if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/.test(value)) {
    return value;
  }
  return fallback;
}

function printedToday(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function addCalendarDays(iso: string, days: number): string {
  const date = parseCalendarDate(iso);
  if (Number.isNaN(date.getTime())) return iso;
  date.setDate(date.getDate() + Math.round(days));
  return toCalendarDateIso(date);
}

function calendarDaysBetween(startIso: string, endIso: string): number {
  const start = parseCalendarDate(startIso);
  const end = parseCalendarDate(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function formatIsoLabel(iso: string): string {
  const date = parseCalendarDate(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonthLabel(iso: string): string {
  const date = parseCalendarDate(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function resolvePhaseDates(
  phase: GanttPhase,
  projectStartIso?: string,
): { start: string; end: string } | null {
  if (phase.scheduled === false && (!phase.startDate || !phase.endDate)) return null;
  const start =
    phase.startDate ||
    (projectStartIso ? addCalendarDays(projectStartIso, phase.startWeek * 7) : "");
  let end =
    phase.endDate ||
    (start ? addCalendarDays(start, Math.max(1, phase.durationWeeks) * 7) : "");
  if (!start || !end) return null;
  if (end <= start) end = addCalendarDays(start, 1);
  return { start, end };
}

function phaseDateLabel(phase: GanttPhase, edge: "start" | "end", projectStartIso?: string): string {
  const dates = resolvePhaseDates(phase, projectStartIso);
  if (dates) return formatIsoLabel(edge === "start" ? dates.start : dates.end);
  const week = edge === "start" ? phase.startWeek : phase.startWeek + phase.durationWeeks;
  return weekToDateLabel(week, projectStartIso);
}

function phaseDurationLabel(phase: GanttPhase, projectStartIso?: string): string {
  const dates = resolvePhaseDates(phase, projectStartIso);
  if (!dates) return `${phase.durationWeeks}w`;
  const weeks = Math.max(1, Math.round(calendarDaysBetween(dates.start, dates.end) / 7));
  return `${weeks}w`;
}

function keyDateStatusLabel(status: ClientKeyDateCard["status"]): string {
  if (status === "completed") return "Completed";
  if (status === "active") return "In progress";
  return "Upcoming";
}

export interface TimelinePrintMeta {
  projectName?: string;
  projectStartLabel?: string;
  projectEndLabel?: string;
  projectStartIso?: string;
  chartStartIso?: string;
  chartEndIso?: string;
  keyDates?: ClientKeyDateCard[];
  overlapBars?: SiteOverlapBar[];
}

function buildSummary(phases: GanttPhase[], milestones: Milestone[]) {
  const completedPhases = phases.filter((phase) => phase.status === "completed").length;
  const current = phases.find((phase) => phase.status === "active")?.name ?? "—";
  const doneMilestones = milestones.filter((item) => item.status === "completed").length;
  const overdue = milestones.filter((item) => item.status === "overdue").length;
  return [
    { label: "Phases Complete", value: `${completedPhases}/${phases.length}` },
    { label: "Current Phase", value: current },
    { label: "Milestones Done", value: `${doneMilestones}/${milestones.length}` },
    { label: "Overdue", value: String(overdue) },
  ];
}

function buildGanttHtml(
  phases: GanttPhase[],
  overlapBars: SiteOverlapBar[],
  projectStartIso: string | undefined,
  chartStartIso: string,
  chartEndIso: string,
): string {
  const axisDays = Math.max(7, calendarDaysBetween(chartStartIso, chartEndIso));
  const axisWeeks = Math.max(1, Math.ceil(axisDays / 7));
  const axisSpanDays = axisWeeks * 7;
  const monthCount = Math.max(1, Math.ceil(axisWeeks / 4));
  const todayIso = toCalendarDateIso(new Date());
  const todayDays = calendarDaysBetween(chartStartIso, todayIso);
  const showToday = todayDays >= 0 && todayDays <= axisSpanDays;
  const todayPct = (todayDays / axisSpanDays) * 100;
  const todayMark = showToday ? `<div class="today" style="left:${todayPct}%"></div>` : "";

  const monthCells = Array.from({ length: monthCount }, (_, index) => {
    const label = formatMonthLabel(addCalendarDays(chartStartIso, index * 28));
    return `<div class="gantt-month">${escapeHtml(label)}</div>`;
  }).join("");

  const phaseRows = phases
    .map((phase) => {
      const dates = resolvePhaseDates(phase, projectStartIso);
      const color = safeColor(phase.color, "#0E7C86");
      const statusText =
        phase.status === "active" ? `${phase.progress}% done` : statusLabel(phase.status);
      let bar = `<span class="unscheduled">Unscheduled</span>`;
      if (dates) {
        const startOffset = calendarDaysBetween(chartStartIso, dates.start);
        const lengthDays = Math.max(1, calendarDaysBetween(dates.start, dates.end));
        const left = (startOffset / axisSpanDays) * 100;
        const width = (lengthDays / axisSpanDays) * 100;
        const fill =
          phase.progress > 0 && phase.status !== "completed"
            ? `<span class="bar-fill" style="width:${Math.min(100, Math.max(0, phase.progress))}%"></span>`
            : "";
        const tone =
          phase.status === "completed" ? "bar-complete" : phase.status === "active" ? "bar-active" : "bar-upcoming";
        bar = `<div class="bar ${tone}" style="left:${left}%;width:${width}%;background:${color}">${fill}<span>${escapeHtml(phase.name)}</span></div>`;
      }
      return `<div class="gantt-row">
        <div class="gantt-label">
          <div class="phase-name"><span class="swatch" style="background:${color}"></span>${escapeHtml(phase.name)}</div>
          <div class="phase-status">${escapeHtml(statusText)} · ${escapeHtml(phase.lead.name)}</div>
        </div>
        <div class="gantt-track">${todayMark}${bar}</div>
      </div>`;
    })
    .join("");

  const startShiftDays = projectStartIso ? calendarDaysBetween(chartStartIso, projectStartIso) : 0;
  const subRows = overlapBars
    .map((bar) => {
      const color = bar.status === "blocked" ? "#FCA5A5" : safeColor(bar.color, "#1B2A4A");
      const left = ((bar.startWeek * 7 + startShiftDays) / axisSpanDays) * 100;
      const width = ((bar.durationWeeks * 7) / axisSpanDays) * 100;
      const opacity = bar.status === "upcoming" ? 0.35 : bar.status === "complete" ? 0.55 : 0.9;
      return `<div class="gantt-row gantt-sub">
        <div class="gantt-label">
          <div class="phase-name">${escapeHtml(bar.id)} ${escapeHtml(bar.name)}</div>
          <div class="phase-status">${escapeHtml(statusLabel(bar.status))}</div>
        </div>
        <div class="gantt-track">${todayMark}<div class="bar bar-sub" style="left:${left}%;width:${Math.max(width, 0.8)}%;background:${color};opacity:${opacity}"></div></div>
      </div>`;
    })
    .join("");

  const subSection = overlapBars.length
    ? `<div class="gantt-section">Execution sub-stages</div>${subRows}`
    : "";

  return `<div class="gantt">
    <div class="gantt-row gantt-head">
      <div class="gantt-label">Phase</div>
      <div class="gantt-track gantt-months">${monthCells}${todayMark}</div>
    </div>
    ${phaseRows || `<div class="gantt-empty">No stages to chart.</div>`}
    ${subSection}
  </div>`;
}

export function buildTimelinePrintHtml(
  phases: GanttPhase[],
  milestones: Milestone[],
  meta: TimelinePrintMeta = {},
): string {
  const projectName = meta.projectName ?? PROJECT_NAME;
  const projectStart = meta.projectStartLabel ?? PROJECT_START;
  const projectEnd = meta.projectEndLabel ?? PROJECT_END;
  const startIso = meta.projectStartIso;
  const chartStartIso = meta.chartStartIso || startIso || "2026-05-15";
  const chartEndIso = meta.chartEndIso || addCalendarDays(chartStartIso, 7 * 30);
  const keyDates = meta.keyDates ?? [];
  const overlapBars = meta.overlapBars ?? [];

  const summary = buildSummary(phases, milestones)
    .map(
      (item) => `<div class="stat">
        <div class="stat-value">${escapeHtml(item.value)}</div>
        <div class="stat-label">${escapeHtml(item.label)}</div>
      </div>`,
    )
    .join("");

  const keyDateRows = keyDates
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.label)}</td>
        <td>${escapeHtml(item.date)}</td>
        <td>${escapeHtml(keyDateStatusLabel(item.status))}</td>
      </tr>`,
    )
    .join("");

  const phaseRows = phases
    .map(
      (phase) => `<tr>
        <td>${escapeHtml(phase.name)}</td>
        <td>${escapeHtml(statusLabel(phase.status))}</td>
        <td>${escapeHtml(phaseDateLabel(phase, "start", startIso))}</td>
        <td>${escapeHtml(phaseDateLabel(phase, "end", startIso))}</td>
        <td>${escapeHtml(phaseDurationLabel(phase, startIso))}</td>
        <td>${phase.progress}%</td>
        <td>${escapeHtml(phase.lead.name)}</td>
        <td>${escapeHtml(phase.milestone ?? "—")}</td>
      </tr>`,
    )
    .join("");

  const milestoneRows = milestones
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.date)}</td>
        <td>${escapeHtml(statusLabel(item.status))}</td>
        <td>${escapeHtml(item.phase)}</td>
        <td>${escapeHtml(item.notes ?? "—")}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(projectName)} — Project Timeline</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #1B2A4A; margin: 0; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 13px; margin: 22px 0 8px; color: #0E7C86; text-transform: uppercase; letter-spacing: 0.06em; }
    .brand { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #0E7C86; font-weight: 700; margin-bottom: 10px; }
    .sub { font-size: 13px; color: #6B7280; margin: 0 0 4px; }
    .meta { font-size: 12px; color: #374151; margin: 0 0 14px; }
    .stats { display: flex; gap: 10px; margin-bottom: 8px; }
    .stat { flex: 1; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 10px; }
    .stat-value { font-size: 14px; font-weight: 800; }
    .stat-label { font-size: 10px; color: #6B7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { text-align: left; padding: 7px 8px; border-bottom: 2px solid #1B2A4A; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 7px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
    .gantt { border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
    .gantt-row { display: flex; border-bottom: 1px solid #E5E7EB; min-height: 34px; page-break-inside: avoid; }
    .gantt-head { background: #F9FAFB; min-height: 28px; }
    .gantt-label { width: 190px; flex-shrink: 0; padding: 6px 10px; border-right: 1px solid #E5E7EB; font-size: 10px; }
    .gantt-head .gantt-label { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #6B7280; }
    .phase-name { font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 6px; }
    .phase-status { color: #6B7280; margin-top: 2px; text-transform: capitalize; }
    .swatch { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .gantt-track { flex: 1; position: relative; min-height: 34px; }
    .gantt-months { display: flex; min-height: 28px; }
    .gantt-month { flex: 1; border-right: 1px solid #E5E7EB; padding: 6px 6px; font-size: 9px; font-weight: 700; color: #6B7280; }
    .bar { position: absolute; top: 7px; height: 18px; border-radius: 9px; overflow: hidden; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; }
    .bar span { position: relative; z-index: 1; padding: 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-upcoming { color: #1B2A4A; opacity: 0.85; }
    .bar-fill { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(255,255,255,0.35); }
    .bar-sub { top: 9px; height: 14px; }
    .today { position: absolute; top: 0; bottom: 0; width: 2px; background: #0E7C86; z-index: 2; }
    .unscheduled { position: absolute; left: 8px; top: 9px; font-size: 10px; color: #9CA3AF; }
    .gantt-section { padding: 6px 10px; font-size: 10px; font-weight: 700; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
    .gantt-sub .phase-name { font-weight: 600; color: #374151; }
    .gantt-empty { padding: 16px; font-size: 12px; color: #6B7280; }
    .footer { margin-top: 22px; font-size: 11px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="brand">GRID Interior · Project Timeline</div>
  <h1>${escapeHtml(projectName)}</h1>
  <p class="sub">${escapeHtml(projectStart)} → ${escapeHtml(projectEnd)}</p>
  <p class="meta">Exported ${escapeHtml(printedToday())} · Save as PDF from the print dialog</p>

  <div class="stats">${summary}</div>

  <h2>Key dates</h2>
  <table>
    <thead>
      <tr>
        <th>Key date</th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${keyDateRows || `<tr><td colspan="3">No key dates.</td></tr>`}
    </tbody>
  </table>

  <h2>Timeline</h2>
  ${buildGanttHtml(phases, overlapBars, startIso, chartStartIso, chartEndIso)}

  <h2>Phases</h2>
  <table>
    <thead>
      <tr>
        <th>Phase</th>
        <th>Status</th>
        <th>Start</th>
        <th>End</th>
        <th>Duration</th>
        <th>Progress</th>
        <th>Lead</th>
        <th>Milestone</th>
      </tr>
    </thead>
    <tbody>
      ${phaseRows || `<tr><td colspan="8">No phases to export.</td></tr>`}
    </tbody>
  </table>

  <h2>Milestones</h2>
  <table>
    <thead>
      <tr>
        <th>Milestone</th>
        <th>Date</th>
        <th>Status</th>
        <th>Phase</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${milestoneRows || `<tr><td colspan="5">No milestones to export.</td></tr>`}
    </tbody>
  </table>

  <p class="footer">GRID Interior CRM · Confidential</p>
</body>
</html>`;
}

function openPrintDocument(html: string): boolean {
  const popup = window.open("", "_blank", "width=1100,height=760");
  if (!popup) return false;
  popup.opener = null;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}

export function openTimelinePrintWindow(
  phases: GanttPhase[],
  milestones: Milestone[],
  meta: TimelinePrintMeta = {},
): boolean {
  return openPrintDocument(buildTimelinePrintHtml(phases, milestones, meta));
}

export interface ClientTimelinePrintData {
  projectName: string;
  projectStartLabel: string;
  projectEndLabel: string;
  overallProgress: number;
  keyDates: ClientKeyDateCard[];
  phases: GanttPhase[];
  siteCards: ClientSubStageCard[];
  siteProgress: number;
  showSiteSection: boolean;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function clientPhaseStatus(status: GanttPhase["status"]): string {
  if (status === "completed") return "Completed";
  if (status === "active") return "In progress";
  return "Upcoming";
}

function siteStatusLabel(status: ClientSubStageCard["status"]): string {
  if (status === "complete") return "Complete";
  if (status === "in-progress") return "In progress";
  if (status === "blocked") return "Blocked";
  return "Upcoming";
}

export function buildClientTimelinePrintHtml(data: ClientTimelinePrintData): string {
  const overall = clampPercent(data.overallProgress);
  const site = clampPercent(data.siteProgress);

  const keyDateRows = data.keyDates
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.label)}</td>
        <td>${escapeHtml(item.date)}</td>
        <td>${escapeHtml(keyDateStatusLabel(item.status))}</td>
      </tr>`,
    )
    .join("");

  const phaseRows = data.phases
    .map(
      (phase) => `<tr>
        <td>${escapeHtml(phase.name)}</td>
        <td>${escapeHtml(clientPhaseStatus(phase.status))}</td>
        <td>${clampPercent(phase.progress)}%</td>
      </tr>`,
    )
    .join("");

  const siteRows = data.siteCards
    .map(
      (card) => `<tr>
        <td>${escapeHtml(card.number)}</td>
        <td>${escapeHtml(card.name)}${card.checkpoint ? `<div class="note">Checkpoint</div>` : ""}</td>
        <td>${escapeHtml(card.detail || "—")}</td>
        <td>${escapeHtml(card.dateLabel || "—")}</td>
        <td>${escapeHtml(siteStatusLabel(card.status))}</td>
      </tr>`,
    )
    .join("");

  const siteSection = data.showSiteSection
    ? `<h2>Site execution · sub-stages</h2>
      <p class="sub">Live from project tasks · ${site}% site complete</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Sub-stage</th>
            <th>Detail</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${siteRows || `<tr><td colspan="5">No tasks under the Site / Execution stage yet.</td></tr>`}
        </tbody>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(data.projectName)} — Client Timeline</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    body { font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #1B2A4A; margin: 0; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 13px; margin: 22px 0 8px; color: #0E7C86; text-transform: uppercase; letter-spacing: 0.06em; }
    .brand { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #0E7C86; font-weight: 700; margin-bottom: 10px; }
    .sub { font-size: 12px; color: #6B7280; margin: 0 0 4px; }
    .meta { font-size: 12px; color: #374151; margin: 0 0 16px; }
    .progress { border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px 14px; margin-bottom: 6px; }
    .progress-label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .progress-label span:last-child { color: #0E7C86; }
    .track { height: 10px; border-radius: 5px; background: #F3F4F6; overflow: hidden; }
    .fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #1B2A4A, #0E7C86); }
    .range { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: #9CA3AF; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { text-align: left; padding: 7px 8px; border-bottom: 2px solid #1B2A4A; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 7px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
    .note { margin-top: 2px; font-size: 10px; font-weight: 700; color: #F26D6D; }
    .footer { margin-top: 22px; font-size: 11px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="brand">GRID Interior · Client Timeline</div>
  <h1>${escapeHtml(data.projectName)}</h1>
  <p class="sub">${escapeHtml(data.projectStartLabel)} → ${escapeHtml(data.projectEndLabel)}</p>
  <p class="meta">Exported ${escapeHtml(printedToday())} · Save as PDF from the print dialog</p>

  <div class="progress">
    <div class="progress-label">
      <span>Overall Project Progress</span>
      <span>${overall}%</span>
    </div>
    <div class="track"><div class="fill" style="width:${overall}%"></div></div>
    <div class="range">
      <span>${escapeHtml(data.projectStartLabel)}</span>
      <span>${escapeHtml(data.projectEndLabel)}</span>
    </div>
  </div>

  <h2>Key dates</h2>
  <table>
    <thead>
      <tr>
        <th>Key date</th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${keyDateRows || `<tr><td colspan="3">No key dates.</td></tr>`}
    </tbody>
  </table>

  <h2>Project phases</h2>
  <table>
    <thead>
      <tr>
        <th>Phase</th>
        <th>Status</th>
        <th>Progress</th>
      </tr>
    </thead>
    <tbody>
      ${phaseRows || `<tr><td colspan="3">No stages yet for this project.</td></tr>`}
    </tbody>
  </table>

  ${siteSection}

  <p class="footer">GRID Interior CRM · Client timeline · Confidential</p>
</body>
</html>`;
}

export function openClientTimelinePrintWindow(data: ClientTimelinePrintData): boolean {
  return openPrintDocument(buildClientTimelinePrintHtml(data));
}
