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

function printedToday(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildTimelinePrintHtml(
  phases: GanttPhase[],
  milestones: Milestone[],
): string {
  const phaseRows = phases
    .map(
      (phase) => `<tr>
        <td>${escapeHtml(phase.name)}</td>
        <td>${escapeHtml(statusLabel(phase.status))}</td>
        <td>${escapeHtml(weekToDateLabel(phase.startWeek))}</td>
        <td>${escapeHtml(weekToDateLabel(phase.startWeek + phase.durationWeeks))}</td>
        <td>${phase.durationWeeks}w</td>
        <td>${phase.progress}%</td>
        <td>${escapeHtml(phase.lead.name)}</td>
        <td>${escapeHtml(phase.milestone ?? "—")}</td>
      </tr>`,
    )
    .join("");

  const milestoneRows = milestones
    .map(
      (m) => `<tr>
        <td>${escapeHtml(m.name)}</td>
        <td>${escapeHtml(m.date)}</td>
        <td>${escapeHtml(statusLabel(m.status))}</td>
        <td>${escapeHtml(m.phase)}</td>
        <td>${escapeHtml(m.notes ?? "—")}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(PROJECT_NAME)} — Project Timeline</title>
  <style>
    @page { margin: 14mm; }
    body { font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #1B2A4A; margin: 0; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 28px 0 10px; color: #0E7C86; text-transform: uppercase; letter-spacing: 0.06em; }
    .brand { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #0E7C86; font-weight: 700; margin-bottom: 12px; }
    .sub { font-size: 13px; color: #6B7280; margin: 0 0 6px; }
    .meta { font-size: 12px; color: #374151; margin: 0 0 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { text-align: left; padding: 8px 8px; border-bottom: 2px solid #1B2A4A; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 8px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
    .footer { margin-top: 28px; font-size: 11px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="brand">GRID Interior · Project Timeline</div>
  <h1>${escapeHtml(PROJECT_NAME)}</h1>
  <p class="sub">${escapeHtml(PROJECT_START)} → ${escapeHtml(PROJECT_END)}</p>
  <p class="meta">Exported ${escapeHtml(printedToday())} · Save as PDF from the print dialog</p>

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

export function openTimelinePrintWindow(
  phases: GanttPhase[],
  milestones: Milestone[],
): boolean {
  const popup = window.open("", "_blank", "width=960,height=720");
  if (!popup) return false;
  popup.opener = null;
  popup.document.open();
  popup.document.write(buildTimelinePrintHtml(phases, milestones));
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}
