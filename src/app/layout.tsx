import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELECTRICAL PHASE",
  description: "Jadwal, deadline, dan arsip angkatan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body suppressHydrationWarning>{children}</body></html>;
}