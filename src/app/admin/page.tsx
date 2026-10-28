import { requireStaff } from "@/lib/admin";
import { dayMonth, timeOf } from "@/lib/format";
import { createServiceClient, BUCKET } from "@/lib/supabase/service";
import {
  addDeadline, addEvent, removeTask, removeEvent, addInvite,
  approvePhoto, rejectPhoto,
} from "./actions";

type PendingPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  uploader_name: string | null;
};

export default async function AdminPage() {
  const { supabase, role } = await requireStaff();
  const isAdmin = role === "admin";

  const [{ data: tasks }, { data: events }, { data: invites }, { data: pending }] = await Promise.all([
    supabase.from("tasks").select("*").eq("scope", "cohort").order("due_at"),
    supabase.from("events").select("*").order("starts_at"),
    isAdmin
      ? supabase.from("allowed_members").select("email, created_at").order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as { email: string }[] }),
    isAdmin
      ? supabase.from("photos").select("id, storage_path, caption, uploader_name")
          .eq("status", "pending").order("created_at")
      : Promise.resolve({ data: [] as PendingPhoto[] }),
  ]);

  // bucket private: buat link preview sementara untuk foto yang menunggu
  const previews = new Map<string, string>();
  if (pending && pending.length > 0) {
    const { data: signed } = await createServiceClient()
      .storage.from(BUCKET)
      .createSignedUrls(pending.map((p) => p.storage_path), 3600);
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) previews.set(s.path, s.signedUrl);
    });
  }

  return <main className="content-wrap">
    <h1>Admin</h1>

    <section className="panel">
      <h3>Deadline angkatan</h3>
      {tasks?.map(t => {
        const { day, month } = t.due_at ? dayMonth(t.due_at) : { day: "--", month: "" };
        return <div className="task-row" key={t.id}>
          <div className="task-main">
            <strong>{t.title}</strong>
            <span>{day} {month} · {t.due_at ? timeOf(t.due_at) : "tanpa jam"} · {t.description}</span>
          </div>
          <form action={removeTask.bind(null, t.id)}><button>Hapus</button></form>
        </div>;
      })}
      <form action={addDeadline} className="add-task-form">
        <label>Judul<input name="title" required/></label>
        <label>Mata kuliah / keterangan<input name="description"/></label>
        <label>Kategori
          <select name="category">
            <option value="academic">Akademik</option>
            <option value="organization">Organisasi</option>
            <option value="event">Acara</option>
            <option value="other">Lainnya</option>
          </select>
        </label>
        <label>Batas waktu (WITA)<input type="datetime-local" name="due_at" required/></label>
        <button className="primary-button">Tambah</button>
      </form>
    </section>

    <section className="panel">
      <h3>Agenda</h3>
      {events?.map(e => {
        const { day, month } = dayMonth(e.starts_at);
        return <div className="task-row" key={e.id}>
          <div className="task-main">
            <strong>{e.title}</strong>
            <span>{day} {month} · {timeOf(e.starts_at)} · {e.location}</span>
          </div>
          {isAdmin && <form action={removeEvent.bind(null, e.id)}><button>Hapus</button></form>}
        </div>;
      })}
      <form action={addEvent} className="add-task-form">
        <label>Judul<input name="title" required/></label>
        <label>Waktu (WITA)<input type="datetime-local" name="starts_at" required/></label>
        <label>Lokasi<input name="location"/></label>
        <label>Deskripsi<input name="description"/></label>
        <button className="primary-button">Tambah</button>
      </form>
    </section>

    {isAdmin && <section className="panel">
      <h3>Foto menunggu persetujuan ({pending?.length ?? 0})</h3>
      {pending?.length === 0 && <p>Tidak ada foto yang menunggu.</p>}
      {pending?.map(p => <div className="task-row" key={p.id}>
        <img
          src={previews.get(p.storage_path)}
          alt=""
          width={80}
          height={80}
          style={{ objectFit: "cover" }}
        />
        <div className="task-main">
          <strong>{p.caption || "(tanpa caption)"}</strong>
          <span>oleh {p.uploader_name || "anonim"}</span>
        </div>
        <form action={approvePhoto.bind(null, p.id)}><button className="primary-button">Setujui</button></form>
        <form action={rejectPhoto.bind(null, p.id, p.storage_path)}><button>Tolak</button></form>
      </div>)}
    </section>}

    {isAdmin && <section className="panel">
      <h3>Daftar anggota yang boleh login ({invites?.length ?? 0})</h3>
      {invites?.map(i => <div className="task-row" key={i.email}>
        <div className="task-main"><strong>{i.email}</strong></div>
      </div>)}
      <form action={addInvite} className="add-task-form">
        <label>Email mahasiswa<input type="email" name="email" required/></label>
        <button className="primary-button">Izinkan</button>
      </form>
    </section>}
  </main>;
}