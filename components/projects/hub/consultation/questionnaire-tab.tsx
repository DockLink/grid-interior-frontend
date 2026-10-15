"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useOptionalProjectContext } from "@/components/projects/project-context";
import { useQuestionnaire } from "@/hooks/use-questionnaire";
import {
  questionnaireFromAnswers,
  questionnaireToAnswers,
  type QuestionnaireForm,
} from "@/lib/consultation/questionnaire-form";
import { cn } from "@/lib/utils";
import type { ActiveProjectView } from "@/types/project-hub";

import { NeuTextarea, SectionCard, SectionTitle } from "./consultation-ui";
import { SectionNotes } from "./section-notes";

function projectLocation(project: ActiveProjectView): string {
  const loc = project.location?.trim();
  if (!loc || loc === "—") return "";
  return loc;
}

function questionnaireDefaults(
  project: ActiveProjectView,
  client?: { contact_number?: string | null; contact_email?: string | null } | null,
): QuestionnaireForm {
  return {
    name: project.clientName === "No client" ? "" : project.clientName,
    phone: client?.contact_number?.trim() || "",
    email: client?.contact_email?.trim() || "",
    comms: "Email",
    location: projectLocation(project) || "",
    spaceType: "",
    spaceOther: "",
    scope: "",
    scopeOther: "",
    siteVisit: null,
    tenure: "",
    consultWhen: "",
    drawings: null,
    size: "",
    measureService: null,
    engineerAnalysis: null,
    goals: "",
    stylesPref: "",
    mustHaves: "",
    avoid: "",
    budget: "",
    budgetNotes: "",
    startDate: "",
    endDate: "",
    likes: "",
    dislikes: "",
    keepFurniture: "",
    useSpace: "",
    functional: "",
    specialNeeds: "",
    colors: "",
    materials: "",
    inspoFileName: null,
    brands: "",
    structural: "",
    lighting: "",
    temperature: "",
    concerns: "",
    other: "",
  };
}

function PillGroup({
  options,
  value,
  onChange,
  allowOther,
  otherValue,
  onOtherChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  allowOther?: boolean;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className="cursor-pointer rounded-3xl px-[18px] py-[8px] text-[13px] transition-all duration-150"
              style={{
                border: active ? "2px solid var(--figma-teal)" : "1.5px solid var(--figma-border)",
                background: active ? "rgba(14,124,134,0.07)" : "#fff",
                color: active ? "var(--figma-teal)" : "var(--figma-gray500)",
                fontWeight: active ? 700 : 400,
                boxShadow: active ? "var(--neu-raised)" : "none",
              }}
            >
              {active && <MaterialIcon name="check" size={14} className="mr-1.5 align-middle" />}
              {opt}
            </button>
          );
        })}
      </div>
      {allowOther && value === "Other" && (
        <input
          value={otherValue ?? ""}
          onChange={(e) => onOtherChange?.(e.target.value)}
          placeholder="Please specify…"
          className="box-border w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3.5 py-2.5 text-[13px] text-[var(--figma-navy)] outline-none neu-inset focus:border-2 focus:border-[var(--figma-teal)]"
        />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[var(--figma-navy)]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "box-border w-full rounded-[10px] bg-white px-3.5 py-[11px] text-[13px] text-[var(--figma-navy)] outline-none transition-all duration-150",
          focused
            ? "border-2 border-[var(--figma-teal)] hub-input-focus"
            : "border-[1.5px] border-[var(--figma-border)] neu-inset",
        )}
      />
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[var(--figma-navy)]">{label}</span>
      <div className="flex gap-2">
        {[true, false].map((opt) => {
          const active = value === opt;
          return (
            <button
              key={String(opt)}
              type="button"
              onClick={() => onChange(opt)}
              className="cursor-pointer rounded-3xl px-5 py-2 text-[13px]"
              style={{
                border: active ? "2px solid var(--figma-teal)" : "1.5px solid var(--figma-border)",
                background: active ? "rgba(14,124,134,0.07)" : "#fff",
                color: active ? "var(--figma-teal)" : "var(--figma-gray500)",
                fontWeight: active ? 700 : 400,
              }}
            >
              {opt ? "Yes" : "No"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QuestionnaireTab({ project }: { project: ActiveProjectView }) {
  const apiClient = useOptionalProjectContext()?.project?.client;
  const seed = questionnaireDefaults(project, apiClient);
  const seedRef = useRef(seed);
  const { answers, isLoading, isFetched, isAuthOff, isSaving, save } = useQuestionnaire(project.id);

  const [form, setForm] = useState(seed);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirtyRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef(form);
  const saveRef = useRef(save);
  const inFlightRef = useRef(false);
  const queuedRef = useRef(false);
  formRef.current = form;
  saveRef.current = save;

  const flushSaveRef = useRef(() => {});
  flushSaveRef.current = () => {
    if (isAuthOff) return;
    if (inFlightRef.current) {
      queuedRef.current = true;
      return;
    }
    inFlightRef.current = true;
    const payload = questionnaireToAnswers(formRef.current);
    setSaveState("saving");
    void saveRef
      .current(payload)
      .then(() => {
        if (!queuedRef.current) setSaveState("saved");
      })
      .catch(() => {
        if (queuedRef.current) return;
        setSaveState("error");
        toast.error("Couldn't save questionnaire answers");
      })
      .finally(() => {
        inFlightRef.current = false;
        if (queuedRef.current) {
          queuedRef.current = false;
          flushSaveRef.current();
        }
      });
  };

  const patch =
    <K extends keyof QuestionnaireForm>(key: K) =>
    (value: QuestionnaireForm[K]) => {
      dirtyRef.current = true;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  useEffect(() => {
    if (ready) return;
    if (isAuthOff) {
      setReady(true);
      return;
    }
    if (!isFetched || isLoading) return;
    if (answers && !dirtyRef.current) {
      setForm(questionnaireFromAnswers(answers, seedRef.current));
    }
    setReady(true);
  }, [answers, isAuthOff, isFetched, isLoading, ready]);

  useEffect(() => {
    if (!ready || !dirtyRef.current || isAuthOff) return;
    const handle = window.setTimeout(() => {
      flushSaveRef.current();
    }, 800);
    return () => window.clearTimeout(handle);
  }, [form, isAuthOff, ready]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      patch("inspoFileName")(e.target.files[0].name);
    }
  };

  const {
    name,
    phone,
    email,
    comms,
    spaceType,
    spaceOther,
    scope,
    scopeOther,
    siteVisit,
    location,
    tenure,
    consultWhen,
    drawings,
    size,
    measureService,
    engineerAnalysis,
    goals,
    stylesPref,
    mustHaves,
    avoid,
    budget,
    budgetNotes,
    startDate,
    endDate,
    likes,
    dislikes,
    keepFurniture,
    useSpace,
    functional,
    specialNeeds,
    colors,
    materials,
    inspoFileName,
    brands,
    structural,
    lighting,
    temperature,
    concerns,
    other,
  } = form;

  const statusLabel = isAuthOff
    ? null
    : !ready || isLoading
      ? "Loading questionnaire…"
      : isSaving || saveState === "saving"
        ? "Saving…"
        : saveState === "saved"
          ? "Saved"
          : saveState === "error"
            ? "Save failed"
            : null;

  return (
    <div>
      {statusLabel && (
        <p className="mb-4 text-right text-[12px] text-[var(--figma-gray400)]">{statusLabel}</p>
      )}

      <SectionCard>
        <SectionTitle icon="person" title="1. Client Information" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" value={name} onChange={patch("name")} />
          <Field label="Phone" value={phone} onChange={patch("phone")} type="tel" />
          <Field label="Email" value={email} onChange={patch("email")} type="email" />
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">
              Preferred method of communication
            </span>
            <PillGroup
              options={["Phone", "Email", "WhatsApp", "In person"]}
              value={comms}
              onChange={patch("comms")}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="home_work" title="2. Project Overview" />
        <div className="flex flex-col gap-5">
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">Type of space</span>
            <PillGroup
              options={["Residential", "Commercial", "Other"]}
              value={spaceType}
              onChange={patch("spaceType")}
              allowOther
              otherValue={spaceOther}
              onOtherChange={patch("spaceOther")}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">Scope of project</span>
            <PillGroup
              options={["Full renovation", "Room makeover", "New construction", "Specific area"]}
              value={scope}
              onChange={patch("scope")}
              allowOther
              otherValue={scopeOther}
              onOtherChange={patch("scopeOther")}
            />
          </div>
          <YesNo label="Site visit required?" value={siteVisit} onChange={patch("siteVisit")} />
          <Field label="Project location" value={location} onChange={patch("location")} />
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">Owned or rented</span>
            <PillGroup options={["Owned", "Rented", "Leased"]} value={tenure} onChange={patch("tenure")} />
          </div>
          <Field
            label="Convenient date and time for consultation"
            value={consultWhen}
            onChange={patch("consultWhen")}
            type="datetime-local"
          />
          <YesNo label="Any architectural drawings available?" value={drawings} onChange={patch("drawings")} />
          <Field
            label="Approximate size of the space"
            value={size}
            onChange={patch("size")}
            placeholder="sq ft or perches"
          />
          <YesNo
            label="Is a site measurement service required?"
            value={measureService}
            onChange={patch("measureService")}
          />
          <YesNo
            label="Do you need a site analysis done by an engineer?"
            value={engineerAnalysis}
            onChange={patch("engineerAnalysis")}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="flag" title="3. Design Goals" />
        <div className="flex flex-col gap-4">
          <NeuTextarea label="Primary goals for this project" value={goals} onChange={patch("goals")} rows={3} />
          <NeuTextarea
            label="Preferred styles or themes"
            value={stylesPref}
            onChange={patch("stylesPref")}
            rows={2}
          />
          <NeuTextarea label="Must-have features or elements" value={mustHaves} onChange={patch("mustHaves")} rows={2} />
          <NeuTextarea label="Styles or themes to avoid" value={avoid} onChange={patch("avoid")} rows={2} />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="account_balance_wallet" title="4. Budget and Timeline" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Estimated budget (only if the client is willing to share)"
            value={budget}
            onChange={patch("budget")}
          />
          <div className="sm:col-span-2">
            <NeuTextarea
              label="Budget constraints or priorities"
              value={budgetNotes}
              onChange={patch("budgetNotes")}
              rows={2}
            />
          </div>
          <Field label="Preferred start date" value={startDate} onChange={patch("startDate")} type="date" />
          <Field label="Desired completion date" value={endDate} onChange={patch("endDate")} type="date" />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="weekend" title="5. Current Space Details" />
        <div className="flex flex-col gap-4">
          <NeuTextarea label="What do you like about your current space?" value={likes} onChange={patch("likes")} rows={2} />
          <NeuTextarea
            label="What do you dislike or find challenging?"
            value={dislikes}
            onChange={patch("dislikes")}
            rows={2}
          />
          <NeuTextarea
            label="Existing furniture or items you want to keep"
            value={keepFurniture}
            onChange={patch("keepFurniture")}
            rows={2}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="diversity_3" title="6. Lifestyle and Functionality" />
        <div className="flex flex-col gap-4">
          <NeuTextarea label="How do you use the space?" value={useSpace} onChange={patch("useSpace")} rows={2} />
          <NeuTextarea
            label="Specific functional requirements or challenges"
            value={functional}
            onChange={patch("functional")}
            rows={2}
          />
          <NeuTextarea
            label="Special needs or preferences (accessibility, storage)"
            value={specialNeeds}
            onChange={patch("specialNeeds")}
            rows={2}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="palette" title="7. Aesthetic Preferences" />
        <div className="flex flex-col gap-4">
          <Field label="Favorite colors" value={colors} onChange={patch("colors")} />
          <Field label="Favorite materials or finishes" value={materials} onChange={patch("materials")} />
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">
              Inspirational images or design references
            </span>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
            {inspoFileName ? (
              <div className="flex items-center gap-2 rounded-[10px] border border-[var(--figma-border)] bg-[var(--figma-gray50)] px-3.5 py-3">
                <MaterialIcon name="image" outlined size={18} className="text-[var(--figma-teal)]" />
                <span className="text-[13px] font-medium text-[var(--figma-navy)]">{inspoFileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    patch("inspoFileName")(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="ml-auto cursor-pointer border-none bg-transparent text-[12px] text-[var(--figma-gray400)]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-[14px] border-2 border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] px-6 py-8"
              >
                <MaterialIcon name="upload" outlined size={22} className="text-[var(--figma-teal)]" />
                <span className="text-[13px] font-semibold text-[var(--figma-navy)]">Upload references</span>
              </button>
            )}
          </div>
          <Field label="Particular brands or designers you admire" value={brands} onChange={patch("brands")} />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="build" title="8. Practical Considerations" />
        <div className="flex flex-col gap-4">
          <NeuTextarea
            label="Existing structural changes or limitations"
            value={structural}
            onChange={patch("structural")}
            rows={3}
          />
          <NeuTextarea
            label="Preferred lighting (natural, ambient, task)"
            value={lighting}
            onChange={patch("lighting")}
            rows={2}
          />
          <NeuTextarea
            label="Temperature preferences (warm, cool)"
            value={temperature}
            onChange={patch("temperature")}
            rows={2}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="more_horiz" title="9. Additional Information" />
        <div className="flex flex-col gap-4">
          <NeuTextarea
            label="Concerns or questions about the design process"
            value={concerns}
            onChange={patch("concerns")}
            rows={2}
          />
          <NeuTextarea
            label="Any other details or preferences not covered above"
            value={other}
            onChange={patch("other")}
            rows={2}
          />
        </div>
      </SectionCard>

      <SectionNotes section="questionnaire" projectId={project.id} />
    </div>
  );
}
