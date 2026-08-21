"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";

import { NeuTextarea, SectionCard, SectionTitle } from "./consultation-ui";
import { SectionNotes } from "./section-notes";

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

export function QuestionnaireTab() {
  const [saved, setSaved] = useState(true);
  const touch = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setSaved(false);
    setTimeout(() => setSaved(true), 800);
  };

  const [name, setName] = useState("Giulia Marchetti");
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [email, setEmail] = useState("giulia.marchetti@example.com");
  const [comms, setComms] = useState("Email");

  const [spaceType, setSpaceType] = useState("Residential");
  const [spaceOther, setSpaceOther] = useState("");
  const [scope, setScope] = useState("Full renovation");
  const [scopeOther, setScopeOther] = useState("");
  const [siteVisit, setSiteVisit] = useState<boolean | null>(true);
  const [location, setLocation] = useState("14 Via Colombo, Dehiwala");
  const [tenure, setTenure] = useState("Owned");
  const [consultWhen, setConsultWhen] = useState("2026-07-30T10:00");
  const [drawings, setDrawings] = useState<boolean | null>(true);
  const [size, setSize] = useState("2,450 sq ft");
  const [measureService, setMeasureService] = useState<boolean | null>(true);
  const [engineerAnalysis, setEngineerAnalysis] = useState<boolean | null>(false);

  const [goals, setGoals] = useState(
    "Create a warm contemporary home that feels open, with strong indoor-outdoor connection and generous storage.",
  );
  const [stylesPref, setStylesPref] = useState("Contemporary with warm, natural tones. Clean lines, hidden joinery.");
  const [mustHaves, setMustHaves] = useState("Integrated storage, large dining for entertaining, dedicated work nook.");
  const [avoid, setAvoid] = useState("Cold grey palettes, cluttered open shelving, overly ornate classical details.");

  const [budget, setBudget] = useState("LKR 28–32 million (client willing to share)");
  const [budgetNotes, setBudgetNotes] = useState("Quality over quantity. Kitchen and living are the priority spend.");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-12-15");

  const [likes, setLikes] = useState("Natural light in the living room, original hardwood on ground floor.");
  const [dislikes, setDislikes] = useState("Cramped kitchen circulation, poor guest WC, no dedicated storage.");
  const [keepFurniture, setKeepFurniture] = useState(
    "Dining table (timber, 6-seater), original hardwood floor on ground level, entrance console.",
  );

  const [useSpace, setUseSpace] = useState("Entertaining family and clients; working from home two days a week.");
  const [functional, setFunctional] = useState("Need a quiet work zone; kitchen must support cooking for 10+ guests.");
  const [specialNeeds, setSpecialNeeds] = useState("Extra storage for seasonal items; step-free access to ground floor WC.");

  const [colors, setColors] = useState("Warm whites, terracotta, olive, natural oak.");
  const [materials, setMaterials] = useState("Timber, linen, honed stone, brushed brass.");
  const [inspoUploaded, setInspoUploaded] = useState(true);
  const [brands, setBrands] = useState("Poliform kitchens, Flos lighting, Fiemme timber floors.");

  const [structural, setStructural] = useState(
    "Existing load-bearing wall on the east side cannot be removed. Minimum ceiling height 2.7m.",
  );
  const [lighting, setLighting] = useState("Maximise natural light; layered ambient + task in kitchen and study.");
  const [temperature, setTemperature] = useState("Warm, residential feel — avoid cool white lighting.");

  const [concerns, setConcerns] = useState("Timeline around school holidays; dust control during occupancy.");
  const [other, setOther] = useState("");

  return (
    <div>
      <div className="mb-5 flex items-center justify-end gap-1.5">
        {saved ? (
          <>
            <MaterialIcon name="check_circle" size={14} style={{ color: "#3FA66B" }} />
            <span className="text-[11px] font-medium text-[#3FA66B]">All changes saved</span>
          </>
        ) : (
          <>
            <MaterialIcon name="sync" outlined size={14} className="text-[var(--figma-gray400)]" />
            <span className="text-[11px] text-[var(--figma-gray400)]">Saving…</span>
          </>
        )}
        <span className="text-[11px] text-[var(--figma-gray400)]">· Auto-save enabled</span>
      </div>

      <SectionCard>
        <SectionTitle icon="person" title="1. Client Information" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" value={name} onChange={touch(setName)} />
          <Field label="Phone" value={phone} onChange={touch(setPhone)} type="tel" />
          <Field label="Email" value={email} onChange={touch(setEmail)} type="email" />
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">
              Preferred method of communication
            </span>
            <PillGroup
              options={["Phone", "Email", "WhatsApp", "In person"]}
              value={comms}
              onChange={touch(setComms)}
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
              onChange={touch(setSpaceType)}
              allowOther
              otherValue={spaceOther}
              onOtherChange={touch(setSpaceOther)}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">Scope of project</span>
            <PillGroup
              options={["Full renovation", "Room makeover", "New construction", "Specific area"]}
              value={scope}
              onChange={touch(setScope)}
              allowOther
              otherValue={scopeOther}
              onOtherChange={touch(setScopeOther)}
            />
          </div>
          <YesNo label="Site visit required?" value={siteVisit} onChange={touch(setSiteVisit)} />
          <Field label="Project location" value={location} onChange={touch(setLocation)} />
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">Owned or rented</span>
            <PillGroup options={["Owned", "Rented", "Leased"]} value={tenure} onChange={touch(setTenure)} />
          </div>
          <Field
            label="Convenient date and time for consultation"
            value={consultWhen}
            onChange={touch(setConsultWhen)}
            type="datetime-local"
          />
          <YesNo label="Any architectural drawings available?" value={drawings} onChange={touch(setDrawings)} />
          <Field
            label="Approximate size of the space"
            value={size}
            onChange={touch(setSize)}
            placeholder="sq ft or perches"
          />
          <YesNo
            label="Is a site measurement service required?"
            value={measureService}
            onChange={touch(setMeasureService)}
          />
          <YesNo
            label="Do you need a site analysis done by an engineer?"
            value={engineerAnalysis}
            onChange={touch(setEngineerAnalysis)}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="flag" title="3. Design Goals" />
        <div className="flex flex-col gap-4">
          <NeuTextarea label="Primary goals for this project" value={goals} onChange={touch(setGoals)} rows={3} />
          <NeuTextarea
            label="Preferred styles or themes"
            value={stylesPref}
            onChange={touch(setStylesPref)}
            rows={2}
          />
          <NeuTextarea label="Must-have features or elements" value={mustHaves} onChange={touch(setMustHaves)} rows={2} />
          <NeuTextarea label="Styles or themes to avoid" value={avoid} onChange={touch(setAvoid)} rows={2} />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="account_balance_wallet" title="4. Budget and Timeline" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Estimated budget (only if the client is willing to share)"
            value={budget}
            onChange={touch(setBudget)}
          />
          <div className="sm:col-span-2">
            <NeuTextarea
              label="Budget constraints or priorities"
              value={budgetNotes}
              onChange={touch(setBudgetNotes)}
              rows={2}
            />
          </div>
          <Field label="Preferred start date" value={startDate} onChange={touch(setStartDate)} type="date" />
          <Field label="Desired completion date" value={endDate} onChange={touch(setEndDate)} type="date" />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="weekend" title="5. Current Space Details" />
        <div className="flex flex-col gap-4">
          <NeuTextarea label="What do you like about your current space?" value={likes} onChange={touch(setLikes)} rows={2} />
          <NeuTextarea
            label="What do you dislike or find challenging?"
            value={dislikes}
            onChange={touch(setDislikes)}
            rows={2}
          />
          <NeuTextarea
            label="Existing furniture or items you want to keep"
            value={keepFurniture}
            onChange={touch(setKeepFurniture)}
            rows={2}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="diversity_3" title="6. Lifestyle and Functionality" />
        <div className="flex flex-col gap-4">
          <NeuTextarea label="How do you use the space?" value={useSpace} onChange={touch(setUseSpace)} rows={2} />
          <NeuTextarea
            label="Specific functional requirements or challenges"
            value={functional}
            onChange={touch(setFunctional)}
            rows={2}
          />
          <NeuTextarea
            label="Special needs or preferences (accessibility, storage)"
            value={specialNeeds}
            onChange={touch(setSpecialNeeds)}
            rows={2}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="palette" title="7. Aesthetic Preferences" />
        <div className="flex flex-col gap-4">
          <Field label="Favorite colors" value={colors} onChange={touch(setColors)} />
          <Field label="Favorite materials or finishes" value={materials} onChange={touch(setMaterials)} />
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">
              Inspirational images or design references
            </span>
            {inspoUploaded ? (
              <div className="flex items-center gap-2 rounded-[10px] border border-[var(--figma-border)] bg-[var(--figma-gray50)] px-3.5 py-3">
                <MaterialIcon name="image" outlined size={18} className="text-[var(--figma-teal)]" />
                <span className="text-[13px] font-medium text-[var(--figma-navy)]">moodboard_client_refs.pdf</span>
                <button
                  type="button"
                  onClick={() => touch(setInspoUploaded)(false)}
                  className="ml-auto cursor-pointer border-none bg-transparent text-[12px] text-[var(--figma-gray400)]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => touch(setInspoUploaded)(true)}
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-[14px] border-2 border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] px-6 py-8"
              >
                <MaterialIcon name="upload" outlined size={22} className="text-[var(--figma-teal)]" />
                <span className="text-[13px] font-semibold text-[var(--figma-navy)]">Upload references</span>
              </button>
            )}
          </div>
          <Field label="Particular brands or designers you admire" value={brands} onChange={touch(setBrands)} />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="build" title="8. Practical Considerations" />
        <div className="flex flex-col gap-4">
          <NeuTextarea
            label="Existing structural changes or limitations"
            value={structural}
            onChange={touch(setStructural)}
            rows={3}
          />
          <NeuTextarea
            label="Preferred lighting (natural, ambient, task)"
            value={lighting}
            onChange={touch(setLighting)}
            rows={2}
          />
          <NeuTextarea
            label="Temperature preferences (warm, cool)"
            value={temperature}
            onChange={touch(setTemperature)}
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
            onChange={touch(setConcerns)}
            rows={2}
          />
          <NeuTextarea
            label="Any other details or preferences not covered above"
            value={other}
            onChange={touch(setOther)}
            rows={2}
          />
        </div>
      </SectionCard>

      <SectionNotes section="questionnaire" />
    </div>
  );
}
