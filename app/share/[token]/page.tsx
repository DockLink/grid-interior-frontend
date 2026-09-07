import Link from "next/link";

import { MaterialIcon } from "@/components/projects/hub/material-icon";

type ShareMeta = {
  token: string;
  file_id: string;
  file_name?: string | null;
  expires_at?: string | null;
  allow_download?: boolean;
  mime_type?: string | null;
};

async function fetchShareMeta(token: string): Promise<ShareMeta | null> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  const origin = base.startsWith("http") ? base : `https://${base}`;

  try {
    const res = await fetch(`${origin}/api/share/public/${token}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as ShareMeta;
  } catch {
    return null;
  }
}

function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return "No expiry";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ShareLandingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const meta = await fetchShareMeta(token);
  const fileId = meta?.file_id;
  const fileName = meta?.file_name ?? "Shared file";
  const contentHref = fileId
    ? `/share/${token}/file/${fileId}/content`
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--figma-gray50,#F9FAFB)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[var(--neu-card,0_4px_24px_rgba(27,42,74,0.08))]">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-[rgba(14,124,134,0.10)]">
          <MaterialIcon name="link" size={28} className="text-[var(--figma-teal,#0E7C86)]" />
        </div>

        <h1 className="mb-2 text-xl font-bold text-[var(--figma-navy,#1B2A4A)]">
          Shared file
        </h1>

        {!meta ? (
          <>
            <p className="mb-6 text-sm text-[var(--figma-gray500,#6B7280)]">
              This share link is invalid or has expired.
            </p>
            <Link
              href="/login"
              className="inline-flex text-sm font-semibold text-[var(--figma-teal,#0E7C86)] no-underline"
            >
              Sign in to GRID CRM
            </Link>
          </>
        ) : (
          <>
            <p className="mb-1 text-base font-semibold text-[var(--figma-navy,#1B2A4A)]">
              {fileName}
            </p>
            <p className="mb-6 text-sm text-[var(--figma-gray500,#6B7280)]">
              Expires: {formatExpiry(meta.expires_at)}
              {meta.mime_type ? ` · ${meta.mime_type}` : ""}
            </p>

            {contentHref ? (
              <a
                href={contentHref}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--figma-navy,#1B2A4A)] px-4 py-3 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
              >
                <MaterialIcon name={meta.allow_download ? "download" : "visibility"} size={18} />
                {meta.allow_download ? "Download file" : "View file"}
              </a>
            ) : null}

            <p className="text-center text-xs text-[var(--figma-gray400,#9CA3AF)]">
              GRID Interior · Secure file share
            </p>
          </>
        )}
      </div>
    </div>
  );
}
