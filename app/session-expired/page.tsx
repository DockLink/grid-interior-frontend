"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import { AuthBrandMark } from "@/components/auth/auth-brand-mark";
import { AuthCard } from "@/components/auth/auth-card";
import { LOGIN_T } from "@/components/auth/login-tokens";
import { NAV_ROUTES } from "@/types/navigation";

export default function SessionExpiredPage() {
  return (
    <div
      className="flex min-h-svh items-center justify-center px-4 py-12"
      style={{ background: LOGIN_T.surface, fontFamily: "Aptos, Calibri, system-ui, sans-serif" }}
    >
      <AuthCard>
        <AuthBrandMark />
        <div
          className="mb-5 flex size-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(255,107,107,0.10)" }}
        >
          <Clock className="size-7 text-[#FF6B6B]" />
        </div>
        <h1 className="mb-1 text-[22px] font-bold text-[#16233D]">Session expired</h1>
        <p className="mb-7 text-[14px] leading-relaxed text-[#5B6B85]">
          For your security, you were signed out. Sign in again to continue working in your studio workspace.
        </p>
        <Link
          href={NAV_ROUTES.login}
          className="flex w-full items-center justify-center rounded-full py-3 text-[15px] font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${LOGIN_T.teal} 0%, ${LOGIN_T.navy} 100%)`,
          }}
        >
          Sign in again
        </Link>
      </AuthCard>
    </div>
  );
}
