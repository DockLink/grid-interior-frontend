import {
  displayVendorTaskStatus,
  formatVendorTaskDate,
  getVendorPartyContact,
  getVendorPartyName,
  todayIsoDate,
  type VendorPartyContact,
  type VendorPartyKind,
  type VendorTask,
} from "@/lib/suppliers/mock-vendor-tasks";

export interface VendorTasksPrintMeta {
  title: string;
  subtitle: string;
  party?: VendorPartyContact;
  projectLabel: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function partyLines(party: VendorPartyContact): string {
  const bits = [
    party.contactPerson ? `Contact: ${party.contactPerson}` : "",
    party.company ? party.company : "",
    party.email,
    party.phone,
  ].filter(Boolean);
  return bits.map(escapeHtml).join(" · ");
}

export function buildVendorTasksPrintHtml(meta: VendorTasksPrintMeta, tasks: VendorTask[]): string {
  const printed = formatVendorTaskDate(todayIsoDate());
  const showParty = !meta.party;
  const rows = tasks
    .map((task, index) => {
      const status = displayVendorTaskStatus(task);
      const partyCell = showParty
        ? `<td>${escapeHtml(getVendorPartyName(task.partyKind, task.partyId))}</td>`
        : "";
      return `<tr>
        <td>${index + 1}</td>
        ${partyCell}
        <td>${escapeHtml(task.title)}${task.description ? `<div class="desc">${escapeHtml(task.description)}</div>` : ""}</td>
        <td>${escapeHtml(formatVendorTaskDate(task.startDate))}</td>
        <td>${escapeHtml(formatVendorTaskDate(task.dueDate))}</td>
        <td>${escapeHtml(status.label)}</td>
        <td class="sign"></td>
      </tr>`;
    })
    .join("");

  const partyBlock = meta.party
    ? `<p class="meta"><strong>${escapeHtml(meta.party.name)}</strong>${partyLines(meta.party) ? ` · ${partyLines(meta.party)}` : ""}</p>`
    : "";
  const colCount = showParty ? 7 : 6;
  const partyHeader = showParty ? "<th>Party</th>" : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(meta.title)}</title>
  <style>
    @page { margin: 16mm; }
    body { font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #1B2A4A; margin: 0; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .brand { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #0E7C86; font-weight: 700; margin-bottom: 12px; }
    .sub { font-size: 13px; color: #6B7280; margin: 0 0 6px; }
    .meta { font-size: 12px; color: #374151; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; padding: 8px 10px; border-bottom: 2px solid #1B2A4A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 9px 10px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
    .desc { font-size: 11px; color: #6B7280; margin-top: 3px; }
    .sign { width: 110px; }
    .signs { display: flex; gap: 40px; margin-top: 36px; }
    .signs div { flex: 1; }
    .line { border-top: 1px solid #1B2A4A; margin-top: 40px; padding-top: 6px; font-size: 11px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="brand">GRID Interior · Tasks &amp; Deadlines</div>
  <h1>${escapeHtml(meta.title)}</h1>
  <p class="sub">${escapeHtml(meta.subtitle)}</p>
  ${partyBlock}
  <p class="meta">Project: ${escapeHtml(meta.projectLabel)} · Printed ${escapeHtml(printed)}</p>
  <table>
    <thead>
      <tr>
        <th>#</th>
        ${partyHeader}
        <th>Task</th>
        <th>Start</th>
        <th>Deadline</th>
        <th>Status</th>
        <th>Sign-off</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="${colCount}">No tasks to print.</td></tr>`}
    </tbody>
  </table>
  <div class="signs">
    <div class="line">Issued by (GRID)</div>
    <div class="line">Received by (contractor)</div>
    <div class="line">Date</div>
  </div>
</body>
</html>`;
}

export function openVendorTasksPrintWindow(meta: VendorTasksPrintMeta, tasks: VendorTask[]): boolean {
  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) return false;
  popup.opener = null;
  popup.document.open();
  popup.document.write(buildVendorTasksPrintHtml(meta, tasks));
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}

export function printMetaForParty(
  partyKind: VendorPartyKind,
  partyId: number,
  projectLabel: string,
): VendorTasksPrintMeta {
  const party = getVendorPartyContact(partyKind, partyId);
  return {
    title: `${party.name} — Tasks & Deadlines`,
    subtitle: "Handover sheet for on-site work. Sign and return a copy to GRID.",
    party,
    projectLabel,
  };
}
