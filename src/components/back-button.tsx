"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let remove: (() => void) | undefined;
    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;
      const { App } = await import("@capacitor/app");
      const h = await App.addListener("backButton", () => {
        if (pathname === "/ruang" || pathname === "/") {
          App.exitApp();          // di halaman utama: keluar
        } else if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/ruang");  // tidak ada riwayat: ke dashboard
        }
      });
      remove = () => h.remove();
    })();
    return () => remove?.();
  }, [pathname, router]);

  return null;
}