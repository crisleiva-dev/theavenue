import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Avenue Residence Portal",
  description:
    "Live weather and next city-bound trains from Balaclava for The Avenue.",
};

// Use device-width so the page adapts to whatever viewport the browser reports
// (Fire TV Stick, regular browser, etc.). The dashboard CSS uses responsive
// units (clamp, %, grid) so it scales smoothly to any viewport.
export const viewport: Viewport = {
  width: "device-width",
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
