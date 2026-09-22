"use client";

import { ArrowRight, FileText, ImageIcon, Layers, Table2 } from "lucide-react";
import Link from "next/link";

import {
  FILE_ACTIVITY_DATA,
  fileExtColor,
  type FileActivityItem,
} from "@/components/dashboard/studio/demo-data";
import { NAV_ROUTES } from "@/types/navigation";

function FileIcon({ ext }: { ext: string }) {
  const color = fileExtColor(ext);
  const className = "size-2.5";
  if (["png", "jpg", "jpeg"].includes(ext)) {
    return <ImageIcon className={className} style={{ color }} />;
  }
  if (["xlsx", "csv"].includes(ext)) {
    return <Table2 className={className} style={{ color }} />;
  }
  if (ext === "dwg") {
    return <Layers className={className} style={{ color }} />;
  }
  return <FileText className={className} style={{ color }} />;
}

export function FileActivityPanel({
  items = FILE_ACTIVITY_DATA,
  title = "Recent File Activity",
  subtitle = "Most recent uploads",
}: {
  items?: FileActivityItem[];
  title?: string;
  subtitle?: string;
}) {
  const total = items.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E9F0] bg-white shadow-[0px_4px_16px_rgba(11,37,69,0.06)]">
      <div className="border-b border-[#E4E9F0] px-5 py-4">
        <h3 className="text-[15px] font-semibold text-[#16233D]">{title}</h3>
        <p className="text-[12px] text-[#5B6B85]">
          {total === 0 ? "No recent uploads" : subtitle}
        </p>
      </div>
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[rgba(11,37,69,0.06)]">
            <FileText className="size-6 text-[#0B2545]" />
          </div>
          <div className="mb-1 text-[14px] font-semibold text-[#16233D]">No recent files</div>
          <div className="text-[12px] text-[#5B6B85]">
            Newly uploaded project files will show up here.
          </div>
        </div>
      ) : (
        <div className="relative px-5 py-4">
          <div className="absolute top-8 bottom-8 left-[32px] w-0.5 rounded-full bg-[#E7F9EE]" />
          {items.map((file) => {
            const color = fileExtColor(file.ext);
            return (
              <div key={file.id} className="relative mb-4 flex gap-3 last:mb-0">
                <div
                  className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `${color}18`,
                    border: `1.5px solid ${color}30`,
                  }}
                >
                  <FileIcon ext={file.ext} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] leading-tight font-medium text-[#16233D]">
                    {file.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#5B6B85]">
                    <span className="font-medium">{file.project}</span> · {file.uploader}
                  </div>
                </div>
                <div className="mt-0.5 shrink-0 text-[11px] text-[#5B6B85]">
                  {file.time}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="border-t border-[#E4E9F0] px-5 py-3">
        <Link
          href={NAV_ROUTES.files}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0FA8A0] transition-colors hover:text-[#0B9990]"
        >
          <ArrowRight className="size-3" />
          View all files
        </Link>
      </div>
    </div>
  );
}
