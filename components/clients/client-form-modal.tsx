"use client";

import { useEffect, useState } from "react";

import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";
import type {
  Client,
  ClientStatus,
  CreateClientPayload,
  LeadSource,
  PreferredContact,
  UpdateClientPayload,
} from "@/types/clients";

export type ClientFormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  preferredContact: PreferredContact;
  status: ClientStatus;
  source: LeadSource;
  notes: string;
};

const PREFERRED_CONTACTS: PreferredContact[] = ["Email", "Phone", "WhatsApp"];
const SOURCES: LeadSource[] = ["Referral", "Instagram", "Website", "Walk-in"];
const STATUSES: ClientStatus[] = ["Lead", "Active", "Past"];
const EMAIL_PATTERN = /^[^\sA-Z]+@[^\sA-Z]+\.[^\sA-Z]+$/;

type FieldErrors = Partial<Record<"name" | "email", string>>;

function emptyForm(): ClientFormValues {
  return {
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    preferredContact: "Email",
    status: "Lead",
    source: "Referral",
    notes: "",
  };
}

function validateForm(values: ClientFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = "Full Name is required";
  }
  const email = values.email.trim();
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address";
  }
  return errors;
}

function clientToForm(client: Client): ClientFormValues {
  return {
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
    address: client.address,
    preferredContact: client.preferredContact,
    status: client.status,
    source: client.source,
    notes: client.notes ?? "",
  };
}

function formToCreatePayload(values: ClientFormValues): CreateClientPayload {
  return {
    name: values.name.trim(),
    company: values.company.trim() || undefined,
    email: values.email.trim() || undefined,
    phone: values.phone.trim() || undefined,
    address: values.address.trim() || undefined,
    preferred_contact: values.preferredContact,
    status: values.status,
    source: values.source,
    notes: values.notes.trim() || undefined,
  };
}

function formToUpdatePayload(values: ClientFormValues): UpdateClientPayload {
  return {
    ...formToCreatePayload(values),
    stage: values.status === "Lead" ? undefined : undefined,
  };
}

export function ClientFormModal({
  mode,
  initialClient,
  title,
  subtitle,
  defaultStatus = "Lead",
  defaultStage,
  onClose,
  onSubmit,
  isSaving,
}: {
  mode: "create";
  initialClient?: Client;
  title?: string;
  subtitle?: string;
  defaultStatus?: ClientStatus;
  defaultStage?: CreateClientPayload["stage"];
  onClose: () => void;
  onSubmit: (payload: CreateClientPayload) => Promise<void>;
  isSaving: boolean;
} | {
  mode: "edit";
  initialClient: Client;
  title?: string;
  subtitle?: string;
  defaultStatus?: ClientStatus;
  defaultStage?: CreateClientPayload["stage"];
  onClose: () => void;
  onSubmit: (payload: UpdateClientPayload) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ClientFormValues>(() =>
    initialClient ? clientToForm(initialClient) : { ...emptyForm(), status: defaultStatus },
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (initialClient) setForm(clientToForm(initialClient));
  }, [initialClient]);

  const set = <K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name" || key === "email") {
      const errorKey = key as "name" | "email";
      setErrors((prev) => (prev[errorKey] ? { ...prev, [errorKey]: undefined } : prev));
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    if (mode === "edit") {
      await onSubmit(formToUpdatePayload(form));
      return;
    }
    await onSubmit({ ...formToCreatePayload(form), stage: defaultStage });
  };

  const heading = title ?? (mode === "edit" ? "Edit Client" : "Add New Client");
  const desc =
    subtitle ?? (mode === "edit" ? "Update client profile details" : "Create a new client profile");

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.18)] backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="hub-modal-in flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[20px] bg-white px-9 py-8"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">{heading}</h2>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">{desc}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {[
            { key: "name" as const, label: "Full Name", icon: "person", placeholder: "e.g. Giulia Marchetti" },
            { key: "company" as const, label: "Company", icon: "business", placeholder: "e.g. Marchetti Holdings" },
            { key: "email" as const, label: "Email Address", icon: "email", placeholder: "giulia@example.com" },
            { key: "phone" as const, label: "Phone", icon: "phone", placeholder: "+39 02 1234 5678" },
            { key: "address" as const, label: "Address", icon: "location_on", placeholder: "Street, city, country" },
          ].map((f) => {
            const fieldError =
              f.key === "name" || f.key === "email" ? errors[f.key] : undefined;
            return (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: fieldError ? "var(--figma-alert)" : "var(--figma-navy)" }}
                >
                  {f.label}
                </label>
                <div className="relative">
                  <MaterialIcon
                    name={f.icon}
                    outlined
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
                  />
                  <input
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    type={f.key === "email" ? "email" : "text"}
                    aria-invalid={Boolean(fieldError)}
                    className={cn(
                      "hub-input-focus w-full rounded-[10px] border-[1.5px] bg-white py-2.5 pl-9 pr-3.5 text-sm text-[var(--figma-navy)] outline-none neu-inset",
                      fieldError ? "border-[var(--figma-alert)]" : "border-[var(--figma-border)]",
                    )}
                  />
                </div>
                {fieldError && (
                  <div className="text-[11px] text-[var(--figma-alert)]">{fieldError}</div>
                )}
              </div>
            );
          })}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Preferred Contact</label>
            <div className="flex gap-2">
              {PREFERRED_CONTACTS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("preferredContact", opt)}
                  className={cn(
                    "flex-1 rounded-lg border-[1.5px] py-2 text-[12px] transition-all duration-150",
                    form.preferredContact === opt
                      ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)] font-semibold text-[var(--figma-teal)]"
                      : "border-[var(--figma-border)] bg-white font-normal text-[var(--figma-gray500)]",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Lead Source</label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => set("source", src)}
                  className={cn(
                    "rounded-full border-[1.5px] px-3 py-1 text-[12px] transition-all duration-150",
                    form.source === src
                      ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)] font-semibold text-[var(--figma-teal)]"
                      : "border-[var(--figma-border)] bg-white font-normal text-[var(--figma-gray500)]",
                  )}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={cn(
                    "flex-1 rounded-lg border-[1.5px] py-2 text-[13px] transition-all duration-150",
                    form.status === s
                      ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.08)] font-semibold text-[var(--figma-teal)]"
                      : "border-[var(--figma-border)] bg-white font-normal text-[var(--figma-gray500)]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Internal notes about this client…"
              rows={3}
              className="w-full resize-y rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white p-3 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none neu-inset"
            />
          </div>
        </div>

        <div className="mt-6 flex shrink-0 gap-2.5">
          <OutlineButton onClick={onClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton
            icon={mode === "edit" ? "save" : "person_add"}
            onClick={() => void handleSubmit()}
            className="flex-[2]"
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Client"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
