"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { cn } from "@/lib/utils";

import {
  GradientBtn,
  OutlineBtn,
  SectionCard,
  SectionTitle,
} from "@/components/projects/hub/consultation/consultation-ui";

type Step = "presented" | "feedback" | "confirmed";

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: "presented", label: "Presented", icon: "slideshow" },
  { id: "feedback", label: "Feedback Received", icon: "rate_review" },
  { id: "confirmed", label: "Confirmed", icon: "verified" },
];

export function ClientConfirmationWidget({
  phase,
  nextPhase,
  onConfirmed,
  defaultFeedback = "Client has reviewed the layout drawings and is satisfied with the space planning. Requested minor adjustment to the meeting room partition wall width.",
}: {
  phase: string;
  nextPhase: string;
  onConfirmed?: (date: string) => void;
  defaultFeedback?: string;
}) {
  const [doneSteps, setDoneSteps] = useState<Set<Step>>(new Set(["presented"]));
  const [feedback, setFeedback] = useState(defaultFeedback);
  const [focused, setFocused] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);

  const toggle = (step: Step) =>
    setDoneSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });

  const canConfirm = doneSteps.has("presented") && doneSteps.has("feedback");

  const handleConfirm = () => {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    toggle("feedback");
    toggle("confirmed");
    setConfirmedDate(today);
    onConfirmed?.(today);
  };

  const isNextDetailDrawings = nextPhase === "Detail Drawings";

  return (
    <SectionCard>
      <SectionTitle icon="campaign" title="Client Presentation & Confirmation" />

      <div className="mb-[22px] flex items-center">
        {STEPS.map((step, idx) => {
          const done = doneSteps.has(step.id);
          const isLast = idx === STEPS.length - 1;

          return (
            <div key={step.id} className={cn("flex items-center", isLast ? "flex-none" : "flex-1")}>
              <button
                type="button"
                onClick={() => toggle(step.id)}
                className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5 border-none bg-transparent p-0"
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-all duration-[220ms]",
                    done
                      ? step.id === "confirmed"
                        ? "bg-gradient-to-br from-[#3FA66B] to-[#34d068]"
                        : "gi-gradient-cta"
                      : "border-2 border-[var(--figma-border)] bg-white neu-inset",
                  )}
                  style={done ? { boxShadow: "var(--neu-raised)" } : undefined}
                >
                  <MaterialIcon
                    name={done ? "check" : step.icon}
                    outlined={!done}
                    size={17}
                    className={done ? "text-white" : "text-[var(--figma-gray400)]"}
                  />
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-[10px]",
                    done ? "font-semibold text-[var(--figma-navy)]" : "font-normal text-[var(--figma-gray400)]",
                  )}
                >
                  {step.label}
                </span>
              </button>
              {!isLast && (
                <div
                  className="-mt-[18px] mx-2 h-0.5 flex-1 rounded-sm transition-colors duration-300"
                  style={{
                    background: doneSteps.has(step.id)
                      ? "linear-gradient(90deg, var(--figma-teal), rgba(14,124,134,0.5))"
                      : "var(--figma-border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {!doneSteps.has("presented") && (
        <div className="mb-3.5">
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={3}
          placeholder="Log client feedback here…"
          className={cn(
            "box-border w-full resize-y rounded-[10px] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--figma-navy)] outline-none transition-all duration-150",
            focused
              ? "border-2 border-[var(--figma-teal)] hub-input-focus"
              : "border-[1.5px] border-[var(--figma-border)] neu-inset",
          )}
        />
      </div>

      {isNextDetailDrawings && (
        <div
          className="mb-4 flex items-center gap-2 rounded-[10px] px-3.5 py-2.5"
          style={{
            background: "rgba(27,42,74,0.03)",
            border: "1.5px solid rgba(27,42,74,0.12)",
          }}
        >
          <MaterialIcon name="info" outlined size={16} className="text-[var(--figma-navy)]" />
          <span className="text-xs font-medium text-[var(--figma-navy)]">
            Director will be notified upon confirmation
          </span>
        </div>
      )}

      {confirmedDate ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-3xl border-[1.5px] border-[#3FA66B] bg-[#DCFCE7] px-[18px] py-2.5">
            <MaterialIcon name="verified" size={16} className="text-[#3FA66B]" />
            <span className="text-[13px] font-semibold text-[#3FA66B]">
              {phase} Confirmed on {confirmedDate}
            </span>
          </div>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent p-0 text-xs text-[var(--figma-teal)] underline"
          >
            View Confirmation Details
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3.5">
          <GradientBtn
            label={`Confirm & Proceed to ${nextPhase}`}
            icon="check_circle"
            onClick={handleConfirm}
            disabled={!canConfirm}
          />
          {!canConfirm && (
            <span className="text-[11px] text-[var(--figma-gray400)]">
              Client confirmation required before proceeding to next stage
            </span>
          )}
        </div>
      )}
    </SectionCard>
  );
}
