import Dashboard from "@/components/dashboard";
import { createClient } from "@/lib/supabase/server";
import { dayMonth, timeOf, CATEGORY_LABEL } from "@/lib/format";

const COLORS = ["peach", "sage", "lavender", "blue"];
const TZ = "Asia/Makassar";

export default async function RuangPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let canManage = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    canManage = profile?.role === "contributor" || profile?.role === "admin";
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const [{ count }, { data: deadlines }, { data: events }] = await Promise.all([
    supabase.from("photos").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("tasks").select("*").eq("scope", "cohort").gte("due_at", nowIso).order("due_at").limit(8),
    supabase.from("events").select("*").gte("starts_at", nowIso).order("starts_at").limit(5),
  ]);

  const tasks = (deadlines ?? []).map((t, i) => {
    const { day, month } = dayMonth(t.due_at);
    return {
      id: t.id as string,
      title: t.title as string,
      course: (t.description ?? "").toUpperCase(),
      date: `${day} ${month} · ${timeOf(t.due_at)}`,
      tag: CATEGORY_LABEL[t.category] ?? "LAINNYA",
      color: COLORS[i % COLORS.length],
      done: false,
    };
  });

  const agenda = (events ?? []).map((e) => {
    const { day, month } = dayMonth(e.starts_at);
    return {
      id: e.id as string,
      day,
      month,
      title: e.title as string,
      detail: `${timeOf(e.starts_at)} WITA · ${e.location ?? "Lokasi menyusul"}`,
    };
  });

  // tanggal dihitung di server supaya tidak kena hydration error
  const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: TZ }).format(now).toUpperCase();
  const dateStr = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ })
    .format(now).replace(/\//g, ".");
  const todayLabel = `${weekday} / ${dateStr}`;

  return (
    <Dashboard
      photoCount={count ?? 0}
      canManage={canManage}
      loggedIn={!!user}
      initialTasks={tasks}
      agenda={agenda}
      todayLabel={todayLabel}
    />
  );
}