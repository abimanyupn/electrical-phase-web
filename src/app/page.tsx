import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, LockKeyhole, Users } from "lucide-react";
import PublicShell from "@/components/public-shell";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, BUCKET } from "@/lib/supabase/service";
import { dayMonth, timeOf, CATEGORY_LABEL } from "@/lib/format";

const TONES = ["peach", "sage", "lilac"];

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ data: deadlines }, { data: events }, { data: photos }] = await Promise.all([
    supabase.from("tasks").select("*")
      .eq("scope", "cohort")
      .gte("due_at", now).order("due_at").limit(3),
    supabase.from("events").select("*")
      .gte("starts_at", now).order("starts_at").limit(2),
    supabase.from("photos").select("id, storage_path, caption")
      .eq("status", "approved").order("created_at", { ascending: false }).limit(4),
  ]);

  const photoUrls = new Map<string, string>();
  if (photos && photos.length > 0) {
    const { data: signed } = await createServiceClient().storage.from(BUCKET)
      .createSignedUrls(photos.map((p) => p.storage_path), 3600);
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) photoUrls.set(s.path, s.signedUrl);
    });
  }

  return <PublicShell>
    <section className="public-welcome"><div><div className="eyebrow">// ANGKATAN 2025</div><h1>Salam Setrum.<br/><em>Selalu Jaya.</em></h1><p className="public-lead">Jadwal, deadline, dan arsip angkatan di satu tempat. Buat yang malas buka grup angkatan.</p><div className="welcome-actions"><Link href="/deadlines" className="primary-button">Cek deadline <ArrowRight size={16}/></Link><Link href="/ruang" className="subtle-link">Buka dashboard <ArrowRight size={15}/></Link></div></div><div className="public-art" aria-label="Kolase arsip angkatan"><div className="art-sun"/><span className="art-flower flower-a">+</span><span className="art-flower flower-b">×</span><div className="yearbook-card yearbook-left"><div className="yearbook-photo photo-green">BELUM<br/>TIDUR</div><span>fig. 01</span></div><div className="yearbook-card yearbook-right"><div className="yearbook-photo photo-peach">EST.<br/>2025</div><span>angkatan &apos;25</span></div><div className="art-tape"/><span className="art-note">arsip, bukan pajangan</span></div></section>

    <section className="access-note"><div className="access-icon"><LockKeyhole size={18}/></div><div><strong>Semua bisa dilihat tanpa login.</strong><p>Login cuma buat PJ dan admin yang mau mengelola isi.</p></div><Link href="/login">Login PJ <ArrowRight size={14}/></Link></section>

    <div className="public-section-heading"><div><span className="eyebrow">JANGAN SAMPAI TELAT</span><h2>Deadline terdekat</h2></div><Link href="/deadlines" className="section-link">Semua deadline <ArrowRight size={15}/></Link></div>
    <section className="public-deadline-grid">
      {deadlines?.length === 0 && <p>Belum ada deadline. Aman, untuk sekarang.</p>}
      {deadlines?.map((t, i) => {
        const { day, month } = dayMonth(t.due_at);
        return <article className="public-deadline-card" key={t.id}>
          <div className={`date-tile ${TONES[i % 3]}`}><strong>{day}</strong><span>{month}</span></div>
          <div>
            <span className="small-label">{CATEGORY_LABEL[t.category]}</span>
            <h3>{t.title}</h3>
            <p><Clock3 size={13}/>{[t.description, timeOf(t.due_at)].filter(Boolean).join(" · ")}</p>
          </div>
        </article>;
      })}
    </section>

    <div className="public-lower-grid">
      <section className="public-panel">
        <div className="public-section-heading compact"><div><span className="eyebrow">CATAT</span><h2>Agenda mendatang</h2></div><CalendarDays size={19}/></div>
        {events?.length === 0 && <p>Belum ada agenda.</p>}
        {events?.map((e, i) => {
          const { day, month } = dayMonth(e.starts_at);
          return <div className="public-event" key={e.id}>
            <div className={`date-tile ${i ? "lilac" : "peach"}`}><strong>{day}</strong><span>{month}</span></div>
            <div><h3>{e.title}</h3><p>{timeOf(e.starts_at)} WITA · {e.location ?? "Lokasi menyusul"}</p></div>
          </div>;
        })}
        <Link href="/calendar" className="panel-cta">Kalender lengkap <ArrowRight size={15}/></Link>
      </section>

      <section className="join-card"><span className="eyebrow">KHUSUS PJ & ADMIN</span><h2>Mau nambah deadline?</h2><p>Semua info di sini terbuka tanpa login. Login cuma buat PJ dan admin yang perlu nambah atau ngatur deadline, agenda, dan foto.</p><Link href="/login" className="join-button"><Users size={16}/> Login PJ <ArrowRight size={15}/></Link></section>
    </div>

    <div className="public-section-heading"><div><span className="eyebrow">ARSIP</span><h2>Galeri angkatan</h2></div><Link href="/galeri" className="section-link">Semua foto <ArrowRight size={15}/></Link></div>
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
      {photos?.length === 0 && <p>Belum ada foto. <Link href="/galeri">Kirim yang pertama.</Link></p>}
      {photos?.map((p) => {
        const src = photoUrls.get(p.storage_path);
        return src && <figure className="polaroid" key={p.id}>
          <img src={src} alt={p.caption ?? ""} style={{ width: "100%" }} />
          {p.caption && <figcaption>{p.caption}</figcaption>}
        </figure>;
      })}
    </section>
  </PublicShell>;
}