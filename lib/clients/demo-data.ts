/**
 * Auth-disabled demo fixtures — not used in production API paths.
 * Keeps mock arrays out of component import paths.
 */
import type { Client, CommLogEntry, LeadPipelineResponse, LeadSource } from "@/types/clients";
import {
  CLIENTS,
  COMM_LOG,
  PIPELINE_CARDS,
} from "@/lib/clients/mock-clients";
import { mapClientApiToView } from "@/lib/clients/map-clients";

/** Demo clients mapped to live Client shape (string ids from numeric mock ids). */
export function getDemoClients(): Client[] {
  return CLIENTS.map((c) =>
    mapClientApiToView({
      id: String(c.id),
      name: c.name,
      company: c.company,
      phone: c.phone,
      email: c.email,
      address: c.address,
      preferred_contact: c.preferredContact,
      status: c.status,
      source: c.source,
      stage: c.stage,
      linked_projects: c.linkedProjects,
      active_projects: c.activeProjects,
      total_invoiced: c.totalInvoiced,
      last_contact: c.lastContact,
      follow_up_date: c.followUpDate,
      assigned_to: c.assignedTo,
      notes: c.notes,
      projects: c.projects,
      deleted: c.deleted,
    }),
  );
}

export function getDemoCommLog(clientId: string): CommLogEntry[] {
  return COMM_LOG.map((e) => ({
    ...e,
    id: String(e.id),
  }));
}

export function getDemoPipeline(): LeadPipelineResponse {
  const mapStage = (cards: typeof PIPELINE_CARDS.new) =>
    cards.map((c) => ({
      id: String(c.id),
      client: c.client,
      company: c.company,
      source: c.source as LeadSource,
      followUp: c.followUp,
      initials: c.initials,
      overdue: c.overdue,
    }));

  return {
    new: mapStage(PIPELINE_CARDS.new),
    meeting: mapStage(PIPELINE_CARDS.meeting),
    proposal: mapStage(PIPELINE_CARDS.proposal),
    won: mapStage(PIPELINE_CARDS.won),
    lost: mapStage(PIPELINE_CARDS.lost),
  };
}
