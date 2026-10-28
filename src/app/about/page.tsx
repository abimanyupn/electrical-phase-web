import Link from "next/link";
import { ArrowRight, Github, Instagram, Mail, MapPin, GraduationCap } from "lucide-react";
import PublicShell from "@/components/public-shell";

// ====== EDIT BAGIAN INI SAJA ======
const ME = {
  name: "abeemanyu pn",
  role: "PJ Abadi / Elektro 2025",
  tagline: "Bikin ini karena capek scroll grup buat nyari deadline.",
  photo: "/profile.jpg" as string | null, // taruh file di public/profile.jpg, atau isi null kalau belum ada
  bio: [
    "Hai, Aku yang buat web ini karna ya....tau lah sendiri, aku malas buka chat wa.",
    "dan Situs ini dibuat biar info penting nggak tenggelam di chat. Kalau ada yang salah atau mau ditambah, bilang aja.",
  ],
  facts: [
    { label: "ANGKATAN", value: "Elektro 2025" },
    { label: "SUKA", value: "SKS (Kabut Semalam), Slow Response, Selalu DnD" },
    { label: "TIDAK SUKA", value: "Buka Wa" },
  ],
  links: [
    { label: "Instagram", href: "https://instagram.com/yabainmu", icon: Instagram },
    { label: "GitHub", href: "https://github.com/abimanyupn", icon: Github },
    { label: "Email", href: "mailto:pelajarabimanyu@gmail.com", icon: Mail },
  ],
};
// ===================================

export const metadata = { title: "Tentang · Electrical Phase" };

export default function AboutPage() {
  const initials = ME.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return <PublicShell>
    <section className="about-hero">
      <div className="about-photo">
        {ME.photo
          ? <img src={ME.photo} alt={`Foto ${ME.name}`} />
          : <span>{initials}</span>}
      </div>
      <div>
        <div className="eyebrow">// TENTANG</div>
        <h1>{ME.name}</h1>
        <p className="about-role">{ME.role}</p>
        <p className="public-lead">{ME.tagline}</p>
        <div className="about-meta">
        </div>
      </div>
    </section>

    <section className="about-grid">
      <div className="panel">
        <span className="eyebrow">CERITA SINGKAT</span>
        <h3>Kenapa situs ini ada</h3>
        {ME.bio.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="panel">
        <span className="eyebrow">SEKILAS</span>
        <h3>Data singkat</h3>
        <dl className="about-facts">
          {ME.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
        </dl>
      </div>
    </section>

    <section className="join-card">
      <span className="eyebrow">HUBUNGI</span>
      <h2>Ada koreksi atau ide?</h2>
      <p>Salah jadwal, mau nambah fitur, atau mau jadi PJ? Kabari lewat salah satu ini.</p>
      <div className="about-links">
        {ME.links.map(({ label, href, icon: Icon }) =>
          <a key={label} href={href} className="join-button" target="_blank" rel="noopener noreferrer">
            <Icon size={16}/> {label}
          </a>)}
      </div>
    </section>

    <p style={{ marginTop: 24 }}><Link href="/" className="section-link">Kembali ke beranda <ArrowRight size={15}/></Link></p>
  </PublicShell>;
}