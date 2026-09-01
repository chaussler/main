import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Podcast Reach Dashboard",
  description:
    "One honest picture of a podcast's reach: RSS downloads, prefix-verified listens, Apple & Spotify behavior, YouTube, social clips, industry benchmarks, and CTA attribution — in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
