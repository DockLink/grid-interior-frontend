"use client";

import { useState } from "react";

import {
  CommLogAttachmentPicker,
  currentCommLogTime,
  revokeAttachmentUrls,
} from "@/components/clients/comm-log-attachments";
import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { useAuthStore } from "@/stores/auth-store";
import type { CommLogAttachment, CreateCommLogPayload } from "@/types/clients";
import { cn } from "@/lib/utils";

const TYPE_MAP = { Call: "call", Email: "email", Meeting: "meeting" } as const;

export function LogCommModal({
  onClose,
  onSave,
  isSaving,
  clientName,
  clientInitials,
  clientColor,
}: {
  onClose: () => void;
  onSave: (payload: CreateCommLogPayload) => void;
  isSaving: boolean;
  clientName: string;
  clientInitials?: string;
  clientColor?: string;
}) {
  const authDisabled = isAuthDisabled();
  const currentUserId = useAuthStore((s) => s.session?.user?.id);

  const [type, setType] = useState<"Call" | "Email" | "Meeting">("Call");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [notesFocus, setNotesFocus] = useState(false);
  const [attachments, setAttachments] = useState<CommLogAttachment[]>([]);

  const TYPE_CFG = {
    Call: { icon: "phone", color: "var(--figma-success)" },
    Email: { icon: "email", color: "var(--figma-teal)" },
    Meeting: { icon: "groups", color: "var(--figma-navy)" },
  };

  const discardAndClose = () => {
    revokeAttachmentUrls(attachments);
    onClose();
  };

  const handleSave = () => {
    const payload: CreateCommLogPayload = {
      type: TYPE_MAP[type],
      note: notes,
      date,
      time: currentCommLogTime(),
    };
    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.20)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && discardAndClose()}
    >
      <div
        className="hub-modal-in flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[20px] bg-white px-9 py-8"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-6 flex shrink-0 items-start justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">Log Communication</h2>
            <p className="m-0 flex items-center gap-1.5 text-[13px] text-[var(--figma-gray500)]">
              {clientInitials && clientColor ? (
                <span
                  className="flex size-[22px] items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: clientColor }}
                >
                  {clientInitials}
                </span>
              ) : (
                <MaterialIcon name="person" outlined size={14} />
              )}
              {clientName}
            </p>
          </div>
          <button
            type="button"
            onClick={discardAndClose}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[var(--figma-navy)]">Communication Type</label>
            <div className="flex gap-2">
              {(["Call", "Email", "Meeting"] as const).map((t) => {
                const cfg = TYPE_CFG[t];
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="flex flex-1 flex-col items-center gap-1 rounded-[10px] border-[1.5px] py-2.5 transition-all duration-150"
                    style={{
                      borderColor: isSelected ? cfg.color : "var(--figma-border)",
                      background: isSelected ? `${cfg.color}10` : "#fff",
                    }}
                  >
                    <MaterialIcon
                      name={cfg.icon}
                      outlined
                      size={20}
                      style={{ color: isSelected ? cfg.color : "var(--figma-gray400)" }}
                    />
                    <span
                      className="text-xs"
                      style={{
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? cfg.color : "var(--figma-gray500)",
                      }}
                    >
                      {t}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Date</label>
            <div className="relative">
              <MaterialIcon
                name="calendar_today"
                outlined
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="hub-input-focus w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pl-9 pr-3.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onFocus={() => setNotesFocus(true)}
              onBlur={() => setNotesFocus(false)}
              placeholder="Describe the communication… what was discussed, decisions made, follow-ups required."
              rows={4}
              className={cn(
                "w-full resize-y rounded-[10px] border-[1.5px] bg-white p-3 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none transition-all duration-150",
                notesFocus
                  ? "border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_3px_rgba(14,124,134,0.08)]"
                  : "border-[var(--figma-border)] neu-inset",
              )}
            />
          </div>

          {authDisabled ? (
            <CommLogAttachmentPicker files={attachments} onChange={setAttachments} />
          ) : null}
        </div>

        <div className="mt-6 flex shrink-0 gap-2.5">
          <OutlineButton onClick={discardAndClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton icon="save" onClick={handleSave} className="flex-[2]" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save Log"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
