"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Alert = {
  id: string;
  title: string;
  order: number;
  status: "HIDDEN" | "RELEASED";
};

export function AlertList({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const toggleStatus = async (alert: Alert) => {
    setBusyId(alert.id);
    const nextStatus = alert.status === "RELEASED" ? "HIDDEN" : "RELEASED";

    const res = await fetch(`/api/alerts/${alert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.ok) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, status: nextStatus } : a))
      );
    }
    setBusyId(null);
  };

  const handleDelete = async (alert: Alert) => {
    if (!confirm(`¿Eliminar la alerta "${alert.title}"?`)) return;
    setBusyId(alert.id);

    const res = await fetch(`/api/alerts/${alert.id}`, { method: "DELETE" });
    if (res.ok) {
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    }
    setBusyId(null);
    router.refresh();
  };

  if (alerts.length === 0) {
    return <p className="empty-state">Todavía no cargaste ninguna alerta.</p>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Orden</th>
          <th>Título</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert) => (
          <tr key={alert.id}>
            <td>{alert.order}</td>
            <td>{alert.title}</td>
            <td>
              <span
                className={`status-pill ${
                  alert.status === "RELEASED" ? "is-released" : "is-hidden"
                }`}
              >
                {alert.status === "RELEASED" ? "Liberada" : "Oculta"}
              </span>
            </td>
            <td className="admin-actions">
              <button
                className="btn btn-sm btn-secondary"
                disabled={busyId === alert.id}
                onClick={() => toggleStatus(alert)}
                type="button"
              >
                {alert.status === "RELEASED" ? "Ocultar" : "Liberar"}
              </button>
              <Link className="btn btn-sm btn-ghost" href={`/admin/alerts/${alert.id}`}>
                Editar
              </Link>
              <button
                className="btn btn-sm btn-danger"
                disabled={busyId === alert.id}
                onClick={() => handleDelete(alert)}
                type="button"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
