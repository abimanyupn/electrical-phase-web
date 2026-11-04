"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CalendarDays, CheckSquare, Home, Images } from "lucide-react";

const tabs = [
  { href: "/ruang", label: "Home", icon: Home },
  { href: "/deadlines", label: "Deadline", icon: CheckSquare },
  { href: "/jadwal", label: "Jadwal", icon: CalendarClock },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/galeri", label: "Galeri", icon: Images },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Navigasi bawah">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={href} href={href} className={`bottom-tab ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}