"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useThreeDConfirmation } from "@/hooks/use-threed-confirmation";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { cn } from "@/lib/utils";
import type { ThreeDConfirmation } from "@/types/threed";

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

type Draft = {
  steps: Set<Step>;
  feedback: string;
  confirmedDate: string | null;
};

function formatConfirmationDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function stepsFromConfirmation(data: ThreeDConfirmation): Set<Step> {
  const steps = new Set<Step>();
  if (data.presented) steps.add("presented");
  if (data.feedback_received) steps.add("feedback");
  if (data.confirmed) steps.add("confirmed");
  return steps;
}

function draftFromConfirmation(data: ThreeDConfirmation): Draft {
  return {
    steps: stepsFromConfirmation(data),
    feedback: data.feedback_notes,
    confirmedDate: data.confirmed_at ? formatConfirmationDate(data.confirmed_at) : null,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to save confirmation";
}

export function ClientConfirmationWidget({
  phase,
  nextPhase,
  onConfirmed,
  defaultFeedback = "Client has reviewed the layout drawings and is satisfied with the space planning. Requested minor adjustment to the meeting room partition wall width.",
  localOnly = true,
  projectId,
}: {
  phase: string;
  nextPhase: string;
  onConfirmed?: (date: string) => void;
  defaultFeedback?: string;
  /** Confirmation steps are session-local until a backend confirmation API exists. */
  localOnly?: boolean;
  projectId?: string;
}) {
  const authDisabled = isAuthDisabled();
  const persist = !localOnly && Boolean(projectId) && !authDisabled;
  const confirmation = useThreeDConfirmation(persist ? projectId : undefined);

  const [localSteps, setLocalSteps] = useState<Set<Step>>(new Set(["presented"]));
  const [localFeedback, setLocalFeedback] = useState(defaultFeedback);
  const [localConfirmedDate, setLocalConfirmedDate] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [focused, setFocused] = useState(false);
  const revision = useRef(0);

  const serverDraft = confirmation.data ? draftFromConfirmation(confirmation.data) : null;
  const view: Draft = persist
    ? (draft ??
      serverDraft ?? {
        steps: new Set<Step>(),
        feedback: "",
        confirmedDate: null,
      })
    : {
        steps: localSteps,
        feedback: localFeedback,
        confirmedDate: localConfirmedDate,
      };

  const doneSteps = view.steps;
  const feedback = view.feedback;
  const confirmedDate = view.confirmedDate;
  const canConfirm = doneSteps.has("presented") && doneSteps.has("feedback");
  const isNextDetailDrawings = nextPhase === "Detail Drawings";

  const setView = (next: Draft) => {
    if (persist) {
      setDraft(next);
      return;
    }
    setLocalSteps(next.steps);
    setLocalFeedback(next.feedback);
    setLocalConfirmedDate(next.confirmedDate);
  };

  const toggle = (step: Step) => {
    const next = new Set(doneSteps);
    if (next.has(step)) next.delete(step);
    else next.add(step);

    if (persist && next.has("confirmed") && (!next.has("presented") || !next.has("feedback"))) {
      if (step === "confirmed") {
        toast.error("Client confirmation required before proceeding to next stage");
        return;
      }
      next.delete("confirmed");
    }

    const nextDraft: Draft = {
      steps: next,
      feedback,
      confirmedDate: next.has("confirmed") ? confirmedDate : null,
    };
    const rev = ++revision.current;
    setView(nextDraft);
    if (!persist) return;

    void confirmation
      .save({
        presented: next.has("presented"),
        feedback_received: next.has("feedback"),
        confirmed: next.has("confirmed"),
        feedback_notes: feedback,
      })
      .then((saved) => {
        if (revision.current !== rev) return;
        setDraft(draftFromConfirmation(saved));
      })
      .catch((error) => {
        if (revision.current !== rev) return;
        setDraft(null);
        toast.error(errorMessage(error));
      });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const today = formatConfirmationDate(new Date());
    const next = new Set<Step>(["presented", "feedback", "confirmed"]);
    const nextDraft: Draft = { steps: next, feedback, confirmedDate: today };
    const rev = ++revision.current;
    setView(nextDraft);

    if (!persist) {
      onConfirmed?.(today);
      return;
    }

    void confirmation
      .save({
        presented: true,
        feedback_received: true,
        confirmed: true,
        feedback_notes: feedback,
      })
      .then((saved) => {
        if (revision.current !== rev) return;
        const savedDraft = draftFromConfirmation(saved);
        setDraft(savedDraft);
        if (savedDraft.confirmedDate) onConfirmed?.(savedDraft.confirmedDate);
      })
      .catch((error) => {
        if (revision.current !== rev) return;
        setDraft(null);
        toast.error(errorMessage(error));
      });
  };

  const saveNotes = () => {
    if (!persist || !confirmation.data) return;
    if (feedback === confirmation.data.feedback_notes) return;
    const rev = ++revision.current;
    void confirmation
      .save({ feedback_notes: feedback })
      .then((saved) => {
        if (revision.current !== rev) return;
        setDraft(draftFromConfirmation(saved));
      })
      .catch((error) => {
        if (revision.current !== rev) return;
        setDraft(null);
        toast.error(errorMessage(error));
      });
  };

  return (
    <SectionCard>
      <SectionTitle icon="campaign" title="Client Presentation & Confirmation" />

      {localOnly && (
        <div className="mb-4 flex items-start gap-2 rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2.5 text-[12px] text-[#92400E]">
          <MaterialIcon name="info" outlined size={16} className="mt-0.5 shrink-0" />
          <span>
            Confirmation checklist for {phase} is tracked in this session only — it is not saved to the
            server yet.
          </span>
        </div>
      )}

      {persist && confirmation.isLoading && (
        <p className="text-[13px] text-[var(--figma-gray500)]">Loading confirmation…</p>
      )}

      {persist && confirmation.error && !confirmation.data && (
        <p className="text-[13px] text-[var(--figma-alert)]">{errorMessage(confirmation.error)}</p>
      )}

      {(!persist || confirmation.data) && (
        <>
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
              onChange={(e) =>
                setView({
                  steps: doneSteps,
                  feedback: e.target.value,
                  confirmedDate,
                })
              }
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                saveNotes();
              }}
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
                onClick={() => toast("Confirmation Details", { description: feedback || "No feedback provided." })}
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
        </>
      )}
    </SectionCard>
  );
}
