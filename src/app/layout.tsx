import type { Metadata, Viewport } from "next";
import "./globals.css";
import DeadlineReminders from "@/components/deadline-reminders";
import ScheduleReminders from "@/components/schedule-reminders";

export const metadata: Metadata = {
  title: "Electrical Phase",
  description: "Jadwal, deadline, dan arsip Elektro 2025.",
};

export const viewport: Viewport = { themeColor: "#132c51" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        {children}
        <DeadlineReminders />
        <ScheduleReminders />
      </body>
    </html>
  );
}