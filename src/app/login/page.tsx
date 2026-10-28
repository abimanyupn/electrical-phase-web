"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const authFailed = params.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      setStatus("error");
      if (msg.includes("database error") || msg.includes("not allowed") || msg.includes("signups")) {
        setMessage("Email ini belum terdaftar. Hubungi admin untuk diundang.");
      } else if (msg.includes("rate limit") || msg.includes("security purposes")) {
        setMessage("Terlalu sering minta link. Tunggu beberapa menit lalu coba lagi.");
      } else {
        setMessage(`Gagal mengirim link: ${error.message}`);
      }
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="content-wrap" style={{ maxWidth: 480, margin: "0 auto" }}>
      <div className="eyebrow">// LOGIN PJ & ADMIN</div>
      <h1>Masuk</h1>

      {authFailed && (
        <p role="alert" className="form-err">
          Link login gagal atau kedaluwarsa. Minta link baru, lalu klik di browser yang sama
          dengan tempat kamu memintanya.
        </p>
      )}

      {status === "sent" ? (
        <p role="status" className="form-ok">
          Link masuk sudah dikirim ke <strong>{email}</strong>. Cek inbox dan spam, lalu klik
          linknya di browser ini.
        </p>
      ) : (
        <form className="add-task-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </label>
          <button className="primary-button" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Mengirim..." : "Kirim link masuk"}
          </button>
          {status === "error" && <p role="alert" className="form-err">{message}</p>}
        </form>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/" className="section-link">Kembali ke beranda</Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}