import type { Metadata, Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "The Avenue — Admin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      style={{ overflow: "auto", height: "auto", width: "auto" }}
    >
      <body
        className="bg-bg text-ink"
        style={{ overflow: "auto", height: "auto", width: "auto" }}
      >
        {children}
      </body>
    </html>
  );
}
