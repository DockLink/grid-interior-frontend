"use client";

import { useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { GradientButton } from "@/components/suppliers/supplier-ui";
import { cn } from "@/lib/utils";

type FormMode = "supplier" | "subvendor";

const SUPPLIER_CATEGORIES = [
  "Furniture",
  "Flooring",
  "Lighting",
  "Fabrics",
  "Masonry",
  "Electrical",
  "Plumbing",
  "Tiles",
  "Joinery",
  "Ironmongery",
];
const SUBVENDOR_SPECIALTIES = [
  "Masonry",
  "Plumbing",
  "Electrical",
  "Plastering",
  "Joinery",
  "Tiling",
  "Painting",
  "HVAC",
];
const CREDIT_TERMS = ["Net 15", "Net 30", "Net 45", "Net 60", "Due on completion", "Advance payment"];
const AVAILABILITY_OPTIONS = ["Available", "Busy", "Unknown"];

interface FormData {
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rate: string;
  unit: string;
  creditTerms: string;
  leadTime: string;
  specialty: string;
  availability: string;
  website: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  category: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  rate: "",
  unit: "",
  creditTerms: "Net 30",
  leadTime: "",
  specialty: "",
  availability: "Available",
  website: "",
  notes: "",
};

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: string;
  error?: string;
  type?: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[13px] font-medium"
        style={{ color: hasError ? "var(--figma-alert)" : "var(--figma-navy)" }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <MaterialIcon
            name={icon}
            outlined
            size={16}
            className={cn(
              "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-150",
              focused
                ? "text-[var(--figma-teal)]"
                : hasError
                  ? "text-[var(--figma-alert)]"
                  : "text-[var(--figma-gray400)]",
            )}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-[10px] bg-white text-[13px] text-[var(--figma-navy)] outline-none transition-all duration-150 neu-inset",
            icon ? "py-2.5 pr-3 pl-9" : "px-3.5 py-2.5",
            hasError
              ? "border-2 border-[var(--figma-alert)] shadow-[var(--neu-inset),0_0_0_3px_rgba(242,109,109,0.08)]"
              : focused
                ? "border-2 border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_3px_rgba(14,124,134,0.08)]"
                : "border-[1.5px] border-[var(--figma-border)]",
          )}
        />
      </div>
      {hasError && (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--figma-alert)]">
          <MaterialIcon name="error_outline" outlined size={13} />
          {error}
        </div>
      )}
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  icon?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[var(--figma-navy)]">{label}</label>
      <div className="relative">
        {icon && (
          <MaterialIcon
            name={icon}
            outlined
            size={16}
            className={cn(
              "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2",
              focused ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]",
            )}
          />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "w-full cursor-pointer appearance-none rounded-[10px] bg-white py-2.5 pr-9 text-[13px] outline-none transition-all duration-150 neu-inset",
            icon ? "pl-9" : "pl-3.5",
            value ? "text-[var(--figma-navy)]" : "text-[var(--figma-gray400)]",
            focused
              ? "border-2 border-[var(--figma-teal)] shadow-[var(--neu-inset),0_0_0_3px_rgba(14,124,134,0.08)]"
              : "border-[1.5px] border-[var(--figma-border)]",
          )}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <MaterialIcon
          name="expand_more"
          outlined
          size={16}
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[var(--figma-gray400)]"
        />
      </div>
    </div>
  );
}

function FormSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2 border-b border-[var(--figma-border)] pb-2.5">
        <MaterialIcon name={icon} outlined size={16} className="text-[var(--figma-teal)]" />
        <span className="text-[13px] font-semibold tracking-wide text-[var(--figma-navy)]">{title}</span>
      </div>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

export function AddSupplierModal({
  open,
  onClose,
  defaultMode = "supplier",
}: {
  open: boolean;
  onClose: () => void;
  defaultMode?: FormMode;
}) {
  const [mode, setMode] = useState<FormMode>(defaultMode);
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (field: keyof FormData) => (v: string) => {
    setForm((p) => ({ ...p, [field]: v }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errs.name = "This field is required";
    if (mode === "supplier" && !form.category) errs.category = "This field is required";
    if (mode === "subvendor" && !form.specialty) errs.specialty = "This field is required";
    if (!form.email.trim()) errs.email = "This field is required";
    if (!form.contactPerson.trim()) errs.contactPerson = "This field is required";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`${mode === "supplier" ? "Supplier" : "Sub-vendor"} saved (demo)`);
      onClose();
      setForm({ ...EMPTY_FORM });
      setErrors({});
    }, 900);
  };

  if (!open) return null;

  const isSupplier = mode === "supplier";

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto p-5 pt-10 backdrop-blur-[3px]"
      style={{ background: "rgba(27,42,74,0.18)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[560px] rounded-[20px] bg-white p-8 animate-[hubModalIn_220ms_ease-out]"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="mb-1 text-[20px] font-bold text-[var(--figma-navy)]">
              Add New {isSupplier ? "Supplier" : "Sub-Vendor"}
            </h2>
            <p className="text-[13px] text-[var(--figma-gray500)]">
              Fill in the details below to create a new record
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div
          className="mb-7 flex gap-0.5 rounded-xl p-1 neu-inset"
          style={{ background: "var(--figma-gray100)" }}
        >
          {(
            [
              { id: "supplier" as FormMode, icon: "storefront", label: "Supplier" },
              { id: "subvendor" as FormMode, icon: "engineering", label: "Sub-Vendor" },
            ] as const
          ).map((opt) => {
            const isActive = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setMode(opt.id);
                  setForm({ ...EMPTY_FORM });
                  setErrors({});
                }}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[9px] border-none py-2.5 text-[14px] transition-all duration-200",
                  isActive
                    ? "bg-white font-semibold text-[var(--figma-navy)] neu-raised"
                    : "bg-transparent font-normal text-[var(--figma-gray500)]",
                )}
              >
                <MaterialIcon
                  name={opt.icon}
                  outlined={!isActive}
                  size={18}
                  className={isActive ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
                />
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-6">
          <FormSection icon="info" title="Basic Information">
            <FormInput
              label="Name"
              value={form.name}
              onChange={set("name")}
              placeholder={isSupplier ? "e.g. Poliform Milano" : "e.g. Luca Benedetti"}
              icon="business"
              error={errors.name}
            />
            <div className="grid grid-cols-2 gap-3">
              {isSupplier ? (
                <FormSelect
                  label="Category"
                  value={form.category}
                  onChange={set("category")}
                  options={SUPPLIER_CATEGORIES}
                  icon="category"
                />
              ) : (
                <FormSelect
                  label="Specialty"
                  value={form.specialty}
                  onChange={set("specialty")}
                  options={SUBVENDOR_SPECIALTIES}
                  icon="engineering"
                />
              )}
              {isSupplier ? (
                <FormInput
                  label="Website"
                  value={form.website}
                  onChange={set("website")}
                  placeholder="e.g. poliform.it"
                  icon="language"
                />
              ) : (
                <FormSelect
                  label="Availability"
                  value={form.availability}
                  onChange={set("availability")}
                  options={AVAILABILITY_OPTIONS}
                  icon="event_available"
                />
              )}
            </div>
          </FormSection>

          <FormSection icon="contact_page" title="Contact Information">
            <FormInput
              label="Contact Person"
              value={form.contactPerson}
              onChange={set("contactPerson")}
              placeholder="Full name"
              icon="person"
              error={errors.contactPerson}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Phone"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+39 02 1234 5678"
                icon="phone"
              />
              <FormInput
                label="Email"
                value={form.email}
                onChange={set("email")}
                placeholder="contact@example.com"
                icon="email"
                error={errors.email}
                type="email"
              />
            </div>
            <FormInput
              label="Address"
              value={form.address}
              onChange={set("address")}
              placeholder="Street, City"
              icon="location_on"
            />
          </FormSection>

          {isSupplier ? (
            <FormSection icon="price_change" title="Rates & Terms">
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Base Rate"
                  value={form.rate}
                  onChange={set("rate")}
                  placeholder="e.g. € 185"
                  icon="euro"
                />
                <FormInput
                  label="Unit"
                  value={form.unit}
                  onChange={set("unit")}
                  placeholder="e.g. per m²"
                  icon="straighten"
                />
                <FormSelect
                  label="Credit Terms"
                  value={form.creditTerms}
                  onChange={set("creditTerms")}
                  options={CREDIT_TERMS}
                  icon="account_balance"
                />
                <FormInput
                  label="Lead Time"
                  value={form.leadTime}
                  onChange={set("leadTime")}
                  placeholder="e.g. 4–6 weeks"
                  icon="schedule"
                />
              </div>
            </FormSection>
          ) : (
            <FormSection icon="event_available" title="Availability">
              <div className="grid grid-cols-2 gap-3">
                <FormSelect
                  label="Current Availability"
                  value={form.availability}
                  onChange={set("availability")}
                  options={AVAILABILITY_OPTIONS}
                  icon="event_available"
                />
                <FormInput
                  label="Day Rate"
                  value={form.rate}
                  onChange={set("rate")}
                  placeholder="e.g. € 450/day"
                  icon="euro"
                />
              </div>
            </FormSection>
          )}

          <FormSection icon="sticky_note_2" title="Notes">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--figma-navy)]">
                Notes{" "}
                <span className="text-[11px] font-normal text-[var(--figma-gray400)]">(Optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
                placeholder="Any additional notes about this supplier or sub-vendor…"
                rows={3}
                className="hub-input-focus w-full resize-y rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none neu-inset"
              />
            </div>
          </FormSection>
        </div>

        <div className="mt-7 flex gap-2.5 border-t border-[var(--figma-border)] pt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-full border-[1.5px] border-[var(--figma-teal)] bg-white py-3 text-[14px] font-semibold text-[var(--figma-teal)] transition-all duration-150 neu-raised"
          >
            Cancel
          </button>
          <GradientButton
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] justify-center py-3"
          >
            {saving ? (
              <>Saving…</>
            ) : (
              <>
                <MaterialIcon name="save" outlined size={16} />
                Save {isSupplier ? "Supplier" : "Sub-Vendor"}
              </>
            )}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
