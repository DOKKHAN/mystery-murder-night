import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import "../admin.css";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <header className="admin-nav">
        <span className="admin-brand">Backoffice</span>
        <nav>
          <Link href="/admin">Pistas</Link>
          <Link href="/admin/guests">Invitados</Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="admin-content">{children}</main>
    </div>
  );
}
