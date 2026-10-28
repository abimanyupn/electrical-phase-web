import Link from "next/link";
import { CalendarDays, CheckSquare, Home, X, Globe, Images, ShieldCheck, User } from "lucide-react";
import Image from "next/image";

const items = [
  { href: "/ruang", label: "Dashboard", icon: Home },
  { href: "/", label: "Beranda umum", icon: Globe },
  { href: "/deadlines", label: "Deadline", icon: CheckSquare },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/galeri", label: "Galeri", icon: Images },
  { href: "/about", label: "Tentang", icon: User },
];

export default function Sidebar({ onClose, canManage = false }: { onClose?: () => void; canManage?: boolean }) {
  const links = canManage ? [...items, { href: "/admin", label: "Kelola", icon: ShieldCheck }] : items;

  return <aside className="sidebar">
    <div className="sidebar-brand">
      <Image src="/logo.png" alt="Logo angkatan" width={40} height={40} className="brand-logo" priority />
      <div className="brand-text">
        <strong>
          <span className="brand-line">Electrical</span>
          <span className="brand-line brand-accent">Phase</span>
        </strong>
        <small>bukan saluran wa</small>
      </div>
      {onClose && <button className="icon-button mobile-close" onClick={onClose} aria-label="Tutup menu"><X size={18} /></button>}
    </div>
    <div className="cohort-pill"><span className="cohort-dot" /> ELEKTRO / 2025 <span className="pill-arrow">↗</span></div>
    <nav className="side-nav" aria-label="Navigasi utama">
      <span className="nav-caption">// MENU</span>
      {links.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={`nav-link ${href === "/ruang" ? "active" : ""}`} onClick={onClose}>
          <Icon size={18} /><span>{label}</span>
        </Link>
      ))}
    </nav>
    <div className="sidebar-bottom">
      <div className="memory-card"><p>siap nggak siap<br /><strong>ada deadline.</strong></p></div>
      <div className="user-mini"><div className="avatar avatar-coral">A</div><div className="user-mini-text"><strong>{canManage ? "Pengelola" : "Pengunjung"}</strong><span>{canManage ? "PJ / admin" : "tanpa login"}</span></div><span className="online-dot" /></div>
    </div>
  </aside>;
}