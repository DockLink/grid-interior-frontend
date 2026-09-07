"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useClient } from "@/hooks/use-client";
import { useClients } from "@/hooks/use-clients";
import { useUsers } from "@/hooks/use-users";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { getDemoClients } from "@/lib/clients/demo-data";
import { getUserInitials, getUserListPrimaryLabel } from "@/lib/user/display";
import type { Client } from "@/types/clients";
import { cn } from "@/lib/utils";

const DEMO_TEAM = [
  { id: "demo-1", initials: "SM", name: "Sofia Marchetti", role: "Design Director", color: "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))" },
  { id: "demo-2", initials: "CR", name: "Chiara Romano", role: "Designer", color: "linear-gradient(135deg, var(--figma-teal), #0b9eab)" },
  { id: "demo-3", initials: "LP", name: "Lorenzo Pieri", role: "Project Coord.", color: "linear-gradient(135deg, #243458, var(--figma-navy))" },
];

const DEMO_CLIENTS = getDemoClients();

export function FollowUpPanel({
  clientId,
  onClose,
  onViewClient,
}: {
  clientId?: string;
  onClose: () => void;
  onViewClient?: (id: string) => void;
}) {
  const authDisabled = isAuthDisabled();
  const { client: fetchedClient, isLoading: clientLoading, error: clientError } = useClient(
    clientId ?? null,
    { enabled: Boolean(clientId) && !authDisabled },
  );
  const { clients: allClients, isLoading: listLoading, error: listError, updateClient, isUpdating } =
    useClients({ page: 1, limit: 100 });
  const { users } = useUsers({ page: 1, limit: 100, status: "ACTIVE" });

  const teamMembers = useMemo(() => {
    if (authDisabled) return DEMO_TEAM;
    return users.map((u, i) => ({
      id: u.id,
      initials: getUserInitials(u),
      name: getUserListPrimaryLabel(u),
      role: u.roles[0] ?? "Team Member",
      color: `linear-gradient(135deg, hsl(${i * 60 + 200}, 45%, 40%), var(--figma-teal))`,
    }));
  }, [authDisabled, users]);

  const followUpClients = useMemo(() => {
    const source = authDisabled ? DEMO_CLIENTS : allClients;
    return source.filter((c) => Boolean(c.followUpDate));
  }, [authDisabled, allClients]);

  const [selectedId, setSelectedId] = useState<string | null>(clientId ?? null);

  const client = useMemo(() => {
    if (clientId) {
      if (authDisabled) {
        return DEMO_CLIENTS.find((c) => c.id === clientId) ?? DEMO_CLIENTS[4];
      }
      return fetchedClient;
    }
    const id = selectedId ?? followUpClients[0]?.id;
    if (!id) return null;
    if (authDisabled) return DEMO_CLIENTS.find((c) => c.id === id) ?? DEMO_CLIENTS[4];
    return allClients.find((c) => c.id === id) ?? followUpClients.find((c) => c.id === id) ?? null;
  }, [clientId, selectedId, followUpClients, fetchedClient, allClients, authDisabled]);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [assignee, setAssignee] = useState(0);
  const [notes, setNotes] = useState("");
  const [notesFocus, setNotesFocus] = useState(false);
  const [dateFocus, setDateFocus] = useState(false);
  const [saved, setSaved] = useState(false);

  const isLoading = !authDisabled && (clientId ? clientLoading : listLoading);
  const error = !authDisabled ? (clientId ? clientError : listError) : null;

  const member = teamMembers[assignee] ?? teamMembers[0];

  const formatDate = (d: string) => {
    if (!d) return "[date]";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleSave = async () => {
    if (!client) return;
    if (authDisabled) {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
      return;
    }
    try {
      await updateClient(client.id, {
        follow_up_date: date,
        assigned_to_id: member?.id ?? null,
      });
      setSaved(true);
      toast.success("Reminder set");
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set reminder");
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="fixed inset-0 z-[200] bg-[rgba(27,42,74,0.12)] backdrop-blur-[1px]" onClick={onClose} aria-hidden />
        <div className="fixed bottom-0 right-0 top-0 z-[201] flex w-[420px] max-w-full items-center justify-center rounded-l-[20px] bg-white">
          <span className="text-sm text-[var(--figma-gray500)]">Loading…</span>
        </div>
      </>
    );
  }

  if (!client) {
    return (
      <>
        <div className="fixed inset-0 z-[200] bg-[rgba(27,42,74,0.12)] backdrop-blur-[1px]" onClick={onClose} aria-hidden />
        <div className="fixed bottom-0 right-0 top-0 z-[201] flex w-[420px] max-w-full flex-col items-center justify-center gap-3 rounded-l-[20px] bg-white px-7">
          {error ? <p className="m-0 text-center text-sm text-red-600">{error}</p> : null}
          <p className="m-0 text-center text-sm text-[var(--figma-gray500)]">No clients with follow-up reminders.</p>
          <button type="button" onClick={onClose} className="text-[13px] text-[var(--figma-teal)]">
            Close
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-[rgba(27,42,74,0.12)] backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="fixed bottom-0 right-0 top-0 z-[201] flex w-[420px] max-w-full flex-col overflow-hidden rounded-l-[20px] bg-white animate-[panelSlideIn_280ms_ease-out]"
        style={{ boxShadow: "-16px 0 48px rgba(163,177,198,0.40), -6px 0 16px rgba(163,177,198,0.20)" }}
      >
        <style>{`
          @keyframes panelSlideIn {
            from { transform: translateX(100%); opacity: 0.5; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        <div className="flex shrink-0 items-start justify-between border-b border-[var(--figma-border)] px-7 pb-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-[9px] gi-gradient-cta neu-raised">
              <MaterialIcon name="notifications_active" outlined size={18} />
            </div>
            <div>
              <h3 className="m-0 text-[17px] font-semibold text-[var(--figma-navy)]">Set Follow-up Reminder</h3>
              <p className="m-0 text-[11px] text-[var(--figma-gray400)]">Schedule a reminder for your team</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-[30px] items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={17} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        {!clientId && followUpClients.length > 1 ? (
          <div className="mx-7 mt-4 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--figma-navy)]">Client with reminder</label>
            <select
              value={client.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-xl border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
            >
              {followUpClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.followUpDate}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="mx-7 my-4 flex shrink-0 items-center gap-3 rounded-xl border border-[var(--figma-border)] bg-[var(--figma-gray50)] p-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white neu-raised"
            style={{ background: client.color }}
          >
            {client.initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--figma-navy)]">{client.name}</div>
            <div className="text-xs text-[var(--figma-gray500)]">{client.company}</div>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1.5">
            {onViewClient ? (
              <button
                type="button"
                onClick={() => {
                  onViewClient(client.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1 rounded-[14px] border border-[var(--figma-teal)] bg-transparent px-2.5 py-1 text-[11px] font-semibold text-[var(--figma-teal)]"
              >
                View Profile
                <MaterialIcon name="arrow_forward" outlined size={12} />
              </button>
            ) : null}
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                color: client.status === "Lead" ? "var(--figma-teal)" : "var(--figma-navy)",
                background: client.status === "Lead" ? "rgba(14,124,134,0.10)" : "rgba(27,42,74,0.09)",
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: client.status === "Lead" ? "var(--figma-teal)" : "var(--figma-navy)" }}
              />
              {client.status}
            </span>
          </div>
        </div>

        {error ? (
          <div className="mx-7 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-7">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--figma-navy)]">Reminder Date</label>
            <div className="relative">
              <MaterialIcon
                name="calendar_today"
                outlined
                size={17}
                className={cn(
                  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
                  dateFocus ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]",
                )}
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onFocus={() => setDateFocus(true)}
                onBlur={() => setDateFocus(false)}
                className={cn(
                  "w-full rounded-xl border-[1.5px] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--figma-navy)] outline-none transition-all duration-150",
                  dateFocus
                    ? "border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_3px_rgba(14,124,134,0.08)]"
                    : "border-[var(--figma-border)] neu-inset",
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--figma-navy)]">Assign to Team Member</label>
            <div className="flex flex-col gap-2">
              {teamMembers.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAssignee(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-[1.5px] p-2.5 text-left transition-all duration-150",
                    assignee === i
                      ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.06)] neu-card"
                      : "border-[var(--figma-border)] bg-white",
                  )}
                >
                  <div
                    className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: m.color }}
                  >
                    {m.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-[var(--figma-navy)]">{m.name}</div>
                    <div className="text-[11px] text-[var(--figma-gray400)]">{m.role}</div>
                  </div>
                  {assignee === i ? (
                    <MaterialIcon name="check_circle" size={18} className="text-[var(--figma-teal)]" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[var(--figma-navy)]">Notes</label>
              <span className="text-[11px] text-[var(--figma-gray400)]">Optional</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={() => setNotesFocus(true)}
              onBlur={() => setNotesFocus(false)}
              placeholder="What should the team member follow up on? Any context or talking points…"
              rows={4}
              className={cn(
                "w-full resize-y rounded-xl border-[1.5px] bg-white p-3 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none transition-all duration-150",
                notesFocus
                  ? "border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_3px_rgba(14,124,134,0.08)]"
                  : "border-[var(--figma-border)] neu-inset",
              )}
            />
          </div>

          <div className="flex items-start gap-2 rounded-[10px] border border-[rgba(14,124,134,0.15)] bg-[rgba(14,124,134,0.05)] p-2.5">
            <MaterialIcon name="info" outlined size={15} className="mt-0.5 shrink-0 text-[var(--figma-teal)]" />
            <p className="m-0 text-xs leading-relaxed text-[var(--figma-gray500)]">
              This reminder will notify <strong className="text-[var(--figma-navy)]">{member?.name ?? "the assignee"}</strong> automatically
              on <strong className="text-[var(--figma-teal)]">{formatDate(date)}</strong> regarding{" "}
              <strong className="text-[var(--figma-navy)]">{client.name}</strong>.
            </p>
          </div>

          <div className="h-2" />
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 border-t border-[var(--figma-border)] px-7 pb-6 pt-4">
          {saved ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(63,166,107,0.25)] bg-[rgba(63,166,107,0.10)] py-2.5">
              <MaterialIcon name="check_circle" size={18} className="text-[var(--figma-success)]" />
              <span className="text-[13px] font-semibold text-[var(--figma-success)]">Reminder set successfully!</span>
            </div>
          ) : null}

          <SetReminderBtn onClick={() => void handleSave()} loading={saved || isUpdating} />

          <button
            type="button"
            onClick={onClose}
            className="border-none bg-transparent py-1.5 text-center text-[13px] text-[var(--figma-gray500)] underline decoration-[var(--figma-border)] hover:text-[var(--figma-navy)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

function SetReminderBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className="flex w-full items-center justify-center gap-2 rounded-full border-none py-3 text-sm font-semibold text-white transition-all duration-150 gi-gradient-cta disabled:cursor-default"
      style={{
        opacity: loading ? 0.7 : 1,
        boxShadow: pressed ? "var(--neu-inset)" : hov ? "var(--neu-raised-hover)" : "var(--neu-raised)",
        transform: pressed ? "scale(0.98)" : hov ? "scale(1.01)" : "scale(1)",
      }}
    >
      {loading ? (
        <>
          <MaterialIcon name="refresh" size={16} className="animate-spin" />
          Setting reminder…
        </>
      ) : (
        <>
          <MaterialIcon name="notifications_active" outlined size={16} />
          Set Reminder
        </>
      )}
    </button>
  );
}
