export type ConsultView =
  | "toggle"
  | "free"
  | "questionnaire"
  | "site"
  | "inventory"
  | "notes"
  | "audio";

export type ConsultViewInternal =
  | "toggle"
  | "free"
  | "paid-questionnaire"
  | "paid-site"
  | "paid-inventory"
  | "paid-notes"
  | "paid-audio";

export type ConsultType = "free" | "paid" | null;
export type ModeType = "online" | "offline";
export type PaidTab = "questionnaire" | "site" | "inventory" | "notes" | "audio";

export interface ConsultTask {
  id: number;
  title: string;
  assigneeId: number;
  status: "Done" | "In Progress" | "Pending" | string;
}

export interface ConsultRoom {
  id: number;
  name: string;
  length: string;
  width: string;
  height: string;
}

export interface ConsultInventoryItem {
  id: number;
  name: string;
  spec: string;
  h: string;
  w: string;
  l: string;
  qty: string;
  notes: string;
  measured: boolean;
}

export interface ConsultAudioFile {
  id: number;
  name: string;
  duration: string;
  date: string;
  size: string;
}

export interface ConsultComment {
  id: number;
  memberId: number;
  text: string;
  time: string;
}

export function consultViewFromParam(view: string | undefined): ConsultView {
  const allowed: ConsultView[] = [
    "toggle",
    "free",
    "questionnaire",
    "site",
    "inventory",
    "notes",
    "audio",
  ];
  if (view && allowed.includes(view as ConsultView)) return view as ConsultView;
  return "toggle";
}

export function consultViewToInternal(view: ConsultView): ConsultViewInternal {
  if (view === "questionnaire") return "paid-questionnaire";
  if (view === "site") return "paid-site";
  if (view === "inventory") return "paid-inventory";
  if (view === "notes") return "paid-notes";
  if (view === "audio") return "paid-audio";
  return view;
}

export function paidTabFromView(view: ConsultView): PaidTab {
  if (view === "site") return "site";
  if (view === "inventory") return "inventory";
  if (view === "notes") return "notes";
  if (view === "audio") return "audio";
  return "questionnaire";
}

export function viewFromPaidTab(tab: PaidTab): ConsultView {
  if (tab === "site") return "site";
  if (tab === "inventory") return "inventory";
  if (tab === "notes") return "notes";
  if (tab === "audio") return "audio";
  return "questionnaire";
}
