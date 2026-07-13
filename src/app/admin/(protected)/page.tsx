import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";
import { ClueList } from "@/components/admin/ClueList";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getActiveGameSession();
  const clues = await prisma.clue.findMany({
    where: { gameSessionId: session.id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Pistas</h1>
          <p className="muted">Partida activa: {session.name}</p>
        </div>
        <Link className="btn btn-primary" href="/admin/clues/new">
          + Nueva pista
        </Link>
      </div>

      <ClueList
        initialClues={clues.map((c) => ({
          id: c.id,
          title: c.title,
          order: c.order,
          status: c.status,
        }))}
      />
    </div>
  );
}
