import Link from "next/link";
import { UserRound } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <div className="min-h-svh bg-[#F8FAFB]">
      <Empty>
        <EmptyMedia>
          <UserRound size={36} className="text-[#5B6B85]" />
        </EmptyMedia>
        <p className="text-[52px] leading-none font-bold text-[#E4E9F0]">404</p>
        <EmptyTitle className="mt-2">Page Not Found</EmptyTitle>
        <EmptyDescription>
          The page you requested doesn&apos;t exist or was moved.
        </EmptyDescription>
        <EmptyContent>
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-full bg-gradient-to-br from-[#0FA8A0] to-[#0B2545] px-5 text-[13px] font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
