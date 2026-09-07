"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { uploadFileMultipart } from "@/lib/files/multipart-upload";
import { queryKeys } from "@/lib/query/keys";
import type {
  CreateShareLinkPayload,
  DownloadUrlResponse,
  ProjectFile,
  ProjectFolderRecord,
  ProjectFolderTree,
  ShareLinkResponse,
} from "@/types/files";

async function fetchFolderTree(projectId: string): Promise<ProjectFolderTree> {
  const res = await authApiClient<{ data: ProjectFolderTree }>(
    `/projects/${projectId}/files/tree`,
  );
  return res.data;
}

async function fetchFolderFiles(
  projectId: string,
  folderPath: string,
): Promise<ProjectFile[]> {
  const qs = new URLSearchParams({ folderPath });
  const res = await authApiClient<{ data: ProjectFile[] }>(
    `/projects/${projectId}/files?${qs}`,
  );
  return res.data ?? [];
}

export function useProjectFiles(projectId: string) {
  const qc = useQueryClient();
  const authEnabled = !isAuthDisabled();

  const [currentFolderPath, setCurrentFolderPath] = useState<string | null>(null);
  const hasProvisionedRef = useRef(false);

  const {
    data: folderTree = null,
    isLoading: treeLoading,
    error: treeQueryError,
  } = useQuery({
    queryKey: queryKeys.files.tree(projectId),
    queryFn: () => fetchFolderTree(projectId),
    staleTime: 30_000,
    enabled: authEnabled && Boolean(projectId),
  });

  const {
    data: files = [],
    isLoading: filesLoading,
    error: filesQueryError,
  } = useQuery({
    queryKey: queryKeys.files.folder(projectId, currentFolderPath ?? ""),
    queryFn: () => fetchFolderFiles(projectId, currentFolderPath!),
    staleTime: 30_000,
    enabled: authEnabled && Boolean(projectId) && Boolean(currentFolderPath),
  });

  const treeError = treeQueryError
    ? treeQueryError instanceof Error
      ? treeQueryError.message
      : "Failed to load file tree"
    : null;

  const filesError = filesQueryError
    ? filesQueryError instanceof Error
      ? filesQueryError.message
      : "Failed to load files"
    : null;

  const invalidateTree = useCallback(() => {
    return qc.invalidateQueries({ queryKey: queryKeys.files.tree(projectId) });
  }, [qc, projectId]);

  const invalidateFolder = useCallback(
    (folderPath: string) => {
      return qc.invalidateQueries({
        queryKey: queryKeys.files.folder(projectId, folderPath),
      });
    },
    [qc, projectId],
  );

  const provisionMutation = useMutation({
    mutationFn: async () => {
      await authApiClient(`/projects/${projectId}/folders`, { method: "POST" });
    },
    onSuccess: () => {
      void invalidateTree();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to provision folders");
    },
  });

  const provisionFolders = useCallback(async () => {
    if (hasProvisionedRef.current || provisionMutation.isPending) return;
    hasProvisionedRef.current = true;
    try {
      await provisionMutation.mutateAsync();
    } catch {
      hasProvisionedRef.current = false;
    }
  }, [provisionMutation]);

  const selectFolder = useCallback((path: string | null) => {
    setCurrentFolderPath(path);
  }, []);

  const uploadFile = useCallback(
    async (
      folderPath: string,
      file: File,
      replaceFileId?: string,
      onProgress?: (pct: number) => void,
    ) => {
      const body = await uploadFileMultipart({
        projectId,
        folderPath,
        file,
        replaceFileId,
        onProgress,
      });

      if (currentFolderPath === folderPath) {
        await invalidateFolder(folderPath);
      }
      return body;
    },
    [projectId, currentFolderPath, invalidateFolder],
  );

  const getDownloadUrl = useCallback(async (fileId: string): Promise<string> => {
    const res = await authApiClient<{ data: DownloadUrlResponse }>(
      `/files/${fileId}/download-url`,
    );
    return res.data.downloadUrl;
  }, []);

  const getVersionHistory = useCallback(async (fileId: string): Promise<ProjectFile[]> => {
    const res = await authApiClient<{ data: ProjectFile[] }>(
      `/files/${fileId}/versions`,
    );
    return res.data ?? [];
  }, []);

  const deleteFile = useCallback(
    async (fileId: string) => {
      await authApiClient(`/files/${fileId}`, { method: "DELETE" });
      if (currentFolderPath) {
        qc.setQueryData<ProjectFile[]>(
          queryKeys.files.folder(projectId, currentFolderPath),
          (prev) => (prev ?? []).filter((f) => f.id !== fileId),
        );
      }
    },
    [currentFolderPath, projectId, qc],
  );

  const renameFile = useCallback(
    async (fileId: string, fileName: string): Promise<ProjectFile> => {
      const res = await authApiClient<{ data: ProjectFile }>(
        `/files/${fileId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ fileName }),
        },
      );
      if (currentFolderPath) {
        qc.setQueryData<ProjectFile[]>(
          queryKeys.files.folder(projectId, currentFolderPath),
          (prev) => (prev ?? []).map((f) => (f.id === fileId ? res.data : f)),
        );
      }
      return res.data;
    },
    [currentFolderPath, projectId, qc],
  );

  const createShareLink = useCallback(
    async (fileId: string, payload: CreateShareLinkPayload): Promise<ShareLinkResponse> => {
      const res = await authApiClient<{ data: ShareLinkResponse }>(
        `/files/${fileId}/share`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      return res.data;
    },
    [],
  );

  const revokeShareLink = useCallback(async (token: string): Promise<void> => {
    await authApiClient(`/share/${token}`, { method: "DELETE" });
  }, []);

  const createFolder = useCallback(
    async (name: string, parentPath: string | null) => {
      const res = await authApiClient<{ data: ProjectFolderRecord }>(
        `/projects/${projectId}/folders/custom`,
        {
          method: "POST",
          body: JSON.stringify({ name, parentPath }),
        },
      );
      await invalidateTree();
      return res.data;
    },
    [projectId, invalidateTree],
  );

  const renameFolder = useCallback(
    async (path: string, newName: string) => {
      const res = await authApiClient<{ data: ProjectFolderRecord }>(
        `/projects/${projectId}/folders`,
        {
          method: "PATCH",
          body: JSON.stringify({ path, newName }),
        },
      );
      await invalidateTree();
      if (currentFolderPath?.startsWith(path)) {
        const suffix = currentFolderPath.slice(path.length);
        const newPath =
          path === currentFolderPath
            ? res.data.path
            : res.data.path + suffix;
        setCurrentFolderPath(newPath);
      }
      return res.data;
    },
    [projectId, invalidateTree, currentFolderPath],
  );

  const deleteFolder = useCallback(
    async (path: string) => {
      const qs = new URLSearchParams({ path });
      await authApiClient(`/projects/${projectId}/folders?${qs}`, {
        method: "DELETE",
      });
      if (currentFolderPath === path || currentFolderPath?.startsWith(`${path}/`)) {
        setCurrentFolderPath(null);
      }
      await invalidateTree();
    },
    [projectId, invalidateTree, currentFolderPath],
  );

  const reloadFiles = useCallback(() => {
    if (!currentFolderPath) return Promise.resolve();
    return invalidateFolder(currentFolderPath);
  }, [currentFolderPath, invalidateFolder]);

  const reloadTree = useCallback(() => invalidateTree(), [invalidateTree]);

  return {
    folderTree,
    treeLoading,
    treeError,
    currentFolderPath,
    files,
    filesLoading,
    filesError,
    isProvisioning: provisionMutation.isPending,
    selectFolder,
    provisionFolders,
    uploadFile,
    getDownloadUrl,
    getVersionHistory,
    deleteFile,
    renameFile,
    createShareLink,
    revokeShareLink,
    createFolder,
    renameFolder,
    deleteFolder,
    reloadFiles,
    reloadTree,
  };
}
