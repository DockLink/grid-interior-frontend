"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useProjectFiles } from "@/hooks/use-project-files";
import { authApiClient } from "@/lib/api/authenticated-client";
import type { ClientLinkedProject } from "@/types/clients";
import type { ProjectFolderTree } from "@/types/files";

function flattenFolders(tree: ProjectFolderTree | null): { path: string; label: string }[] {
  if (!tree?.tree) return [];
  const out: { path: string; label: string }[] = [];
  const walk = (nodes: ProjectFolderTree["tree"]) => {
    for (const node of nodes) {
      out.push({ path: node.path, label: node.name });
      if (node.children?.length) walk(node.children);
    }
  };
  walk(tree.tree);
  return out;
}

function UploadPanel({
  projectId,
  folderPath,
  onUploaded,
}: {
  projectId: string;
  folderPath: string;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useProjectFiles(projectId);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      await uploadFile(folderPath, file);
      toast.success("File uploaded");
      onUploaded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] p-4 text-center">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <MaterialIcon name="upload_file" outlined size={28} className="mb-2 text-[var(--figma-teal)]" />
      <p className="m-0 mb-2 text-[13px] text-[var(--figma-gray500)]">
        Upload to <strong>{folderPath}</strong>
      </p>
      <GradientButton
        icon="upload"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading…" : "Choose File"}
      </GradientButton>
    </div>
  );
}

export function ClientDocumentUploadModal({
  projects,
  onClose,
  onUploaded,
}: {
  projects: ClientLinkedProject[];
  onClose: () => void;
  onUploaded?: () => void;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [folderPath, setFolderPath] = useState("");
  const [tree, setTree] = useState<ProjectFolderTree | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);

  const folders = flattenFolders(tree);

  const loadTree = async (id: string) => {
    setLoadingTree(true);
    setFolderPath("");
    setTree(null);
    try {
      const res = await authApiClient<{ data: ProjectFolderTree }>(`/projects/${id}/files/tree`);
      setTree(res.data ?? null);
      const first = flattenFolders(res.data ?? null)[0];
      if (first) setFolderPath(first.path);
    } catch {
      toast.error("Failed to load project folders");
    } finally {
      setLoadingTree(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.20)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="hub-modal-in w-full max-w-[480px] rounded-[20px] bg-white px-8 py-7"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">Upload Document</h2>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
              Files are stored on a project. Pick where to upload.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-[13px] text-[var(--figma-gray500)]">
            Link a project first before uploading documents.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--figma-navy)]">Project</label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  void loadTree(e.target.value);
                }}
                onFocus={() => {
                  if (!tree && projectId) void loadTree(projectId);
                }}
                className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3 flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--figma-navy)]">Folder</label>
              {loadingTree ? (
                <div className="text-[13px] text-[var(--figma-gray500)]">Loading folders…</div>
              ) : (
                <select
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-sm text-[var(--figma-navy)] outline-none neu-inset"
                >
                  {folders.length === 0 ? (
                    <option value="">No folders — select project first</option>
                  ) : (
                    folders.map((f) => (
                      <option key={f.path} value={f.path}>
                        {f.label}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {projectId && folderPath ? (
              <UploadPanel
                projectId={projectId}
                folderPath={folderPath}
                onUploaded={() => {
                  onUploaded?.();
                  onClose();
                }}
              />
            ) : null}
          </>
        )}

        <div className="mt-5">
          <OutlineButton onClick={onClose} className="w-full">
            Close
          </OutlineButton>
        </div>
      </div>
    </div>
  );
}
