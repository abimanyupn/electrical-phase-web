import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PublicShell from "@/components/public-shell";
import { createClient } from "@/lib/supabase/server";
import { timeOf } from "@/lib/format";

export const dynamic = "force-dynamic";

const TZ = "Asia/Makassar";
const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type Item = { id: string; kind: "deadline" | "agenda"; title: string; at: string; sub: string };

// "2026-10-27" dalam zona WITA
const dayKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

const pad = (n: number) => String(n).padStart(2, "0");

export default async function CalendarPage({
  searchParams,
}: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;

  const todayKey = dayKey(new Date().toISOString());
  const valid = m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : todayKey.slice(0, 7);
  const [y, mo] = valid.split("-").map(Number);

  const prev = mo === 1 ? `${y - 1}-12` : `${y}-${pad(mo - 1)}`;
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${pad(mo + 1)}`;

  const rangeStart = new Date(`${y}-${pad(mo)}-01T00:00:00+08:00`).toISOString();
  const rangeEnd = new Date(`${next}-01T00:00:00+08:00`).toISOString();

  const supabase = await createClient();
  const [{ data: tasks }, { data: events }] = await Promise.all([
    supabase.from("tasks").select("id, title, description, due_at")
      .eq("scope", "cohort").gte("due_at", rangeStart).lt("due_at", rangeEnd).order("due_at"),
    supabase.from("events").select("id, title, location, starts_at")
      .gte("starts_at", rangeStart).lt("starts_at", rangeEnd).order("starts_at"),
  ]);

  const items: Item[] = [
    ...(tasks ?? []).map((t): Item => ({
      id: t.id, kind: "deadline", title: t.title, at: t.due_at, sub: t.description ?? "",
    })),
    ...(events ?? []).map((e): Item => ({
      id: e.id, kind: "agenda", title: e.title, at: e.starts_at, sub: e.location ?? "",
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  const byDay = new Map<string, Item[]>();
  for (const it of items) {
    const k = dayKey(it.at);
    byDay.set(k, [...(byDay.get(k) ?? []), it]);
  }

  const offset = (new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() + 6) % 7; // Senin = 0
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(y, mo - 1, 15)));

  const dateLabel = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(new Date(iso));

  return <PublicShell>
    <div className="cal-head">
      <div>
        <div className="eyebrow">// KALENDER</div>
        <h1>{monthName}</h1>
      </div>
      <div className="cal-nav">
        <Link href={`/calendar?m=${prev}`} className="outline-button" aria-label="Bulan sebelumnya"><ArrowLeft size={16}/></Link>
        <Link href="/calendar" className="outline-button">Hari ini</Link>
        <Link href={`/calendar?m=${next}`} className="outline-button" aria-label="Bulan berikutnya"><ArrowRight size={16}/></Link>
      </div>
    </div>

    <div className="cal-legend">
      <span><i className="dot dot-deadline"/> Deadline</span>
      <span><i className="dot dot-agenda"/> Agenda</span>
    </div>

    <div className="cal-grid" role="grid" aria-label={`Kalender ${monthName}`}>
      {HARI.map(h => <div className="cal-dow" key={h}>{h}</div>)}
      {cells.map((day, i) => {
        if (!day) return <div className="cal-cell cal-empty" key={`e${i}`} />;
        const key = `${y}-${pad(mo)}-${pad(day)}`;
        const list = byDay.get(key) ?? [];
        return <div className={`cal-cell ${key === todayKey ? "cal-today" : ""}`} key={key}>
          <span className="cal-num">{day}</span>
          {list.slice(0, 2).map(it =>
            <span key={it.id} className={`cal-chip chip-${it.kind}`} title={it.title}>{it.title}</span>)}
          {list.length > 2 && <span className="cal-more">+{list.length - 2} lagi</span>}
        </div>;
      })}
    </div>

    <section className="panel cal-list">
      <span className="eyebrow">DAFTAR BULAN INI</span>
      <h3>{items.length} item</h3>
      {items.length === 0 && <p>Belum ada deadline atau agenda di bulan ini.</p>}
      {items.map(it => <div className="cal-row" key={it.id}>
        <i className={`dot dot-${it.kind}`} />
        <div className="cal-row-main">
          <strong>{it.title}</strong>
          <span>{[dateLabel(it.at), timeOf(it.at) + " WITA", it.sub].filter(Boolean).join(" · ")}</span>
        </div>
        <span className="small-label">{it.kind === "deadline" ? "DEADLINE" : "AGENDA"}</span>
      </div>)}
    </section>
  </PublicShell>;
}