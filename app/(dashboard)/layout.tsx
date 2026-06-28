import Link from "next/link";
import { isAdminAuthed } from "@/lib/admin-auth";
import { AdminGate } from "@/components/dashboard/admin-gate";
import { lockAdmin } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthed())) {
    return <AdminGate />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-line bg-ink text-paper">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link href="/admin" className="flex items-baseline gap-2.5">
            <span className="font-display text-xl font-bold tracking-[-0.04em]">
              Desa<span className="text-gold">Ku</span>
            </span>
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-paper/50">
              Admin
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm text-paper/70 transition-colors hover:text-gold"
            >
              Onboard
            </Link>
            <Link
              href="/admin/villages"
              className="text-sm text-paper/70 transition-colors hover:text-gold"
            >
              Villages
            </Link>
            <Link
              href="/admin/bookings"
              className="text-sm text-paper/70 transition-colors hover:text-gold"
            >
              Bookings
            </Link>
            <form action={lockAdmin}>
              <button
                type="submit"
                className="text-sm text-paper/70 transition-colors hover:text-gold"
              >
                Lock
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
