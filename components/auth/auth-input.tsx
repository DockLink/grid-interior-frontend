"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import * as motion from "framer-motion/client";
import { CircleAlert, type LucideIcon } from "lucide-react";

import { LOGIN_T } from "@/components/auth/login-tokens";

type AuthInputProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: LucideIcon;
  rightSlot?: React.ReactNode;
  index?: number;
  id?: string;
  autoComplete?: string;
  disabled?: boolean;
};

export function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  rightSlot,
  index = 0,
  id,
  autoComplete,
  disabled,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.22, ease: "easeOut" }}
      className="mb-4"
    >
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-[13px] font-medium text-[#16233D]"
      >
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <span
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
            style={{ color: focused ? LOGIN_T.teal : LOGIN_T.textSecondary }}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className="w-full rounded-xl bg-white text-[14px] text-[#16233D] outline-none transition-all duration-150 placeholder:text-[#5B6B85]/60 disabled:opacity-60"
          style={{
            padding: `11px ${rightSlot || error ? "44px" : "14px"} 11px ${Icon ? "40px" : "14px"}`,
            border: `1.5px solid ${error ? LOGIN_T.danger : focused ? LOGIN_T.teal : LOGIN_T.border}`,
            boxShadow:
              focused && !error
                ? "0 0 0 3px rgba(15,168,160,0.13)"
                : error
                  ? "0 0 0 3px rgba(255,107,107,0.10)"
                  : "none",
          }}
        />
        {error ? (
          <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#FF6B6B]">
            <CircleAlert className="size-[15px]" aria-hidden />
          </span>
        ) : rightSlot ? (
          <span className="absolute top-1/2 right-3.5 -translate-y-1/2">{rightSlot}</span>
        ) : null}
      </div>
      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-center gap-1 text-[12px] text-[#FF6B6B]"
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
