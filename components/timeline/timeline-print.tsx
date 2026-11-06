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
import { statusLabel } from "@/lib/timeline/timeline-export";

const GANTT_ROWS_PER_CHUNK = 9;

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
  if (!dates) return "—";
  return formatIsoLabel(edge === "start" ? dates.start : dates.end);
}

function phaseDurationLabel(phase: GanttPhase, projectStartIso?: string): string {
  const dates = resolvePhaseDates(phase, projectStartIso);
  if (!dates) return "—";
  const weeks = Math.max(1, Math.round(calendarDaysBetween(dates.start, dates.end) / 7));
  return `${weeks}w`;
}

function keyDateStatusLabel(status: ClientKeyDateCard["status"]): string {
  if (status === "completed") return "Completed";
  if (status === "active") return "In progress";
  return "Upcoming";
}

function clampBarPercent(left: number, width: number): { left: number; width: number } | null {
  if (!Number.isFinite(left) || !Number.isFinite(width)) return null;
  if (left >= 100 || left + width <= 0) return null;
  const clampedLeft = Math.max(0, Math.min(100, left));
  const right = Math.max(0, Math.min(100, left + Math.max(width, 0)));
  const clampedWidth = Math.max(0.8, right - clampedLeft);
  if (clampedWidth <= 0) return null;
  return { left: clampedLeft, width: clampedWidth };
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

type GanttBodyRow =
  | { kind: "section"; label: string }
  | { kind: "phase"; html: string }
  | { kind: "sub"; html: string };

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
  const todayPct = Math.max(0, Math.min(100, (todayDays / axisSpanDays) * 100));
  const todayMark = showToday ? `<div class="today" style="left:${todayPct}%"></div>` : "";

  const monthCells = Array.from({ length: monthCount }, (_, index) => {
    const label = formatMonthLabel(addCalendarDays(chartStartIso, index * 28));
    return `<div class="gantt-month">${escapeHtml(label)}</div>`;
  }).join("");

  const headRow = `<tr class="gantt-head">
    <th class="gantt-label">Phase</th>
    <th class="gantt-track gantt-months-cell">
      <div class="gantt-months">${monthCells}${todayMark}</div>
    </th>
  </tr>`;

  const rows: GanttBodyRow[] = [];

  for (const phase of phases) {
    const dates = resolvePhaseDates(phase, projectStartIso);
    const color = safeColor(phase.color, "#0E7C86");
    const statusText =
      phase.status === "active" ? `${phase.progress}% done` : statusLabel(phase.status);
    let bar = `<span class="unscheduled">Unscheduled</span>`;
    if (dates) {
      const startOffset = calendarDaysBetween(chartStartIso, dates.start);
      const lengthDays = Math.max(1, calendarDaysBetween(dates.start, dates.end));
      const clamped = clampBarPercent(
        (startOffset / axisSpanDays) * 100,
        (lengthDays / axisSpanDays) * 100,
      );
      if (clamped) {
        const fill =
          phase.progress > 0 && phase.status !== "completed"
            ? `<span class="bar-fill" style="width:${Math.min(100, Math.max(0, phase.progress))}%"></span>`
            : "";
        const tone =
          phase.status === "completed"
            ? "bar-complete"
            : phase.status === "active"
              ? "bar-active"
              : "bar-upcoming";
        bar = `<div class="bar ${tone}" style="left:${clamped.left}%;width:${clamped.width}%;background:${color}">${fill}<span>${escapeHtml(phase.name)}</span></div>`;
      }
    }
    rows.push({
      kind: "phase",
      html: `<tr class="gantt-row">
        <td class="gantt-label">
          <div class="phase-name"><span class="swatch" style="background:${color}"></span>${escapeHtml(phase.name)}</div>
          <div class="phase-status">${escapeHtml(statusText)} · ${escapeHtml(phase.lead.name)}</div>
        </td>
        <td class="gantt-track">${todayMark}${bar}</td>
      </tr>`,
    });
  }

  if (overlapBars.length) {
    rows.push({ kind: "section", label: "Execution sub-stages" });
    const startShiftDays = projectStartIso
      ? calendarDaysBetween(chartStartIso, projectStartIso)
      : 0;
    for (const bar of overlapBars) {
      const color = bar.status === "blocked" ? "#FCA5A5" : safeColor(bar.color, "#1B2A4A");
      const clamped = clampBarPercent(
        ((bar.startWeek * 7 + startShiftDays) / axisSpanDays) * 100,
        (bar.durationWeeks * 7) / axisSpanDays * 100,
      );
      const opacity =
        bar.status === "upcoming" ? 0.35 : bar.status === "complete" ? 0.55 : 0.9;
      const barHtml = clamped
        ? `<div class="bar bar-sub" style="left:${clamped.left}%;width:${clamped.width}%;background:${color};opacity:${opacity}"></div>`
        : `<span class="unscheduled">Outside chart range</span>`;
      rows.push({
        kind: "sub",
        html: `<tr class="gantt-row gantt-sub">
          <td class="gantt-label">
            <div class="phase-name">${escapeHtml(bar.id)} ${escapeHtml(bar.name)}</div>
            <div class="phase-status">${escapeHtml(statusLabel(bar.status))}</div>
          </td>
          <td class="gantt-track">${todayMark}${barHtml}</td>
        </tr>`,
      });
    }
  }

  if (!rows.length) {
    return `<table class="gantt">
      <thead>${headRow}</thead>
      <tbody><tr><td class="gantt-empty" colspan="2">No stages to chart.</td></tr></tbody>
    </table>`;
  }

  const chunks: GanttBodyRow[][] = [];
  let current: GanttBodyRow[] = [];
  let bodyCount = 0;

  for (const row of rows) {
    if (row.kind === "section" && current.length) {
      chunks.push(current);
      current = [];
      bodyCount = 0;
    } else if (row.kind !== "section" && bodyCount >= GANTT_ROWS_PER_CHUNK && current.length) {
      chunks.push(current);
      current = [];
      bodyCount = 0;
    }
    current.push(row);
    if (row.kind !== "section") bodyCount += 1;
  }
  if (current.length) chunks.push(current);

  return chunks
    .map((chunk, index) => {
      const body = chunk
        .map((row) => {
          if (row.kind === "section") {
            return `<tr class="gantt-section-row"><td colspan="2" class="gantt-section">${escapeHtml(row.label)}</td></tr>`;
          }
          return row.html;
        })
        .join("");
      const chunkClass = index < chunks.length - 1 ? "gantt gantt-chunk" : "gantt";
      return `<table class="${chunkClass}">
        <thead>${headRow}</thead>
        <tbody>${body}</tbody>
      </table>`;
    })
    .join("");
}

const SHARED_PRINT_CSS = `
  html, body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  h2 { break-after: avoid; page-break-after: avoid; }
`;

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
    ${SHARED_PRINT_CSS}
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
    table.data { width: 100%; border-collapse: collapse; font-size: 11px; }
    table.data th { text-align: left; padding: 7px 8px; border-bottom: 2px solid #1B2A4A; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
    table.data td { padding: 7px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
    .section-page { break-before: page; page-break-before: always; }
    .gantt { width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 10px; margin-bottom: 10px; }
    .gantt-chunk { break-after: page; page-break-after: always; }
    .gantt-row, .gantt-head { break-inside: avoid; page-break-inside: avoid; }
    .gantt-label { width: 190px; padding: 6px 10px; border-right: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB; vertical-align: middle; font-size: 10px; }
    .gantt-head .gantt-label { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #6B7280; background: #F9FAFB; text-align: left; }
    .gantt-head .gantt-track { background: #F9FAFB; }
    .phase-name { font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 6px; }
    .phase-status { color: #6B7280; margin-top: 2px; text-transform: capitalize; }
    .swatch { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
    .gantt-track { position: relative; min-height: 34px; padding: 0; border-bottom: 1px solid #E5E7EB; vertical-align: middle; }
    .gantt-months-cell { padding: 0; }
    .gantt-months { display: flex; min-height: 28px; position: relative; }
    .gantt-month { flex: 1; border-right: 1px solid #E5E7EB; padding: 6px 6px; font-size: 9px; font-weight: 700; color: #6B7280; }
    .bar { position: absolute; top: 7px; height: 18px; border-radius: 9px; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; max-width: 100%; }
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
  <table class="data">
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

  <h2 class="section-page">Phases</h2>
  <table class="data">
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

  <h2 class="section-page">Milestones</h2>
  <table class="data">
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

  let printed = false;
  const triggerPrint = () => {
    if (printed || popup.closed) return;
    printed = true;
    try {
      popup.print();
    } catch {
      // Popup may already be closed by the user.
    }
  };

  const schedulePrint = () => {
    const fonts = popup.document.fonts;
    const afterLayout = () => {
      requestAnimationFrame(() => requestAnimationFrame(triggerPrint));
    };
    if (fonts?.ready) {
      void fonts.ready.then(afterLayout).catch(afterLayout);
    } else {
      afterLayout();
    }
  };

  if (popup.document.readyState === "complete") {
    schedulePrint();
  } else {
    popup.addEventListener("load", schedulePrint, { once: true });
  }
  window.setTimeout(triggerPrint, 2000);
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
      <table class="data">
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
    ${SHARED_PRINT_CSS}
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
    table.data { width: 100%; border-collapse: collapse; font-size: 11px; }
    table.data th { text-align: left; padding: 7px 8px; border-bottom: 2px solid #1B2A4A; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
    table.data td { padding: 7px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
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
  <table class="data">
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
  <table class="data">
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
