import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Avenue Residence Portal",
  description:
    "Live weather and next city-bound trains from Balaclava for The Avenue.",
};

// Fixed-width layout tuned for the lobby TV (matches the original meta viewport).
export const viewport: Viewport = {
  width: 1920,
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
