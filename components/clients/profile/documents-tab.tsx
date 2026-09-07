"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ClientDocumentUploadModal } from "@/components/clients/client-document-upload-modal";
import { GradientButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { authApiClient } from "@/lib/api/authenticated-client";
import { CLIENT_DOC_TYPE_COLORS } from "@/lib/clients/map-client-documents";
import type { ClientDocumentFile, ClientDocumentFolder, ClientLinkedProject } from "@/types/clients";
import type { DownloadUrlResponse } from "@/types/files";
import { cn } from "@/lib/utils";

export function DocumentsTab({
  folders,
  files,
  linkedProjects,
  isLoading,
  onRefresh,
}: {
  folders: ClientDocumentFolder[];
  files: ClientDocumentFile[];
  linkedProjects: ClientLinkedProject[];
  isLoading?: boolean;
  onRefresh?: () => void;
}) {
  const [showUpload, setShowUpload] = useState(false);

  const handleDownload = async (file: ClientDocumentFile) => {
    try {
      const res = await authApiClient<{ data: DownloadUrlResponse }>(
        `/files/${file.id}/download-url`,
      );
      window.open(res.data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open file");
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-[var(--figma-gray500)]">Loading documents…</div>;
  }

  if (linkedProjects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--figma-border)] bg-white px-6 py-10 text-center">
        <MaterialIcon name="description" outlined size={36} className="mb-2 text-[var(--figma-gray400)]" />
        <p className="m-0 text-sm text-[var(--figma-gray500)]">
          Link a project to view and upload documents.
        </p>
      </div>
    );
  }

  return (
    <div>
      {folders.length > 0 ? (
        <div className="mb-5 grid grid-cols-3 gap-3">
          {folders.map((f) => (
            <div key={f.path} className="flex items-center gap-3 rounded-xl bg-white p-4 neu-card">
              <MaterialIcon name="folder" outlined size={28} style={{ color: f.color }} />
              <div>
                <div className="text-[13px] font-semibold text-[var(--figma-navy)]">{f.label}</div>
                <div className="text-[11px] text-[var(--figma-gray400)]">{f.count} files</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[14px] bg-white neu-card">
        <div className="flex items-center justify-between border-b border-[var(--figma-border)] px-4 py-3.5">
          <span className="text-[13px] font-bold text-[var(--figma-navy)]">Recent Files</span>
          <GradientButton icon="upload" size="sm" onClick={() => setShowUpload(true)}>
            Upload File
          </GradientButton>
        </div>
        {files.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--figma-gray500)]">
            No files found across linked projects yet.
          </div>
        ) : (
          files.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => void handleDownload(f)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-[rgba(14,124,134,0.04)]",
                i < files.length - 1 && "border-b border-[var(--figma-border)]",
              )}
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${CLIENT_DOC_TYPE_COLORS[f.type] ?? "var(--figma-navy)"}14` }}
              >
                <MaterialIcon
                  name="description"
                  outlined
                  size={16}
                  style={{ color: CLIENT_DOC_TYPE_COLORS[f.type] ?? "var(--figma-navy)" }}
                />
              </div>
              <span className="flex-1 text-[13px] font-medium text-[var(--figma-navy)]">{f.name}</span>
              <span className="hidden text-[11px] text-[var(--figma-gray400)] sm:inline">{f.projectName}</span>
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background: `${CLIENT_DOC_TYPE_COLORS[f.type] ?? "var(--figma-navy)"}14`,
                  color: CLIENT_DOC_TYPE_COLORS[f.type] ?? "var(--figma-navy)",
                }}
              >
                {f.type}
              </span>
              <span className="text-[11px] text-[var(--figma-gray400)]">{f.size}</span>
              <span className="text-[11px] text-[var(--figma-gray400)]">{f.date}</span>
            </button>
          ))
        )}
      </div>

      {showUpload ? (
        <ClientDocumentUploadModal
          projects={linkedProjects}
          onClose={() => setShowUpload(false)}
          onUploaded={onRefresh}
        />
      ) : null}
    </div>
  );
}
