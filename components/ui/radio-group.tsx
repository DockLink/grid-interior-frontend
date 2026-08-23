"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const RadioGroupContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  name: string;
} | null>(null);

function RadioGroup({
  value,
  onValueChange,
  className,
  children,
  name,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
  name?: string;
}) {
  const generated = React.useId();
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name: name ?? generated }}>
      <div role="radiogroup" className={cn("grid gap-2", className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

function RadioGroupItem({
  value,
  id,
  className,
  children,
}: {
  value: string;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioGroupItem must be used within RadioGroup");
  const inputId = id ?? `${ctx.name}-${value}`;
  const checked = ctx.value === value;

  return (
    <label
      htmlFor={inputId}
      className={cn("flex cursor-pointer items-center gap-2 text-sm", className)}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          checked ? "border-[#0FA8A0]" : "border-[#E4E9F0]",
        )}
      >
        {checked ? <span className="size-2 rounded-full bg-[#0FA8A0]" /> : null}
      </span>
      <input
        id={inputId}
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        onChange={() => ctx.onValueChange(value)}
        className="sr-only"
      />
      {children}
    </label>
  );
}

export { RadioGroup, RadioGroupItem };
