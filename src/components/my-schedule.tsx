"use client";
import { useEffect, useState, type FormEvent } from "react";
import {
  DAYS, DEFAULT_SETTINGS, loadPersonal, loadSettings, savePersonal, saveSettings,
  type ClassItem, type Settings,
} from "@/lib/schedule";

export default function MySchedule() {
  const [items, setItems] = useState<ClassItem[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");

  // dibaca setelah mount supaya tidak kena hydration error
  useEffect(() => {
    setItems(loadPersonal());
    setSettings(loadSettings());
    setReady(true);
  }, []);

  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const course = String(fd.get("course") ?? "").trim().slice(0, 80);
    const start = String(fd.get("start") ?? "");
    const end = String(fd.get("end") ?? "");
    const day = Number(fd.get("day"));
    if (!course) return setErr("Nama kuliah wajib diisi.");
    if (!start || !end || end <= start) return setErr("Jam selesai harus setelah jam mulai.");
    setErr("");
    const next: ClassItem[] = [
      ...items,
      { id: crypto.randomUUID(), day, start, end, course, room: String(fd.get("room") ?? "").trim().slice(0, 40), source: "pribadi" },
    ];
    setItems(next);
    savePersonal(next);
    e.currentTarget.reset();
  }

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    savePersonal(next);
  }

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  if (!ready) return null;

  return <section className="panel">
    <span className="eyebrow">KHUSUS KAMU</span>
    <h3>Jadwal pribadi</h3>
    <p>Tersimpan di HP ini saja. Tidak dikirim ke server dan tidak terlihat orang lain.</p>

    {items.length === 0 && <p>Belum ada.</p>}
    {[1, 2, 3, 4, 5, 6, 7].map((d) => {
      const list = items.filter((i) => i.day === d).sort((a, b) => a.start.localeCompare(b.start));
      if (!list.length) return null;
      return <div key={d}>
        <strong>{DAYS[d - 1]}</strong>
        {list.map((i) => <div className="task-row" key={i.id}>
          <div className="task-main">
            <strong>{i.course}</strong>
            <span>{i.start}–{i.end}{i.room ? ` · ${i.room}` : ""}</span>
          </div>
          <button onClick={() => remove(i.id)}>Hapus</button>
        </div>)}
      </div>;
    })}

    <form className="add-task-form" onSubmit={add}>
      <label>Mata kuliah<input name="course" maxLength={80} required /></label>
      <label>Hari
        <select name="day">{DAYS.map((h, i) => <option key={h} value={i + 1}>{h}</option>)}</select>
      </label>
      <label>Mulai<input type="time" name="start" required /></label>
      <label>Selesai<input type="time" name="end" required /></label>
      <label>Ruang (opsional)<input name="room" maxLength={40} /></label>
      {err && <p role="alert" className="form-err">{err}</p>}
      <button className="primary-button" type="submit">Tambah</button>
    </form>

    <h3>Pengingat</h3>
    <p>Berlaku di aplikasi Android.</p>
    <label><input type="checkbox" checked={settings.h1} onChange={(e) => update({ h1: e.target.checked })} /> Pengingat H-1 (malam sebelumnya)</label>
    <label>Jam H-1
      <select value={settings.h1Hour} onChange={(e) => update({ h1Hour: Number(e.target.value) })}>
        {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}.00</option>)}
      </select>
    </label>
    <label>Ingatkan sebelum kuliah
      <select value={settings.before} onChange={(e) => update({ before: Number(e.target.value) })}>
        <option value={0}>Mati</option>
        <option value={15}>15 menit</option>
        <option value={30}>30 menit</option>
        <option value={60}>1 jam</option>
      </select>
    </label>
    <label><input type="checkbox" checked={settings.includeCohort} onChange={(e) => update({ includeCohort: e.target.checked })} /> Ikut jadwal angkatan</label>
  </section>;
}