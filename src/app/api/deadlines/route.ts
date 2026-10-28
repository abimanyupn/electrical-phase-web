import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks")
    .select("id, title, description, due_at")
    .eq("scope", "cohort")
    .gte("due_at", new Date().toISOString())
    .order("due_at")
    .limit(50);
  return NextResponse.json(data ?? []);
}