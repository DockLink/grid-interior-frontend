import type { Metadata } from "next";
import { Toaster } from "sonner";

import { AuthHydration } from "@/components/auth/auth-hydration";
import { QueryProvider } from "@/components/providers/query-provider";
import { APP_NAME } from "@/lib/constants";
import { GRID_UI_FONT_STACK } from "@/lib/fonts/grid-ui";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Project Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{ fontFamily: GRID_UI_FONT_STACK }}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full" style={{ fontFamily: GRID_UI_FONT_STACK }}>
        <QueryProvider>
          <AuthHydration />
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
