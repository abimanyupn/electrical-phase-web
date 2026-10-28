import PublicShell from "@/components/public-shell";
import { createClient } from "@/lib/supabase/server";
import { dayMonth, timeOf, CATEGORY_LABEL } from "@/lib/format";

export default async function DeadlinesPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase.from("tasks").select("*")
    .eq("scope", "cohort").gte("due_at", new Date().toISOString()).order("due_at");

  return <PublicShell>
    <h1>Deadline</h1>
    {tasks?.length === 0 && <p>Belum ada deadline.</p>}
    {tasks?.map(t => {
      const { day, month } = dayMonth(t.due_at);
      return <article className="public-deadline-card" key={t.id}>
        <div className="date-tile peach"><strong>{day}</strong><span>{month}</span></div>
        <div><span className="small-label">{CATEGORY_LABEL[t.category]}</span><h3>{t.title}</h3>
        <p>{[t.description, timeOf(t.due_at)].filter(Boolean).join(" · ")}</p></div>
      </article>;
    })}
  </PublicShell>;
}