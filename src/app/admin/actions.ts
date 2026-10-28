"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff, requireAdmin } from "@/lib/admin";
import { createServiceClient, BUCKET } from "@/lib/supabase/service";

const toIso = (local: string) => new Date(`${local}+08:00`).toISOString(); // WITA

const taskSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(160).optional(),
  category: z.enum(["academic", "organization", "event", "other"]),
  due_at: z.string().min(1),
});

const eventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300).optional(),
  location: z.string().trim().max(80).optional(),
  starts_at: z.string().min(1),
});

function refresh() {
  for (const p of ["/", "/deadlines", "/calendar", "/galeri", "/admin"]) revalidatePath(p);
}

export async function addDeadline(fd: FormData) {
  const { supabase, user } = await requireStaff();
  const parsed = taskSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return;
  await supabase.from("tasks").insert({
    ...parsed.data,
    due_at: toIso(parsed.data.due_at),
    scope: "cohort",
    created_by: user.id,
  });
  refresh();
}

export async function addEvent(fd: FormData) {
  const { supabase, user } = await requireStaff();
  const parsed = eventSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return;
  await supabase.from("events").insert({
    ...parsed.data,
    starts_at: toIso(parsed.data.starts_at),
    created_by: user.id,
  });
  refresh();
}

export async function removeTask(id: string) {
  const { supabase } = await requireStaff();
  await supabase.from("tasks").delete().eq("id", id);
  refresh();
}

export async function removeEvent(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("events").delete().eq("id", id);
  refresh();
}

export async function addInvite(fd: FormData) {
  const { supabase, user } = await requireAdmin();
  const email = z.string().email().safeParse(String(fd.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return;
  await supabase.from("allowed_members").insert({ email: email.data, invited_by: user.id });
  revalidatePath("/admin");
}

// ---------- Moderasi foto (admin saja) ----------

export async function approvePhoto(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("photos").update({ status: "approved" }).eq("id", id);
  refresh();
}

export async function rejectPhoto(id: string, path: string) {
  await requireAdmin(); // cek hak akses dulu, baru pakai service role
  const db = createServiceClient();
  await db.storage.from(BUCKET).remove([path]);
  await db.from("photos").delete().eq("id", id);
  refresh();
}

export async function setRole(userId: string, role: "member" | "contributor") {
  const { supabase } = await requireAdmin();
  const parsed = z.object({
    userId: z.string().uuid(),
    role: z.enum(["member", "contributor"]),
  }).safeParse({ userId, role });
  if (!parsed.success) return;

  await supabase.from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId)
    .neq("role", "admin"); // admin tidak bisa diturunkan dari web
  revalidatePath("/admin");
}