"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff, requireAdmin } from "@/lib/admin";
import { createServiceClient, BUCKET } from "@/lib/supabase/service";

const localDt = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
const toIso = (local: string) => new Date(`${local}:00+08:00`).toISOString(); // WITA

const taskSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(160).optional(),
  category: z.enum(["academic", "organization", "event", "other"]),
  due_at: localDt,
});

const eventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300).optional(),
  location: z.string().trim().max(80).optional(),
  starts_at: localDt,
});

const classSchema = z.object({
  course: z.string().trim().min(2).max(80),
  room: z.string().trim().max(40).optional(),
  day: z.coerce.number().int().min(1).max(7),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
}).refine((v) => v.end_time > v.start_time, { message: "end must be after start" });

function refresh() {
  for (const p of ["/", "/deadlines", "/calendar", "/galeri", "/jadwal", "/admin"]) revalidatePath(p);
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

export async function addClass(fd: FormData) {
  const { supabase, user } = await requireStaff();
  const parsed = classSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return;
  await supabase.from("class_schedule").insert({ ...parsed.data, created_by: user.id });
  refresh();
}

export async function removeClass(id: string) {
  const { supabase } = await requireStaff();
  await supabase.from("class_schedule").delete().eq("id", id);
  refresh();
}

export async function addInvite(fd: FormData) {
  const { supabase, user } = await requireAdmin();
  const email = z.string().email().safeParse(String(fd.get("email") ?? "").trim().toLowerCase());
  const role = z.enum(["member", "contributor"]).safeParse(fd.get("role") ?? "member");
  if (!email.success || !role.success) return;
  await supabase.from("allowed_members").insert({
    email: email.data, role: role.data, invited_by: user.id,
  });
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
    .neq("role", "admin");
  refresh();
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