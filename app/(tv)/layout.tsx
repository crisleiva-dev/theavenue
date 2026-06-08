// Minimal root layout for TV signage routes.
// Does NOT import globals.css (no Tailwind) — keeps the HTML payload small
// for basic Android WebView browsers (e.g. Philips 32BDL4050D signage).
//
// This layout overrides app/layout.tsx for any route under (tv)/ because
// Next.js App Router supports per-route-group root layouts.

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "The Avenue Residence Portal",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function TvRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0C111D" }}>
        {children}
      </body>
    </html>
  );
}
