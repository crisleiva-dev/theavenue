import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// Self-hosted by next/font, so the TV never calls Google Fonts directly.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

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
    <html lang="en" className={geist.variable}>
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
