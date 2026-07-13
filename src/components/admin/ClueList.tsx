"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Clue = {
  id: string;
  title: string;
  order: number;
  status: "HIDDEN" | "RELEASED";
};

export function ClueList({ initialClues }: { initialClues: Clue[] }) {
  const [clues, setClues] = useState(initialClues);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const toggleStatus = async (clue: Clue) => {
    setBusyId(clue.id);
    const nextStatus = clue.status === "RELEASED" ? "HIDDEN" : "RELEASED";

    const res = await fetch(`/api/clues/${clue.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.ok) {
      setClues((prev) =>
        prev.map((c) => (c.id === clue.id ? { ...c, status: nextStatus } : c))
      );
    }
    setBusyId(null);
  };

  const handleDelete = async (clue: Clue) => {
    if (!confirm(`¿Eliminar la pista "${clue.title}"?`)) return;
    setBusyId(clue.id);

    const res = await fetch(`/api/clues/${clue.id}`, { method: "DELETE" });
    if (res.ok) {
      setClues((prev) => prev.filter((c) => c.id !== clue.id));
    }
    setBusyId(null);
    router.refresh();
  };

  if (clues.length === 0) {
    return <p className="empty-state">Todavía no cargaste ninguna pista.</p>;
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
        {clues.map((clue) => (
          <tr key={clue.id}>
            <td>{clue.order}</td>
            <td>{clue.title}</td>
            <td>
              <span
                className={`status-pill ${
                  clue.status === "RELEASED" ? "is-released" : "is-hidden"
                }`}
              >
                {clue.status === "RELEASED" ? "Liberada" : "Oculta"}
              </span>
            </td>
            <td className="admin-actions">
              <button
                className="btn btn-sm btn-secondary"
                disabled={busyId === clue.id}
                onClick={() => toggleStatus(clue)}
                type="button"
              >
                {clue.status === "RELEASED" ? "Ocultar" : "Liberar"}
              </button>
              <Link className="btn btn-sm btn-ghost" href={`/admin/clues/${clue.id}`}>
                Editar
              </Link>
              <button
                className="btn btn-sm btn-danger"
                disabled={busyId === clue.id}
                onClick={() => handleDelete(clue)}
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
