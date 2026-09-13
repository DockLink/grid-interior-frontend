/** Audit log entry from Nest GET /audit/actor/:actorId */
export interface AuditLogEntry {
  id: string;
  actor_id?: string;
  actorId?: string;
  action?: string;
  event?: string;
  message?: string;
  description?: string;
  resource?: string;
  resource_type?: string;
  resource_id?: string;
  created_at?: string;
  createdAt?: string;
  timestamp?: string;
  meta?: Record<string, unknown>;
}

export interface AuditActorListResponse {
  data?: AuditLogEntry[];
  items?: AuditLogEntry[];
}

export interface UserActivityItem {
  id: string;
  text: string;
  at: string;
}
