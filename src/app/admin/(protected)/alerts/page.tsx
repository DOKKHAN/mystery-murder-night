import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";
import { AlertList } from "@/components/admin/AlertList";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const session = await getActiveGameSession();
  const alerts = await prisma.alert.findMany({
    where: { gameSessionId: session.id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Alertas</h1>
          <p className="muted">Partida activa: {session.name}</p>
        </div>
        <Link className="btn btn-primary" href="/admin/alerts/new">
          + Nueva alerta
        </Link>
      </div>

      <AlertList
        initialAlerts={alerts.map((a) => ({
          id: a.id,
          title: a.title,
          order: a.order,
          status: a.status,
        }))}
      />
    </div>
  );
}
