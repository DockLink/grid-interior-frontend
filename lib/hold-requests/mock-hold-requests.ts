export type GlobalHoldStatus = "pending" | "approved" | "rejected" | "resumed";

export interface GlobalHoldRequest {
  id: string;
  project: string;
  task: string;
  requester: string;
  requesterInitials: string;
  status: GlobalHoldStatus;
  requestedStart: string;
  requestedEnd: string;
  originalStart: string;
  originalEnd: string;
  reason: string;
  mine: boolean;
}

export const HOLD_STATUS_CFG: Record<
  GlobalHoldStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Pending", color: "#D97706", bg: "rgba(245,158,11,0.12)" },
  approved: { label: "Approved", color: "#2FBE6B", bg: "rgba(47,190,107,0.12)" },
  rejected: { label: "Rejected", color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" },
  resumed: { label: "Resumed", color: "#5B6B85", bg: "rgba(91,107,133,0.12)" },
};

export const MOCK_GLOBAL_HOLDS: GlobalHoldRequest[] = [
  {
    id: "h1",
    project: "Lumière Penthouse",
    task: "Joinery shop drawings",
    requester: "Priya Shah",
    requesterInitials: "PS",
    status: "pending",
    requestedStart: "18 Aug 2026",
    requestedEnd: "29 Aug 2026",
    originalStart: "4 Aug 2026",
    originalEnd: "15 Aug 2026",
    reason: "Client delayed marble selection — need two extra weeks.",
    mine: false,
  },
  {
    id: "h2",
    project: "Noir Boutique Hotel",
    task: "Lighting package",
    requester: "Luca Bianchi",
    requesterInitials: "LB",
    status: "pending",
    requestedStart: "22 Aug 2026",
    requestedEnd: "5 Sep 2026",
    originalStart: "11 Aug 2026",
    originalEnd: "25 Aug 2026",
    reason: "Supplier lead time slipped on custom pendants.",
    mine: true,
  },
  {
    id: "h3",
    project: "Verdant Residence",
    task: "Soft furnishings",
    requester: "Noah Adler",
    requesterInitials: "NA",
    status: "approved",
    requestedStart: "1 Aug 2026",
    requestedEnd: "12 Aug 2026",
    originalStart: "20 Jul 2026",
    originalEnd: "31 Jul 2026",
    reason: "Fabric mill closed for summer holiday.",
    mine: false,
  },
  {
    id: "h4",
    project: "Cascade Spa",
    task: "Wet-area waterproofing",
    requester: "Elena Rossi",
    requesterInitials: "ER",
    status: "rejected",
    requestedStart: "10 Aug 2026",
    requestedEnd: "20 Aug 2026",
    originalStart: "4 Aug 2026",
    originalEnd: "14 Aug 2026",
    reason: "Hold would slip handover — use overtime instead.",
    mine: false,
  },
  {
    id: "h5",
    project: "Atrium Office HQ",
    task: "Reception millwork",
    requester: "Kenji Watanabe",
    requesterInitials: "KW",
    status: "resumed",
    requestedStart: "1 Jul 2026",
    requestedEnd: "10 Jul 2026",
    originalStart: "20 Jun 2026",
    originalEnd: "30 Jun 2026",
    reason: "Permit delay resolved early.",
    mine: true,
  },
];
