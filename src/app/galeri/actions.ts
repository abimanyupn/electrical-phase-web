"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient, BUCKET } from "@/lib/supabase/service";

const MAX = 5 * 1024 * 1024;
const MAX_PENDING = 50;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// cek isi file (magic bytes), bukan cuma label dari browser
function detectType(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return "image/webp";
  return null;
}

export async function uploadPhoto(fd: FormData) {
  // honeypot: bot biasanya mengisi kolom tersembunyi ini
  if (fd.get("website")) redirect("/galeri?sent=1");

  // 1) file dibuat dulu
  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0) redirect("/galeri?error=kosong");
  if (file.size > MAX) redirect("/galeri?error=besar");

  // 2) baru dipakai: cek isi file
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const type = detectType(head);
  if (!type) redirect("/galeri?error=tipe");

  // 3) batasi antrean pending
  const db = createServiceClient();
  const { count } = await db.from("photos")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if ((count ?? 0) >= MAX_PENDING) redirect("/galeri?error=penuh");

  // 4) upload
  const path = `pending/${crypto.randomUUID()}.${EXT[type]}`;
  const { error: upErr } = await db.storage
    .from(BUCKET)
    .upload(path, file, { contentType: type });
  if (upErr) redirect("/galeri?error=gagal");

  const { error: dbErr } = await db.from("photos").insert({
    storage_path: path,
    caption: String(fd.get("caption") ?? "").trim().slice(0, 140) || null,
    uploader_name: String(fd.get("uploader") ?? "").trim().slice(0, 40) || null,
    status: "pending",
  });
  if (dbErr) {
    await db.storage.from(BUCKET).remove([path]); // jangan tinggalkan file yatim
    redirect("/galeri?error=gagal");
  }

  revalidatePath("/admin");
  redirect("/galeri?sent=1");
}