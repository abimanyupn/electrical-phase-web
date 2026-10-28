"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Bell, CalendarDays, Camera, Check, ChevronRight, CirclePlus, Clock3, Heart, Menu, MoreHorizontal, Plus, Search, UploadCloud } from "lucide-react";
import Sidebar from "@/components/sidebar";

type Task = { id: string | number; title: string; course: string; date: string; tag: string; color: string; done: boolean };
type AgendaItem = { id: string; day: string; month: string; title: string; detail: string };

type Props = {
  photoCount?: number;
  canManage?: boolean;
  loggedIn?: boolean;
  initialTasks?: Task[];
  agenda?: AgendaItem[];
  todayLabel?: string;
};

const initialAnnouncements: {
  date: string; label: string; title: string; body: string; color: string;
}[] = [];

export default function Dashboard({
  photoCount = 0,
  canManage = false,
  loggedIn = false,
  initialTasks = [],
  agenda = [],
  todayLabel = "",
}: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [announcements] = useState(initialAnnouncements);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");

  function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setTasks(current => [...current, {
      id: Date.now(),
      title: newTitle.trim(),
      course: "TUGAS PRIBADI",
      date: newDate ? new Date(newDate + "T12:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Makassar" }) : "Tanpa deadline",
      tag: "Pribadi",
      color: "lavender",
      done: false,
    }]);
    setNewTitle(""); setNewDate(""); setShowAdd(false);
    setToast("Tugas pribadi ditambahkan (demo, belum tersimpan).");
    window.setTimeout(() => setToast(""), 2800);
  }

  function toggleTask(id: string | number) {
    setTasks(current => current.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  const doneCount = tasks.filter(t => t.done).length;

  return <div className="app-shell">
    {mobileMenu && <button className="mobile-scrim" aria-label="Tutup menu" onClick={() => setMobileMenu(false)} />}
    <div className={mobileMenu ? "sidebar-wrap open" : "sidebar-wrap"}>
      <Sidebar onClose={() => setMobileMenu(false)} canManage={canManage} />
    </div>
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Buka menu"><Menu size={20} /></button>
          <span className="breadcrumb">Dashboard <ChevronRight size={14} /> <strong>Beranda</strong></span>
        </div>
        <div className="topbar-actions">
          <button className="search-button"><Search size={17} /><span>Cari sesuatu...</span><kbd>⌘ K</kbd></button>
          <button className="icon-button notification-button" aria-label="Notifikasi" onClick={() => setToast("Notifikasi belum tersedia.")}><Bell size={19} /><i /></button>
          {loggedIn
            ? <div className="avatar avatar-coral top-avatar">A</div>
            : <Link href="/login" className="outline-button">Login</Link>}
        </div>
      </header>

      <div className="content-wrap">
        <section className="welcome-row">
          <div>
            <div className="eyebrow">{todayLabel}</div>
            <h1>Halo. Ini yang belum kamu kerjain.</h1>
            <p className="welcome-subtitle">Semester ini nggak bakal selesai sendiri.</p>
          </div>
          {canManage
            ? <Link href="/admin" className="outline-button">Kelola <ChevronRight size={16} /></Link>
            : !loggedIn && <Link href="/login" className="outline-button">Login PJ <ChevronRight size={16} /></Link>}
        </section>

        <section className="hero-banner">
          <div className="hero-copy">
            <span className="hero-kicker">ELEKTRO / 2025</span>
            <h2>Semester ini<br /><em>belum kelar.</em></h2>
            <p>Kuliah, kabar angkatan, dan arsip foto. Satu tempat, bukan tersebar di story orang.</p>
            <Link href="/galeri" className="hero-button">Buka arsip <ChevronRight size={16} /></Link>
          </div>
          <div className="hero-art">
            <div className="sun-shape" />
            <div className="flower flower-one">+</div>
            <div className="flower flower-two">×</div>
            <div className="polaroid polaroid-one"><div className="polaroid-photo photo-one"><span>BELUM<br />TIDUR</span></div><small>fig. 01</small></div>
            <div className="polaroid polaroid-two"><div className="polaroid-photo photo-two"><span>EST.<br />2025</span></div><small>angkatan &apos;25</small></div>
            <div className="hero-tape" />
            <span className="hero-scribble">arsip, bukan pajangan</span>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon peach-bg"><Check size={18} /></div>
            <div className="stat-label">Tugas selesai</div>
            <div className="stat-value">{doneCount}<span> / {tasks.length}</span></div>
            <div className="stat-foot">
              <span className="tiny-bar"><i style={{ width: `${tasks.length ? doneCount / tasks.length * 100 : 0}%` }} /></span>
              <span>{Math.round(doneCount / Math.max(tasks.length, 1) * 100)}% selesai</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon sage-bg"><Clock3 size={18} /></div>
            <div className="stat-label">Deadline aktif</div>
            <div className="stat-value">{tasks.filter(t => !t.done).length}<span> tugas</span></div>
            <div className="stat-note">Tidur itu bukan dosa.</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon lavender-bg"><CalendarDays size={18} /></div>
            <div className="stat-label">Agenda terdekat</div>
            <div className="stat-value">{agenda.length}<span> agenda</span></div>
            <div className="stat-note">Cek kalender, jangan nebak.</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue-bg"><Camera size={18} /></div>
            <div className="stat-label">Kenangan tersimpan</div>
            <div className="stat-value">{photoCount}<span> foto</span></div>
            <div className="stat-note">Sebelum kepenuhan galeri HP.</div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel task-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">JANGAN SAMPAI TELAT</span><h3>Deadline angkatan</h3></div>
              <Link href="/deadlines" className="text-button">Lihat semua <ChevronRight size={15} /></Link>
            </div>

            {tasks.length === 0 && <p>Belum ada deadline. Aman, untuk sekarang.</p>}
            <div className="task-list">
              {tasks.map(task => <div className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}>
                <button className={`task-check ${task.done ? "checked" : ""}`} onClick={() => toggleTask(task.id)} aria-label={task.done ? "Tandai belum selesai" : "Tandai selesai"}>{task.done && <Check size={14} />}</button>
                <div className="task-main"><strong>{task.title}</strong><span>{task.course}</span></div>
                <span className={`task-tag ${task.color}`}>{task.tag}</span>
                <div className="task-date"><Clock3 size={13} />{task.date}</div>
                <button className="more-button" aria-label="Opsi tugas" onClick={() => setToast("Menu tugas belum tersedia.")}><MoreHorizontal size={18} /></button>
              </div>)}
            </div>

            {loggedIn && <button className="add-task-button" onClick={() => setShowAdd(!showAdd)}><CirclePlus size={17} /> Tambah tugas pribadi</button>}
            {loggedIn && showAdd && <form className="add-task-form" onSubmit={addTask}>
              <label>Nama tugas<input value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="Contoh: Baca materi sebelum kelas" /></label>
              <label>Deadline (opsional)<input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></label>
              <div className="form-actions">
                <button type="button" className="outline-button" onClick={() => setShowAdd(false)}>Batal</button>
                <button className="primary-button" type="submit">Simpan tugas</button>
              </div>
            </form>}
          </div>

          <div className="right-column">
            <div className="panel announcement-panel">
              <div className="panel-heading">
                <div><span className="eyebrow">DARI RUANG KITA</span><h3>Kabar angkatan</h3></div>
                <button className="icon-button small" aria-label="Lihat pengumuman lainnya" onClick={() => setToast("Arsip pengumuman belum tersedia.")}><MoreHorizontal size={18} /></button>
              </div>
              <div className="announcement-list">
                {announcements.map(a => <article className="announcement" key={a.title}>
                  <div className={`announcement-date ${a.color}`}><strong>{a.date.split(" ")[0]}</strong><span>{a.date.split(" ")[1]}</span></div>
                  <div className="announcement-copy"><span className="eyebrow">{a.label}</span><h4>{a.title}</h4><p>{a.body}</p></div>
                  <button className="save-announcement" aria-label="Simpan pengumuman" onClick={() => setToast("Fitur simpan pengumuman segera hadir.")}><Heart size={16} /></button>
                </article>)}
              </div>
              <button className="panel-bottom-link" onClick={() => setToast("Arsip pengumuman belum tersedia.")}>Semua pengumuman <ChevronRight size={15} /></button>
            </div>

            <div className="panel event-panel">
              <div className="panel-heading">
                <div><span className="eyebrow">CATAT</span><h3>Agenda mendatang</h3></div>
                {canManage && <Link href="/admin" className="icon-button small" aria-label="Tambah agenda"><Plus size={18} /></Link>}
              </div>
              {agenda.length === 0 && <p>Belum ada agenda.</p>}
              {agenda.map((e, i) => <div className="event-item" key={e.id}>
                <div className={`event-date ${i % 2 ? "lilac" : ""}`}><strong>{e.day}</strong><span>{e.month}</span></div>
                <div className="event-copy"><strong>{e.title}</strong><span><Clock3 size={13} /> {e.detail}</span></div>
                <span className="event-dot" />
              </div>)}
              <Link href="/calendar" className="panel-bottom-link">Buka kalender <ChevronRight size={15} /></Link>
            </div>
          </div>
        </section>

        <section className="memory-strip">
          <div className="memory-strip-icon">+</div>
          <div><span className="eyebrow">ARSIP</span><h3>hari ini mungkin biasa aja, tapi kedepannya malah dicariin.</h3><p>upload foto kegiatan angkatan sebelum hilang di galeri HP.</p></div>
          <Link href="/galeri" className="outline-button"><UploadCloud size={16} /> Upload</Link>
          <div className="strip-doodle">×</div>
        </section>

        <footer className="footer">
          <span>ELECTRICAL PHASE © 2026</span>
          <span>dibuat dengan tidur seadanya</span>
          <span>bukan produk resmi kampus</span>
        </footer>
      </div>
    </main>
    {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast("")} aria-label="Tutup notifikasi">×</button></div>}
  </div>;
}