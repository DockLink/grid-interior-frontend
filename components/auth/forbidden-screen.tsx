"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { NAV_ROUTES } from "@/types/navigation";

export function ForbiddenScreen() {
  return (
    <Empty>
      <EmptyMedia className="bg-[rgba(255,107,107,0.08)]">
        <Lock size={36} className="text-[#FF6B6B]" />
      </EmptyMedia>
      <p className="text-[52px] leading-none font-bold text-[#FDECEC]">403</p>
      <EmptyTitle className="mt-2">Access Forbidden</EmptyTitle>
      <EmptyDescription>
        You don&apos;t have permission to view this page. Contact your admin to request access.
      </EmptyDescription>
      <EmptyContent>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-xl border border-[#E4E9F0] px-4 text-[13px] font-semibold text-[#16233D] hover:border-[#0FA8A0]"
        >
          Back to Dashboard
        </Link>
        <Link
          href={NAV_ROUTES.accessRequests}
          className="inline-flex h-9 items-center rounded-full bg-gradient-to-br from-[#0FA8A0] to-[#0B2545] px-5 text-[13px] font-semibold text-white"
        >
          Request Access
        </Link>
      </EmptyContent>
    </Empty>
  );
}
