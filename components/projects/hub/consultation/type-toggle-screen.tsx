"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import type { ConsultType, ModeType } from "@/types/consultation";
import type { ActiveProjectView } from "@/types/project-hub";

import { GradientBtn, ModePillToggle } from "./consultation-ui";

export function TypeToggleScreen({
  project,
  onContinue,
  onBack,
}: {
  project: ActiveProjectView;
  onContinue: (type: ConsultType, mode: ModeType) => void;
  onBack: () => void;
}) {
  const [consultType, setConsultType] = useState<ConsultType>(null);
  const [mode, setMode] = useState<ModeType>("online");
  const [backHover, setBackHover] = useState(false);
  const eligible = project.distanceKm <= 10;

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <button
        type="button"
        onClick={onBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        className="mb-5 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] transition-colors duration-150"
        style={{ color: backHover ? "var(--figma-teal)" : "var(--figma-gray500)" }}
      >
        <MaterialIcon name="arrow_back" outlined size={16} />
        Projects / {project.clientName}
      </button>

      <h1 className="mb-1 text-[26px] font-bold text-[var(--figma-navy)]">Consultation</h1>
      <p className="mb-9 text-[13px] text-[var(--figma-gray500)]">
        {project.name} · Select consultation type to proceed
      </p>

      <div
        className="mx-auto max-w-[560px] rounded-[20px] bg-white px-10 py-9"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-[18px] text-center text-sm font-semibold text-[var(--figma-navy)]">
          Select Consultation Type
        </div>

        <div
          className="relative mb-7 flex rounded-[28px] p-[5px] neu-inset"
          style={{ background: "var(--figma-gray100)" }}
        >
          <div
            className="absolute bottom-[5px] top-[5px] rounded-[22px] transition-all duration-[260ms]"
            style={{
              width: "calc(50% - 5px)",
              left: consultType === "paid" ? "calc(50%)" : "5px",
              background: consultType
                ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))"
                : "var(--figma-gray200)",
              boxShadow: consultType ? "var(--neu-raised)" : "none",
              transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
          {(
            [
              { id: "free" as ConsultType, icon: "volunteer_activism", label: "Free Consultation" },
              { id: "paid" as ConsultType, icon: "receipt_long", label: "Paid Consultation" },
            ] as const
          ).map((opt) => {
            const active = consultType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setConsultType(opt.id)}
                className="relative z-[1] flex flex-1 cursor-pointer items-center justify-center gap-2 border-none bg-transparent py-[13px] text-sm transition-colors duration-200"
                style={{
                  color: active ? "#fff" : "var(--figma-gray500)",
                  fontWeight: active ? 700 : 400,
                }}
              >
                <MaterialIcon name={opt.icon} outlined={!active} size={18} />
                {opt.label}
              </button>
            );
          })}
        </div>

        {consultType && (
          <div
            className="mb-6 animate-in fade-in slide-in-from-bottom-1.5 rounded-[14px] p-[16px_18px] duration-200"
            style={{
              background:
                consultType === "free"
                  ? eligible
                    ? "rgba(63,166,107,0.06)"
                    : "rgba(242,109,109,0.06)"
                  : "rgba(14,124,134,0.05)",
              border: `1.5px solid ${
                consultType === "free" ? (eligible ? "#3FA66B" : "var(--figma-alert)") : "var(--figma-teal)"
              }`,
            }}
          >
            {consultType === "free" ? (
              <div className="flex items-start gap-3">
                <div
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px]"
                  style={{ background: eligible ? "#DCFCE7" : "#FEE2E2" }}
                >
                  <MaterialIcon
                    name={eligible ? "check_circle" : "warning"}
                    size={18}
                    style={{ color: eligible ? "#3FA66B" : "var(--figma-alert)" }}
                  />
                </div>
                <div>
                  <div className="mb-[3px] text-[13px] font-semibold text-[var(--figma-navy)]">
                    {eligible
                      ? "Client is eligible for free consultation"
                      : "Outside free consultation radius"}
                  </div>
                  <div className="text-xs leading-snug text-[var(--figma-gray500)]">
                    {eligible
                      ? `Site is ${project.distanceKm} km from Dehiwala office — within the 10 km free consultation radius.`
                      : `Client site is ${project.distanceKm} km from Dehiwala office. Free consultations require the site to be within 10 km.`}
                  </div>
                  {!eligible && (
                    <div className="mt-2 text-[11px] font-medium text-[var(--figma-alert)]">
                      Consider switching to Paid Consultation.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px]"
                  style={{ background: "rgba(14,124,134,0.12)" }}
                >
                  <MaterialIcon name="info" outlined size={18} className="text-[var(--figma-teal)]" />
                </div>
                <div>
                  <div className="mb-[3px] text-[13px] font-semibold text-[var(--figma-navy)]">
                    Full consultation record will be created
                  </div>
                  <div className="text-xs leading-snug text-[var(--figma-gray500)]">
                    Full questionnaire, site visit booking, measurement entry, inventory list, notes thread, and
                    audio recordings will all be enabled.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <div className="mb-3 text-[13px] font-medium text-[var(--figma-navy)]">Consultation Mode</div>
          <ModePillToggle mode={mode} setMode={setMode} />
        </div>

        <GradientBtn
          label="Continue"
          icon="arrow_forward"
          onClick={() => onContinue(consultType, mode)}
          disabled={!consultType || (consultType === "free" && !eligible)}
        />
      </div>
    </div>
  );
}
