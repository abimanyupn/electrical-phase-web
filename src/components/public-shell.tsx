import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/bottom-nav";

type PublicShellProps = { children: React.ReactNode };

const links = [
  { href: "/", label: "Beranda" },
  { href: "/deadlines", label: "Deadline" },
  { href: "/jadwal", label: "Jadwal" },
  { href: "/calendar", label: "Kalender" },
  { href: "/galeri", label: "Galeri" },
  { href: "/about", label: "Tentang" },
];

export default function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="shell">
      <header className="shell-header">
        <Link href="/" className="shell-brand">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="brand-logo" />
          <span>Electrical<b> Phase</b></span>
        </Link>
        <nav className="shell-links" aria-label="Navigasi utama">
          {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
        <Link href="/ruang" className="outline-button shell-cta">Dashboard</Link>
      </header>

      <main className="shell-main">{children}</main>

      <footer className="shell-footer">
        <span>electrical phase © 2026</span>
        <span>bukan produk resmi kampus</span>
      </footer>

      <BottomNav />
    </div>
  );
}