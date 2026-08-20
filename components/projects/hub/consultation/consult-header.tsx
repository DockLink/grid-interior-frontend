"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import type { ConsultType, ModeType } from "@/types/consultation";
import type { ActiveProjectView } from "@/types/project-hub";

import { ModeBadge } from "./consultation-ui";

export function ConsultHeader({
  project,
  consultType,
  mode,
  onBack,
  showModeBadge = false,
}: {
  project: ActiveProjectView;
  consultType: ConsultType;
  mode: ModeType;
  onBack: () => void;
  showModeBadge?: boolean;
}) {
  const [backHover, setBackHover] = useState(false);

  return (
    <div className="mb-7">
      <button
        type="button"
        onClick={onBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        className="mb-3 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] transition-colors duration-150"
        style={{ color: backHover ? "var(--figma-teal)" : "var(--figma-gray500)" }}
      >
        <MaterialIcon name="arrow_back" outlined size={16} />
        Projects / {project.clientName} / Consultation
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[26px] font-bold text-[var(--figma-navy)]">Consultation</h1>

        {consultType === "free" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[var(--figma-teal)] px-3.5 py-[5px] text-xs font-bold text-[var(--figma-teal)]"
            style={{ background: "rgba(14,124,134,0.10)" }}
          >
            <MaterialIcon name="volunteer_activism" outlined size={14} />
            Free Consultation
          </span>
        )}

        {consultType === "paid" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--figma-navy)] px-3.5 py-[5px] text-xs font-bold text-white">
            <MaterialIcon name="receipt_long" outlined size={14} />
            Paid Consultation
          </span>
        )}

        {showModeBadge && <ModeBadge mode={mode} />}

        <span className="ml-auto text-xs text-[var(--figma-gray400)]">Created 24 Jul 2026</span>
      </div>
    </div>
  );
}
