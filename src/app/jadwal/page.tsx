import PublicShell from "@/components/public-shell";
import MySchedule from "@/components/my-schedule";
import { createClient } from "@/lib/supabase/server";
import { DAYS } from "@/lib/schedule";

export const dynamic = "force-dynamic";
export const metadata = { title: "Jadwal · Electrical Phase" };

export default async function JadwalPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("class_schedule")
    .select("id, day, start_time, end_time, course, room")
    .order("day").order("start_time");

  const hariIni = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Makassar" }).format(new Date());
  const hariNo = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(hariIni) + 1;

  return <PublicShell>
    <div className="eyebrow">// MINGGUAN</div>
    <h1>Jadwal kuliah</h1>

    <section className="panel">
      <span className="eyebrow">JADWAL ANGKATAN</span>
      <h3>Untuk semua</h3>
      {(data?.length ?? 0) === 0 && <p>Belum ada jadwal angkatan.</p>}
      <div className="day-grid">
        {DAYS.map((nama, i) => {
          const list = (data ?? []).filter((r) => r.day === i + 1);
          if (!list.length) return null;
          const today = i + 1 === hariNo;
          return <div className={`day-card ${today ? "today" : ""}`} key={nama}>
            <div className="day-head">
              <strong>{nama}</strong>
              {today && <span className="day-badge">Hari ini</span>}
            </div>
            {list.map((r) => <div className="class-box" key={r.id}>
              <div className="class-time">
                {String(r.start_time).slice(0, 5)}<small>{String(r.end_time).slice(0, 5)}</small>
              </div>
              <div className="class-info">
                <strong>{r.course}</strong>
                {r.room && <span>{r.room}</span>}
              </div>
            </div>)}
          </div>;
        })}
      </div>
    </section>

    <MySchedule />
  </PublicShell>;
}