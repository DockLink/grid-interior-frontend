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

export type ConsultTaskStatusApi = "done" | "in-progress" | "pending";

export interface ConsultTask {
  id: string;
  title: string;
  assigneeId: string | null;
  status: "Done" | "In Progress" | "Pending" | string;
}

export interface ConsultRoom {
  id: string;
  name: string;
  length: string;
  width: string;
  height: string;
}

export interface ConsultInventoryItem {
  id: string;
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
  id: string;
  name: string;
  duration: string;
  date: string;
  size: string;
  storageFileId?: string | null;
  fileUrl?: string | null;
}

export interface ConsultComment {
  id: string;
  memberId: string;
  text: string;
  time: string;
}

/* ---------- API wire types ---------- */

export interface ConsultRoomApi {
  id: string;
  name: string;
  length: string;
  width: string;
  height: string;
  sort_order?: number;
}

export interface ConsultInventoryItemApi {
  id: string;
  name: string;
  spec: string;
  h: string;
  w: string;
  l: string;
  qty: string;
  notes: string;
  measured: boolean;
  sort_order?: number;
}

export interface ConsultNoteApi {
  id: string;
  author_user_id: string;
  text: string;
  created_at: string;
}

export interface ConsultAudioApi {
  id: string;
  name: string;
  duration: string;
  date: string;
  size: string;
  storage_file_id?: string | null;
  file_url?: string | null;
}

export interface ConsultTaskApi {
  id: string;
  title: string;
  assignee_user_id: string | null;
  status: ConsultTaskStatusApi | string;
  sort_order?: number;
}

export interface ConsultationAggregateResponse {
  rooms: ConsultRoomApi[];
  inventory: ConsultInventoryItemApi[];
  notes: ConsultNoteApi[];
  audio: ConsultAudioApi[];
  tasks: ConsultTaskApi[];
}

export interface ConsultRoomCreatePayload {
  name: string;
  length?: string;
  width?: string;
  height?: string;
}

export interface ConsultRoomUpdatePayload {
  name?: string;
  length?: string;
  width?: string;
  height?: string;
}

export interface ConsultInventoryCreatePayload {
  name: string;
  spec?: string;
  h?: string;
  w?: string;
  l?: string;
  qty?: string;
  notes?: string;
  measured?: boolean;
}

export type ConsultInventoryUpdatePayload = Partial<ConsultInventoryCreatePayload>;

export interface ConsultNoteCreatePayload {
  text: string;
}

export interface ConsultAudioCreatePayload {
  name: string;
  duration?: string;
  date?: string;
  size?: string;
  storage_file_id?: string | null;
  file_url?: string | null;
}

export interface ConsultTaskCreatePayload {
  title: string;
  assignee_user_id?: string | null;
  status?: ConsultTaskStatusApi;
}

export interface ConsultTaskUpdatePayload {
  title?: string;
  assignee_user_id?: string | null;
  status?: ConsultTaskStatusApi;
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
