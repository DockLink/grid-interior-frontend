import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal — GRID Interior Design",
  description:
    "Your personalised GRID Interior Design client portal — track your project, milestones, and material approvals.",
  robots: "noindex, nofollow",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
