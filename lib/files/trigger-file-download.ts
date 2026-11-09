/**
 * Trigger a same-origin authenticated file download via the content proxy.
 * Uses a temporary <a download> so the browser saves the file (including images)
 * instead of opening a presigned URL inline.
 */
export function triggerFileDownload(fileId: string, fileName: string): void {
  const params = new URLSearchParams({ fileName: fileName || "download" });
  const href = `/api/files/${encodeURIComponent(fileId)}/content?${params}`;

  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName || "download";
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
