"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  alertId?: string;
  initialValues?: {
    title: string;
    content: string;
  };
};

export function AlertForm({ alertId, initialValues }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(alertId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(isEdit ? `/api/alerts/${alertId}` : "/api/alerts", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo guardar la alerta");
      return;
    }

    router.push("/admin/alerts");
    router.refresh();
  };

  return (
    <form className="card blueprint elev-md admin-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Título</span>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Ej: "Gerard nunca llegó."'
          required
        />
      </label>

      <label className="field">
        <span>Contenido</span>
        <textarea
          className="input textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Ej: Estaba confirmado. El lugar donde debía estar sigue vacío."
          required
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear alerta"}
        </button>
      </div>
    </form>
  );
}
