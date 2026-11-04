"use client";
import { useEffect } from "react";
import type { LocalNotificationSchema } from "@capacitor/local-notifications";
import { DAYS, loadPersonal, loadSettings, type ClassItem } from "@/lib/schedule";

// ID pengingat jadwal selalu >= BASE, supaya tidak bentrok dengan pengingat deadline
const BASE = 1_000_000_000;
const capDay = (d: number) => (d === 7 ? 1 : d + 1); // Capacitor: 1 = Minggu ... 7 = Sabtu
const prevDay = (d: number) => (d === 1 ? 7 : d - 1);

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h) % 800_000_000;
}

async function run() {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;

  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return;

  const settings = loadSettings();
  let items: ClassItem[] = loadPersonal();

  if (settings.includeCohort) {
    try {
      const res = await fetch("/api/schedule", { cache: "no-store" });
      if (res.ok) items = [...items, ...((await res.json()) as ClassItem[])];
    } catch { /* offline: pakai jadwal pribadi saja */ }
  }

  // hapus hanya pengingat jadwal lama, deadline tidak disentuh
  const pending = await LocalNotifications.getPending();
  const mine = pending.notifications.filter((n) => n.id >= BASE);
  if (mine.length) await LocalNotifications.cancel({ notifications: mine.map((n) => ({ id: n.id })) });

  const out: LocalNotificationSchema[] = [];

  // H-1: satu notifikasi per hari, berisi semua kuliah besok
  if (settings.h1) {
    for (let day = 1; day <= 7; day++) {
      const list = items.filter((i) => i.day === day).sort((a, b) => a.start.localeCompare(b.start));
      if (!list.length) continue;
      out.push({
        id: BASE + day,
        title: `Besok ${DAYS[day - 1]}: ${list.length} kuliah`,
        body: list.map((i) => `${i.start} ${i.course}${i.room ? ` (${i.room})` : ""}`).join(" | "),
        schedule: { on: { weekday: capDay(prevDay(day)), hour: settings.h1Hour, minute: 0 }, allowWhileIdle: true },
      });
    }
  }

  // pengingat X menit sebelum kuliah
  if (settings.before > 0) {
    for (const i of items) {
      const [h, m] = i.start.split(":").map(Number);
      let mins = h * 60 + m - settings.before;
      let day = i.day;
      if (mins < 0) { mins += 1440; day = prevDay(day); }
      out.push({
        id: BASE + 100 + hash(`${i.source}:${i.id}`),
        title: `${i.course} mulai ${i.start}`,
        body: `${settings.before} menit lagi${i.room ? ` · ${i.room}` : ""}`,
        schedule: { on: { weekday: capDay(day), hour: Math.floor(mins / 60), minute: mins % 60 }, allowWhileIdle: true },
      });
    }
  }

  if (out.length) await LocalNotifications.schedule({ notifications: out });
}

export default function ScheduleReminders() {
  useEffect(() => {
    run();
    window.addEventListener("ep:schedule-changed", run);
    return () => window.removeEventListener("ep:schedule-changed", run);
  }, []);
  return null;
}