import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Michael Sonick, DMD — Business Dashboard",
  description: "One-glance view of every weekly touch point: social, email, newsletter, cold email, course & book sales, speaking, and Stripe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
