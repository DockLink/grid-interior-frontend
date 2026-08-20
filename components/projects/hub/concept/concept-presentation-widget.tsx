"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  GradientBtn,
  OutlineBtn,
  SectionCard,
  SectionTitle,
} from "@/components/projects/hub/consultation/consultation-ui";
import type { PresentStep } from "@/types/concept";

const STEPS: { id: PresentStep; label: string; icon: string }[] = [
  { id: "presented", label: "Presented", icon: "slideshow" },
  { id: "feedback", label: "Feedback Received", icon: "rate_review" },
  { id: "confirmed", label: "Confirmed", icon: "verified" },
];

export function ClientPresentationWidget() {
  const [steps, setSteps] = useState<Set<PresentStep>>(new Set(["presented"]));
  const [feedback, setFeedback] = useState(
    "Client likes the overall direction — particularly the stone-finish feature wall and warm lighting scheme. Requested the seating arrangement be revised to allow for two additional chairs without compromising the flow.",
  );
  const [feedFocused, setFeedFocused] = useState(false);

  const toggle = (step: PresentStep) => {
    setSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  const canConfirm = steps.has("presented") && steps.has("feedback");
  const allDone = steps.has("confirmed");

  return (
    <SectionCard>
      <SectionTitle icon="campaign" title="Client Presentation & Feedback" />

      <div className="mb-[22px] flex items-center">
        {STEPS.map((s, idx) => {
          const done = steps.has(s.id);
          const isLast = idx === STEPS.length - 1;
          return (
            <div key={s.id} className="flex items-center" style={{ flex: isLast ? 0 : 1 }}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5 border-none bg-transparent p-0"
              >
                <div
                  className="flex size-9 items-center justify-center rounded-full transition-all duration-[220ms]"
                  style={{
                    background: done
                      ? s.id === "confirmed"
                        ? "linear-gradient(135deg, #3FA66B, #34d068)"
                        : "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))"
                      : "#fff",
                    border: done ? "none" : "2px solid var(--figma-border)",
                    boxShadow: done ? "var(--neu-raised)" : "var(--neu-inset)",
                  }}
                >
                  <MaterialIcon
                    name={done ? "check" : s.icon}
                    outlined={!done}
                    size={17}
                    className={done ? "text-white" : "text-[var(--figma-gray400)]"}
                  />
                </div>
                <span
                  className="whitespace-nowrap text-[10px]"
                  style={{
                    fontWeight: done ? 600 : 400,
                    color: done ? "var(--figma-navy)" : "var(--figma-gray400)",
                  }}
                >
                  {s.label}
                </span>
              </button>
              {!isLast && (
                <div
                  className="-mt-[18px] mx-2 h-0.5 flex-1 rounded-sm transition-colors duration-300"
                  style={{
                    background: steps.has(s.id)
                      ? "linear-gradient(90deg, var(--figma-teal), rgba(14,124,134,0.5))"
                      : "var(--figma-border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {!steps.has("presented") && (
        <div className="mb-4">
          <OutlineBtn label="Mark as Presented" icon="slideshow" onClick={() => toggle("presented")} />
        </div>
      )}

      <div className="mb-[18px]">
        <label className="mb-1.5 block text-[13px] font-medium text-[var(--figma-navy)]">
          Client Feedback Notes
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onFocus={() => setFeedFocused(true)}
          onBlur={() => setFeedFocused(false)}
          rows={3}
          placeholder="Log client feedback here…"
          className="box-border w-full resize-y rounded-[10px] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none transition-all duration-150"
          style={{
            border: feedFocused ? "2px solid var(--figma-teal)" : "1.5px solid var(--figma-border)",
            boxShadow: feedFocused ? "var(--neu-inset), 0 0 0 3px rgba(14,124,134,0.08)" : "var(--neu-inset)",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {allDone ? (
          <div className="flex items-center gap-2 rounded-3xl border-[1.5px] border-[#3FA66B] bg-[#DCFCE7] px-[18px] py-2.5">
            <MaterialIcon name="verified" size={16} className="text-[#3FA66B]" />
            <span className="text-[13px] font-semibold text-[#3FA66B]">Client Confirmed</span>
          </div>
        ) : (
          <GradientBtn
            label="Confirm & Proceed"
            icon="check_circle"
            onClick={() => {
              toggle("feedback");
              toggle("confirmed");
            }}
            disabled={!canConfirm}
          />
        )}
        {!canConfirm && !allDone && (
          <span className="text-[11px] text-[var(--figma-gray400)]">
            Client confirmation required before proceeding to next stage
          </span>
        )}
      </div>
    </SectionCard>
  );
}
