# Electrical Phase

Situs angkatan Elektro 2025: jadwal, deadline, kalender, dan galeri foto.
Semua halaman terbuka tanpa login. Login hanya untuk PJ dan admin yang mengelola isi.

## Teknologi

<<<<<<< HEAD
- **Tanpa login:** beranda, dashboard (`/ruang`), deadline, kalender, galeri, dan halaman tentang. Hanya informasi non-sensitif yang boleh tampil di sini.
- **Login (PJ dan admin):** halaman `/admin` untuk menambah deadline dan agenda, moderasi foto, dan mengundang anggota.
- **Kirim foto tanpa login:** foto masuk status `pending` dan baru tampil setelah disetujui admin.
- **Akses terbatas:** hanya email di tabel `allowed_members` yang bisa membuat akun. Keamanan tidak bergantung pada UI, tetapi pada Supabase Row Level Security (RLS).

## Peran

| Peran | Hak akses |
|---|---|
| `member` | Tidak punya akses kelola |
| `contributor` (PJ) | Tambah deadline dan agenda angkatan, hapus deadline buatannya sendiri |
| `admin` | Semua akses: hapus agenda, moderasi foto, undang anggota, ubah peran PJ |

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Supabase: Auth (magic link), Postgres + RLS, Storage (bucket private)
- Validasi input server-side dengan Zod
- Deploy: Vercel. Aplikasi Android (opsional): Capacitor

## Halaman

| Rute | Isi | Akses |
|---|---|---|
| `/` | Beranda: deadline, agenda, galeri terbaru | Publik |
| `/ruang` | Dashboard | Publik |
| `/deadlines` | Daftar deadline angkatan | Publik |
| `/calendar` | Kalender bulanan (deadline dan agenda) | Publik |
| `/galeri` | Galeri dan form kirim foto (dimoderasi) | Publik |
| `/about` | Tentang | Publik |
| `/login` | Login PJ dan admin (magic link) | Publik |
| `/admin` | Kelola deadline, agenda, foto, anggota | PJ dan admin |
| `/api/deadlines` | JSON deadline untuk pengingat di aplikasi | Publik (baca saja) |
=======
- Next.js 15 (App Router) + TypeScript
- Supabase (Postgres, Auth magic link, Storage)

## Halaman

| Rute | Isi | Akses |
|---|---|---|
| `/` | Beranda | Publik |
| `/ruang` | Dashboard | Publik |
| `/deadlines` | Daftar deadline | Publik |
| `/calendar` | Kalender bulanan | Publik |
| `/galeri` | Galeri + kirim foto (dimoderasi) | Publik |
| `/about` | Tentang | Publik |
| `/login` | Login PJ/admin | Publik |
| `/admin` | Kelola deadline, agenda, foto, anggota | PJ dan admin |
>>>>>>> 5210b9e (web lengkap: admin, galeri, kalender, login)

## Peran

<<<<<<< HEAD
```text
src/
  app/
    page.tsx                  # beranda
    ruang/page.tsx            # dashboard
    deadlines/page.tsx        # daftar deadline
    calendar/page.tsx         # kalender bulanan
    galeri/
      page.tsx                # galeri + form kirim foto
      actions.ts              # upload foto (server action)
    about/page.tsx            # profil / tentang
    admin/
      page.tsx                # panel kelola
      actions.ts              # tambah/hapus data, moderasi, undangan
    login/page.tsx            # login magic link
    auth/callback/route.ts    # menukar kode magic link jadi sesi
    api/deadlines/route.ts    # endpoint data deadline
    layout.tsx                # root layout, metadata
    manifest.ts               # manifest PWA
    globals.css               # tema biru-oren dan layout
  components/
    public-shell.tsx          # header/footer halaman publik
    sidebar.tsx               # navigasi dashboard
    dashboard.tsx             # tampilan dashboard
    deadline-reminders.tsx    # notifikasi pengingat (hanya aktif di aplikasi)
  lib/
    admin.ts                  # guard requireStaff / requireAdmin
    format.ts                 # format tanggal/jam (WITA)
    supabase/
      client.ts               # client browser
      server.ts               # client server (cookie)
      service.ts              # client service role, KHUSUS server
public/
  logo.png
supabase/
  schema.sql                  # skema, trigger, RLS, bucket
```

## Skema data

- `allowed_members`: daftar email yang boleh daftar, beserta peran awalnya.
- `profiles`: profil dan peran (`member`, `contributor`, `admin`).
- `tasks`: deadline angkatan (`scope = 'cohort'`) dan tugas pribadi (`scope = 'personal'`).
- `events`: agenda bersama.
- `photos`: metadata foto dengan status `pending` atau `approved`. File disimpan di bucket private `angkatan-gallery`.
- `announcements`, `albums`, `notes`, `task_completions`, `user_preferences`: tersedia di skema, belum seluruhnya dipakai di UI.

Kebijakan publik hanya mengizinkan baca `tasks` ber-scope `cohort`, `events`, dan `photos` yang sudah `approved`. Jangan menaruh informasi pribadi atau lokasi sensitif di data publik.

## Menjalankan lokal

1. Gunakan Node.js LTS, lalu `npm install`.
2. Buat project Supabase.
3. Jalankan `supabase/schema.sql` di **SQL Editor**. Ganti email admin di baris paling bawah. Pada database yang sudah berisi skema lama, jangan jalankan ulang mentah-mentah.
4. Salin `.env.example` menjadi `.env.local` dan isi:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=      # publishable key (sb_publishable_...) atau anon key
   SUPABASE_SERVICE_ROLE_KEY=          # secret key (sb_secret_...) atau service_role, RAHASIA
   ```

5. Di Supabase, **Authentication, URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
6. Jalankan:

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`.

## Menjadi admin pertama

Undangan admin dibuat lewat SQL (ada di bagian bawah `schema.sql`). Setelah itu login sekali lewat `/login` dengan email yang sama dan buka `/admin`. PJ berikutnya diundang dari `/admin` dengan pilihan peran **PJ**.

## Deploy

1. Push ke GitHub, import repo di Vercel.
2. Isi tiga environment variable di atas, lalu deploy.
3. Di Supabase, ubah Site URL ke alamat produksi dan tambahkan `https://DOMAIN/auth/callback` ke Redirect URLs.

## Aplikasi Android (opsional)

Dibungkus dengan Capacitor, memuat situs yang sudah online. Pengingat deadline (ringkasan harian dan 24 jam serta 2 jam sebelum tenggat) dijadwalkan di perangkat setiap aplikasi dibuka. Pembaruan tampilan dan fitur cukup lewat `git push`. APK hanya dibuat ulang jika konfigurasi atau plugin Capacitor berubah.

## Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di kode server (`lib/supabase/service.ts`). Jangan diberi awalan `NEXT_PUBLIC_`, jangan di-commit, dan jangan dibagikan. Jika pernah bocor, buat ulang di dashboard Supabase.
- `.env.local` ada di `.gitignore`.
- Aturan akses ada di database (RLS), bukan hanya di UI. Setiap mutation di `/admin` juga memeriksa peran di server.
- Upload foto: batas 5 MB, hanya JPG/PNG/WebP, honeypot anti-bot, dan wajib disetujui admin sebelum tampil. Pembatasan MIME juga dipasang di bucket.
- Bucket foto bersifat private. Foto ditampilkan lewat signed URL sementara.
- Rencana lanjutan: rate limit atau CAPTCHA (Cloudflare Turnstile) pada form kirim foto, refresh sesi lewat middleware, dan pengujian RLS dengan akun anon, member, PJ, dan admin.
=======
- **member**: tidak punya akses kelola.
- **contributor (PJ)**: tambah deadline dan agenda angkatan.
- **admin**: semua akses, termasuk moderasi foto dan undangan anggota.

Hanya email yang ada di tabel `allowed_members` yang bisa login.

## Menjalankan lokal

1. Install dependensi:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env.local` dan isi:
>>>>>>> 5210b9e (web lengkap: admin, galeri, kalender, login)
