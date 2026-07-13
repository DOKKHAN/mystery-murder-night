"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  guestId?: string;
  initialValues?: {
    name: string;
    roleName: string | null;
    publicDescription: string | null;
    secretInfo: string;
  };
};

export function GuestForm({ guestId, initialValues }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [roleName, setRoleName] = useState(initialValues?.roleName ?? "");
  const [publicDescription, setPublicDescription] = useState(
    initialValues?.publicDescription ?? ""
  );
  const [secretInfo, setSecretInfo] = useState(initialValues?.secretInfo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(guestId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(isEdit ? `/api/guests/${guestId}` : "/api/guests", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        roleName: roleName || null,
        publicDescription: publicDescription || null,
        secretInfo,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo guardar el invitado");
      return;
    }

    router.push("/admin/guests");
    router.refresh();
  };

  return (
    <form className="card blueprint elev-md admin-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Nombre</span>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Rol / personaje</span>
        <input
          className="input"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="Ej: Testigo del círculo íntimo"
        />
      </label>

      <label className="field">
        <span>Descripción pública</span>
        <textarea
          className="input textarea"
          value={publicDescription}
          onChange={(e) => setPublicDescription(e.target.value)}
          rows={3}
        />
      </label>

      <label className="field">
        <span>Información secreta (solo la ve este invitado)</span>
        <textarea
          className="input textarea"
          value={secretInfo}
          onChange={(e) => setSecretInfo(e.target.value)}
          rows={5}
          required
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear invitado"}
        </button>
      </div>
    </form>
  );
}
