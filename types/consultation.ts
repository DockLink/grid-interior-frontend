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

/** Single measurement sketch / floor plan attached to a consultation. */
export interface ConsultSketch {
  id: string;
  fileName: string;
  uploadedAt: string;
  storageFileId?: string | null;
  fileUrl?: string | null;
}

export interface ConsultComment {
  id: string;
  memberId: string;
  text: string;
  time: string;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
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
  storage_file_id?: string | null;
  attachment_name?: string | null;
  /** Signed download URL resolved by the backend from storage_file_id. */
  attachment_url?: string | null;
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

export interface ConsultSketchApi {
  id: string;
  file_name: string;
  uploaded_at: string;
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
  /** Present when a measurement sketch has been uploaded; null/omitted when empty. */
  sketch?: ConsultSketchApi | null;
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
  /** Note body. May be empty when an attachment is provided. */
  text: string;
  /** Floating file UUID from POST /api/storage/upload (same as audio/sketch). */
  storage_file_id?: string | null;
  attachment_name?: string | null;
}

export interface ConsultAudioCreatePayload {
  name: string;
  duration?: string;
  date?: string;
  size?: string;
  /**
   * Project File UUID from multipart upload
   * (`POST /projects/:id/files/multipart/*`), NOT a floating `/storage/upload` token.
   * Backend `assertProjectFile` requires the file to belong to the project.
   */
  storage_file_id?: string | null;
  file_url?: string | null;
}

export interface ConsultSketchUpsertPayload {
  file_name: string;
  storage_file_id: string;
  uploaded_at?: string;
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

export interface ConsultationCompletePayload {
  notes?: string;
  date?: string;
  time?: string;
  mode?: ModeType;
  consult_type?: "free" | "paid";
}

export interface ConsultationCompleteResponse {
  stage: {
    id: string;
    status: string;
    title?: string;
  };
  next_stage?: {
    id: string;
    status: string;
    title?: string;
  } | null;
  note?: ConsultNoteApi | null;
  completed: boolean;
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
