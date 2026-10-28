import type { Metadata } from "next";
import "./globals.css";
import DeadlineReminders from "@/components/deadline-reminders";

export const metadata: Metadata = {
  title: "Electrical Phase",
  description: "Electrical Phase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <DeadlineReminders />
      </body>
    </html>
  );
}