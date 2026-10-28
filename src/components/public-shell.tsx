import type { ReactNode } from "react";

type PublicShellProps = {
  children: ReactNode;
};

export default function PublicShell({
  children,
}: PublicShellProps) {
  return (
    <main className="public-shell">
      {children}
    </main>
  );
}
