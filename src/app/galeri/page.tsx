import PublicShell from "@/components/public-shell";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, BUCKET } from "@/lib/supabase/service";
import { uploadPhoto } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Galeri · Electrical Phase" };

const ERRORS: Record<string, string> = {
  kosong: "Pilih foto dulu.",
  besar: "Fotonya kebesaran. Maksimal 5 MB.",
  tipe: "Format harus JPG, PNG, atau WebP.",
  gagal: "Gagal mengirim. Coba lagi sebentar.",
};

export default async function GaleriPage({
  searchParams,
}: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;

  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("photos")
    .select("id, storage_path, caption, uploader_name, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(60);

  // bucket private: buat link sementara hanya untuk foto yang sudah approved
  const urls = new Map<string, string>();
  if (photos && photos.length > 0) {
    const { data: signed } = await createServiceClient()
      .storage.from(BUCKET)
      .createSignedUrls(photos.map((p) => p.storage_path), 3600);
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
    });
  }

  return <PublicShell>
    <div className="eyebrow">// ARSIP</div>
    <h1>Galeri</h1>
    <p className="public-lead">Foto kegiatan angkatan. Siapa saja boleh kirim, tampil setelah disetujui admin.</p>

    {(photos?.length ?? 0) === 0 && <p>Belum ada foto. Kirim yang pertama di bawah.</p>}

    <div className="gallery-grid">
      {photos?.map((p) => {
        const src = urls.get(p.storage_path);
        if (!src) return null;
        return <figure className="gallery-item" key={p.id}>
          <a href={src} target="_blank" rel="noopener noreferrer">
            <img src={src} alt={p.caption ?? "Foto angkatan"} loading="lazy" />
          </a>
          {(p.caption || p.uploader_name) && <figcaption>
            {p.caption && <strong>{p.caption}</strong>}
            {p.uploader_name && <span>oleh {p.uploader_name}</span>}
          </figcaption>}
        </figure>;
      })}
    </div>

    <form action={uploadPhoto} className="add-task-form gallery-form" encType="multipart/form-data">
      <h3>Kirim foto</h3>
      {sent && <p role="status" className="form-ok">Foto terkirim. Akan tampil setelah disetujui admin.</p>}
      {error && <p role="alert" className="form-err">{ERRORS[error] ?? ERRORS.gagal}</p>}

      <input name="website" className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <label>Foto (JPG/PNG/WebP, maks 5 MB)
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required />
      </label>
      <label>Caption (opsional)
        <input name="caption" maxLength={140} placeholder="Contoh: Praktikum rangkaian listrik" />
      </label>
      <label>Nama (opsional)
        <input name="uploader" maxLength={40} />
      </label>
      <button className="primary-button" type="submit">Kirim</button>
    </form>
  </PublicShell>;
}