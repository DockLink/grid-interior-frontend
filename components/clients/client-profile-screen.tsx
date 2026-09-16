"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DemoCaption } from "@/components/demo/demo-caption";
import {
  ClientAvatar,
  ClientStatusBadge,
  GradientButton,
} from "@/components/clients/client-ui";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { FollowUpPanel } from "@/components/clients/follow-up-panel";
import { LogCommModal } from "@/components/clients/log-comm-modal";
import { CommLogTab } from "@/components/clients/profile/comm-log-tab";
import { InvoicesTab } from "@/components/clients/profile/invoices-tab";
import { LinkedProjectsTab } from "@/components/clients/profile/linked-projects-tab";
import { OverviewTab } from "@/components/clients/profile/overview-tab";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useClient } from "@/hooks/use-client";
import { useClientProjects } from "@/hooks/use-client-projects";
import { useClients } from "@/hooks/use-clients";
import { useCommLog } from "@/hooks/use-comm-log";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { getDemoClients, getDemoCommLog } from "@/lib/clients/demo-data";
import { NAV_ROUTES } from "@/types/navigation";
import type { Client, CreateCommLogPayload } from "@/types/clients";
import { cn } from "@/lib/utils";

type Tab = "overview" | "comms" | "projects" | "invoices";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "person" },
  { id: "comms", label: "Communication Log", icon: "forum" },
  { id: "projects", label: "Linked Projects", icon: "folder_open" },
  { id: "invoices", label: "Invoices", icon: "receipt_long" },
];

const DEMO_CLIENTS = getDemoClients();

function AuthCallout() {
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
      Live client profile requires auth. Copy <code className="font-mono">.env.local.example</code> to{" "}
      <code className="font-mono">.env.local</code> and set{" "}
      <code className="font-mono">NEXT_PUBLIC_ENABLE_AUTH=true</code>. Showing demo profile below.
    </div>
  );
}

export function ClientProfileScreen({
  clientId,
  initialTab = "overview",
}: {
  clientId: string;
  initialTab?: Tab;
}) {
  const router = useRouter();
  const authDisabled = isAuthDisabled();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { client: fetchedClient, isLoading: clientLoading, error: clientError } = useClient(clientId);
  const { updateClient, deleteClient, isUpdating, isDeleting } = useClients(
    { page: 1, limit: 1 },
    { enabled: false },
  );
  const { entries: liveEntries, isLoading: logLoading, error: logError, createEntry, isCreating } =
    useCommLog(clientId);
  const {
    projects: linkedProjects,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useClientProjects(authDisabled ? null : clientId);

  const client = useMemo(() => {
    if (authDisabled) {
      return DEMO_CLIENTS.find((c) => c.id === clientId) ?? DEMO_CLIENTS[0];
    }
    return fetchedClient;
  }, [authDisabled, clientId, fetchedClient]);

  const entries = authDisabled ? getDemoCommLog(clientId) : liveEntries;
  const isLoading = !authDisabled && clientLoading;
  const error = !authDisabled ? (clientError ?? logError) : null;

  const handleSaveLog = async (payload: CreateCommLogPayload) => {
    if (authDisabled) {
      setShowLogModal(false);
      return;
    }
    try {
      await createEntry(payload);
      toast.success("Communication logged");
      setShowLogModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save log entry");
    }
  };

  const handleDelete = async () => {
    if (authDisabled || !client) return;
    if (!window.confirm(`Delete ${client.name}? This can be restored from deleted records.`)) return;
    try {
      await deleteClient(clientId);
      toast.success("Client deleted");
      router.push(NAV_ROUTES.clients);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete client");
    }
  };

  const refreshProjects = () => {
    void refetchProjects();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center px-9 py-16 text-sm text-[var(--figma-gray500)]">
        Loading client profile…
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-9 py-16">
        {error ? <p className="m-0 text-sm text-red-600">{error}</p> : null}
        <p className="m-0 text-sm text-[var(--figma-gray500)]">Client not found.</p>
        <Link href={NAV_ROUTES.clients} className="text-[13px] text-[var(--figma-teal)]">
          Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full px-9 py-6">
      {authDisabled ? <DemoCaption className="mb-4" /> : null}
      {authDisabled ? <AuthCallout /> : null}

      {!authDisabled && error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

      <Link
        href={NAV_ROUTES.clients}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-[var(--figma-teal)] no-underline"
      >
        <MaterialIcon name="arrow_back" outlined size={16} />
        Back to Clients
      </Link>

      <div className="mb-5 flex items-start gap-6 rounded-2xl bg-white p-7 neu-card">
        <ClientAvatar initials={client.initials} color={client.color} size={80} />

        <div className="flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-2xl font-bold text-[var(--figma-navy)]">{client.name}</h1>
            <ClientStatusBadge status={client.status} />
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex items-center gap-1">
              <MaterialIcon name="business" outlined size={15} className="text-[var(--figma-teal)]" />
              <span className="text-sm text-[var(--figma-gray500)]">{client.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MaterialIcon name="email" outlined size={15} className="text-[var(--figma-gray400)]" />
              <span className="text-[13px] text-[var(--figma-gray500)]">{client.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <MaterialIcon name="phone" outlined size={15} className="text-[var(--figma-gray400)]" />
              <span className="text-[13px] text-[var(--figma-gray500)]">{client.phone}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--figma-gray500)]">
            <div className="flex items-center gap-1">
              <MaterialIcon name="schedule" outlined size={14} />
              Last contact: {client.lastContact}
            </div>
            <div className="h-3.5 w-px bg-[var(--figma-border)]" />
            <div className="flex items-center gap-1">
              <MaterialIcon name="sensors" outlined size={14} />
              {client.source}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 rounded-[10px] border border-[var(--figma-border)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--figma-navy)] neu-raised"
          >
            <MaterialIcon name="edit" outlined size={16} />
            Edit
          </button>
          {!authDisabled ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-[10px] border border-[var(--figma-border)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--figma-alert)] neu-raised disabled:opacity-60"
            >
              <MaterialIcon name="delete" outlined size={16} />
              Delete
            </button>
          ) : null}
          <GradientButton icon="notifications_active" size="sm" onClick={() => setShowFollowUp(true)}>
            Set Reminder
          </GradientButton>
        </div>
      </div>

      <div className="mb-6 inline-flex gap-1 rounded-xl border border-[var(--figma-border)] bg-[var(--figma-gray50)] p-1 neu-inset">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-[9px] border-none px-4 py-2 text-[13px] transition-all duration-200",
                isActive ? "bg-white font-semibold text-[var(--figma-navy)] neu-raised" : "bg-transparent font-normal text-[var(--figma-gray500)]",
              )}
            >
              <MaterialIcon
                name={tab.icon}
                outlined={!isActive}
                size={16}
                className={isActive ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
              />
              {tab.label}
              {isActive && tab.id === "comms" ? (
                <span className="rounded-lg bg-[var(--figma-teal)] px-1 py-px text-[10px] font-bold text-white">
                  {entries.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          client={client}
          projects={authDisabled ? [] : linkedProjects}
          projectsLoading={!authDisabled && projectsLoading}
        />
      )}
      {activeTab === "comms" && (
        <CommLogTab
          clientId={clientId}
          entries={entries}
          onLog={() => setShowLogModal(true)}
          isLoading={!authDisabled && logLoading}
        />
      )}
      {activeTab === "projects" && (
        <LinkedProjectsTab
          clientId={clientId}
          projects={authDisabled ? [] : linkedProjects}
          isLoading={!authDisabled && projectsLoading}
          onRefresh={refreshProjects}
        />
      )}
      {activeTab === "invoices" && <InvoicesTab client={client} />}

      {showLogModal ? (
        <LogCommModal
          onClose={() => setShowLogModal(false)}
          onSave={(payload) => void handleSaveLog(payload)}
          isSaving={isCreating}
          clientName={client.name}
          clientInitials={client.initials}
          clientColor={client.color}
        />
      ) : null}
      {showFollowUp ? <FollowUpPanel clientId={clientId} onClose={() => setShowFollowUp(false)} /> : null}
      {showEdit && !authDisabled ? (
        <ClientFormModal
          mode="edit"
          initialClient={client}
          onClose={() => setShowEdit(false)}
          isSaving={isUpdating}
          onSubmit={async (payload) => {
            await updateClient(clientId, payload);
            toast.success("Client updated");
            setShowEdit(false);
          }}
        />
      ) : null}
    </div>
  );
}
