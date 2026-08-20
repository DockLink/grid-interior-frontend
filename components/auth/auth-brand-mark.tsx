"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

import { LOGIN_T } from "@/components/auth/login-tokens";
import { NAV_ROUTES } from "@/types/navigation";

export function AuthBrandMark() {
  return (
    <Link href={NAV_ROUTES.login} className="mb-8 flex items-center gap-2.5">
      <div
        className="flex size-8 items-center justify-center rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${LOGIN_T.teal}, ${LOGIN_T.navy})`,
        }}
      >
        <Layers className="size-4 text-white" aria-hidden />
      </div>
      <span className="text-[14px] font-semibold text-[#16233D]">Grid Interior</span>
    </Link>
  );
}
