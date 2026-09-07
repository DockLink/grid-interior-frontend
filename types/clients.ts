export type ClientStatus = "Active" | "Lead" | "Past";
export type LeadSource = "Referral" | "Instagram" | "Website" | "Walk-in";
export type LeadStage = "new" | "meeting" | "proposal" | "won" | "lost";
export type PreferredContact = "Email" | "Phone" | "WhatsApp";

export type CommLogType = "call" | "email" | "meeting";
export type CommLogAttachmentKind = "pdf" | "word" | "image" | "audio";

/** API entity from backend */
export interface ClientApi {
  id: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  preferred_contact?: PreferredContact | null;
  status: ClientStatus;
  source?: LeadSource | null;
  stage?: LeadStage | null;
  linked_projects?: number;
  active_projects?: number;
  total_invoiced?: string | null;
  last_contact?: string | null;
  follow_up_date?: string | null;
  assigned_to?: string | null;
  assigned_to_id?: string | null;
  notes?: string | null;
  projects?: string[];
  deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** UI view — preserves display fields from mock era */
export interface Client {
  id: string;
  initials: string;
  color: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  preferredContact: PreferredContact;
  status: ClientStatus;
  source: LeadSource;
  stage?: LeadStage;
  linkedProjects: number;
  activeProjects: number;
  totalInvoiced: string;
  lastContact: string;
  followUpDate?: string;
  assignedTo: string;
  assignedInitials: string;
  notes?: string;
  projects?: string[];
  deleted?: boolean;
}

export interface CommLogAttachment {
  id: string;
  name: string;
  size: number;
  kind: CommLogAttachmentKind;
  mimeType: string;
  url?: string;
}

export interface CommLogEntryApi {
  id: string;
  type: CommLogType;
  date: string;
  time?: string | null;
  member?: string | null;
  member_id?: string | null;
  note: string;
  attachments?: CommLogAttachment[];
}

export interface CommLogEntry {
  id: string;
  type: CommLogType;
  date: string;
  time: string;
  member: string;
  initials: string;
  note: string;
  attachments?: CommLogAttachment[];
}

export interface ClientsListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientsListResponse {
  data: ClientApi[];
  meta: ClientsListMeta;
}

export interface ClientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
  source?: LeadSource;
  stage?: LeadStage;
  include_deleted?: boolean;
}

export interface CreateClientPayload {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  preferred_contact?: PreferredContact;
  status?: ClientStatus;
  source?: LeadSource;
  stage?: LeadStage;
  notes?: string;
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {
  deleted?: boolean;
  follow_up_date?: string | null;
  assigned_to_id?: string | null;
}

export type ClientLinkedProjectStatus = "active" | "completed" | "on-hold" | "on-track" | "at-risk";

export interface ClientLinkedProject {
  id: string;
  name: string;
  code: string;
  phase: string;
  status: ClientLinkedProjectStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  teamInitials: string[];
}

export interface ClientDocumentFolder {
  label: string;
  count: number;
  color: string;
  path: string;
}

export interface ClientDocumentFile {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  uploaderInitials: string;
  projectId: string;
  projectName: string;
  mimeType: string;
}

export interface CreateCommLogPayload {
  type: CommLogType;
  note: string;
  date?: string;
  time?: string;
  member_id?: string;
}

export interface PipelineCard {
  id: string;
  client: string;
  company: string;
  source: LeadSource;
  followUp: string;
  initials: string;
  overdue: boolean;
}

export interface LeadPipelineResponse {
  new: PipelineCard[];
  meeting: PipelineCard[];
  proposal: PipelineCard[];
  won: PipelineCard[];
  lost: PipelineCard[];
}
