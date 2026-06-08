import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Avenue Residence Portal",
  description:
    "Live weather and next city-bound trains from Balaclava for The Avenue.",
};

// Tell the browser the design is 1920px wide and let it scale to fit the
// actual viewport. Browsers honor this by auto-zooming.
export const viewport: Viewport = {
  width: 1920,
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
