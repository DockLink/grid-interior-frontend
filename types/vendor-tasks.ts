export type VendorPartyKind = "supplier" | "subvendor";
export type VendorTaskStatus = "todo" | "in-progress" | "done";

export interface VendorTaskApi {
  id: string;
  party_kind: VendorPartyKind;
  party_id: string;
  project_id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  due_date: string;
  status: VendorTaskStatus;
}

export interface VendorTask {
  id: string;
  partyKind: VendorPartyKind;
  partyId: string;
  projectId: string;
  title: string;
  description?: string;
  startDate?: string;
  dueDate: string;
  status: VendorTaskStatus;
}

export interface VendorPartyContact {
  name: string;
  company?: string;
  contactPerson?: string;
  email: string;
  phone: string;
}

export interface VendorTasksListResponse {
  data: VendorTaskApi[];
  total?: number;
}

export interface VendorTasksQueryParams {
  project_id?: string;
  party_id?: string;
  party_kind?: VendorPartyKind;
}

export interface CreateVendorTaskPayload {
  party_kind: VendorPartyKind;
  party_id: string;
  project_id: string;
  title: string;
  description?: string;
  start_date?: string;
  due_date: string;
  status?: VendorTaskStatus;
}

export interface UpdateVendorTaskPayload {
  title?: string;
  description?: string;
  start_date?: string;
  due_date?: string;
  status?: VendorTaskStatus;
}
