"use client";

import { Clock, Download, Share2 } from "lucide-react";

import { FileTypeIcon } from "@/components/projects/files/file-type-icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetCloseButton,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fileExtension, formatFileDate, formatFileSize } from "@/lib/files/format";
import type { ProjectFile } from "@/types/files";

export function FileDetailSheet({
  file,
  open,
  onOpenChange,
  canShare,
  canDownload,
  isVersioned,
  onShare,
  onVersionHistory,
  onDownload,
}: {
  file: ProjectFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canShare: boolean;
  canDownload: boolean;
  isVersioned: boolean;
  onShare: (file: ProjectFile) => void;
  onVersionHistory: (file: ProjectFile) => void;
  onDownload: (file: ProjectFile) => void;
}) {
  const ext = file ? fileExtension(file.fileName) : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white">
        <SheetHeader className="relative">
          <SheetTitle className="truncate pr-8">{file?.fileName ?? "File"}</SheetTitle>
          <SheetCloseButton onClick={() => onOpenChange(false)} />
        </SheetHeader>
        <SheetBody className="space-y-5">
          {file && (
            <>
              <div className="flex flex-col items-center rounded-2xl bg-[#F8FAFB] py-10">
                <FileTypeIcon ext={ext} size={42} />
                <p className="mt-3 text-[12px] font-medium tracking-wide text-[#5B6B85] uppercase">
                  {ext || "file"} preview
                </p>
              </div>
              <dl className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#5B6B85]">Folder</dt>
                  <dd className="text-right text-[#16233D]">{file.folderPath}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#5B6B85]">Size</dt>
                  <dd className="text-[#16233D]">{formatFileSize(file.fileSize)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#5B6B85]">Updated</dt>
                  <dd className="text-[#16233D]">{formatFileDate(file.updated_at || file.created_at)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#5B6B85]">Version</dt>
                  <dd className="text-[#16233D]">v{file.version}</dd>
                </div>
              </dl>
              <div className="flex flex-col gap-2">
                {canDownload && (
                  <Button variant="outline" onClick={() => onDownload(file)}>
                    <Download size={14} /> Download
                  </Button>
                )}
                {canShare && (
                  <Button variant="outline" onClick={() => onShare(file)}>
                    <Share2 size={14} /> Share
                  </Button>
                )}
                {isVersioned && (
                  <Button variant="outline" onClick={() => onVersionHistory(file)}>
                    <Clock size={14} /> Version history
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
