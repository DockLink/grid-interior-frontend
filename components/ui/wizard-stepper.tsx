"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type WizardStep = {
  label: string;
  icon?: React.ReactNode;
};

export function WizardStepper({
  steps,
  step,
}: {
  steps: WizardStep[];
  step: number;
}) {
  return (
    <div className="mb-10 flex items-center justify-center">
      {steps.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className="relative flex size-10 items-center justify-center rounded-full text-[13px] font-bold"
                animate={{
                  background: done ? "#0FA8A0" : active ? "#0B2545" : "#fff",
                  color: done || active ? "#fff" : "#5B6B85",
                  borderColor: done ? "#0FA8A0" : active ? "#0FA8A0" : "#CBD5E0",
                }}
                style={{
                  borderWidth: 2,
                  borderStyle: "solid",
                  boxShadow: active ? "0 0 0 4px rgba(15,168,160,0.18)" : "none",
                }}
              >
                {done ? <Check size={16} strokeWidth={2.5} /> : i + 1}
              </motion.div>
              <span
                className={cn(
                  "text-[11px] font-semibold whitespace-nowrap",
                  active ? "text-[#0B2545]" : "text-[#5B6B85]",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className="mx-3 mb-5 h-px w-12 sm:w-16"
                style={{ background: i < step ? "#0FA8A0" : "#E4E9F0" }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
