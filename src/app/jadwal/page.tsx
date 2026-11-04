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

  return <PublicShell>
    <div className="eyebrow">// MINGGUAN</div>
    <h1>Jadwal kuliah</h1>

    <section className="panel">
      <span className="eyebrow">JADWAL ANGKATAN</span>
      <h3>Untuk semua</h3>
      {(data?.length ?? 0) === 0 && <p>Belum ada jadwal angkatan.</p>}
      {DAYS.map((nama, i) => {
        const list = (data ?? []).filter((r) => r.day === i + 1);
        if (!list.length) return null;
        return <div key={nama}>
          <strong>{nama}</strong>
          {list.map((r) => <div className="task-row" key={r.id}>
            <div className="task-main">
              <strong>{r.course}</strong>
              <span>{String(r.start_time).slice(0, 5)}–{String(r.end_time).slice(0, 5)}{r.room ? ` · ${r.room}` : ""}</span>
            </div>
          </div>)}
        </div>;
      })}
    </section>

    <MySchedule />
  </PublicShell>;
}