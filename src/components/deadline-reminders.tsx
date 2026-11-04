"use client";
import { useEffect } from "react";

function toId(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (Math.abs(h) % 800_000_000) + 100;
}

type Task = { id: string; title: string; description: string | null; due_at: string };

export default function DeadlineReminders() {
  useEffect(() => {
    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return; // di web biasa: tidak ngapa-ngapain

      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== "granted") return;

      const res = await fetch("/api/deadlines", { cache: "no-store" });
      if (!res.ok) return;
      const tasks: Task[] = await res.json();

      const now = Date.now();
      const reminders = [
        { key: "24h", ms: 24 * 3600e3, text: "tinggal 24 jam lagi" },
        { key: "2h", ms: 2 * 3600e3, text: "tinggal 2 jam lagi" },
      ];

      const notifications = tasks.flatMap((t) =>
        reminders
          .map((r) => ({ r, at: new Date(t.due_at).getTime() - r.ms }))
          .filter(({ at }) => at > now)
          .map(({ r, at }) => ({
            id: toId(`${t.id}:${r.key}`),
            title: `Deadline: ${t.title}`,
            body: `${t.description ? t.description + " · " : ""}${r.text}`,
            schedule: { at: new Date(at), allowWhileIdle: true },
          }))
      );

      if (notifications.length) await LocalNotifications.schedule({ notifications });
    })();
  }, []);

  return null;
}