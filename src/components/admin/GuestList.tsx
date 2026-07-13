"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Guest = {
  id: string;
  name: string;
  roleName: string | null;
  slug: string;
};

export function GuestList({ guests }: { guests: Guest[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const copyLink = async (guest: Guest) => {
    const url = `${window.location.origin}/g/${guest.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(guest.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      prompt("Copiá el link manualmente:", url);
    }
  };

  const handleDelete = async (guest: Guest) => {
    if (!confirm(`¿Eliminar a ${guest.name}?`)) return;
    setBusyId(guest.id);
    await fetch(`/api/guests/${guest.id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  };

  if (guests.length === 0) {
    return <p className="empty-state">Todavía no cargaste ningún invitado.</p>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Rol</th>
          <th>Link personal</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {guests.map((guest) => (
          <tr key={guest.id}>
            <td>{guest.name}</td>
            <td>{guest.roleName ?? "—"}</td>
            <td>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => copyLink(guest)}
                type="button"
              >
                {copiedId === guest.id ? "¡Copiado!" : "Copiar link"}
              </button>
            </td>
            <td className="admin-actions">
              <Link className="btn btn-sm btn-ghost" href={`/admin/guests/${guest.id}`}>
                Editar
              </Link>
              <button
                className="btn btn-sm btn-danger"
                disabled={busyId === guest.id}
                onClick={() => handleDelete(guest)}
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
