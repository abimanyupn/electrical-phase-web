import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function guard(allowed: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!p || !allowed.includes(p.role)) redirect("/");
  return { supabase, user, role: p.role as string };
}

export const requireStaff = () => guard(["contributor", "admin"]);
export const requireAdmin = () => guard(["admin"]);