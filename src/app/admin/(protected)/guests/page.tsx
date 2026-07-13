import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";
import { GuestList } from "@/components/admin/GuestList";

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const session = await getActiveGameSession();
  const guests = await prisma.guest.findMany({
    where: { gameSessionId: session.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Invitados</h1>
        <Link className="btn btn-primary" href="/admin/guests/new">
          + Nuevo invitado
        </Link>
      </div>

      <GuestList
        guests={guests.map((g) => ({
          id: g.id,
          name: g.name,
          roleName: g.roleName,
          slug: g.slug,
        }))}
      />
    </div>
  );
}
