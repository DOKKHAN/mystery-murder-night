"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  clueId?: string;
  initialValues?: {
    title: string;
    content: string;
    imageUrl: string | null;
  };
};

export function ClueForm({ clueId, initialValues }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(clueId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(isEdit ? `/api/clues/${clueId}` : "/api/clues", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, imageUrl: imageUrl || null }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo guardar la pista");
      return;
    }

    router.push("/admin");
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
          required
        />
      </label>

      <label className="field">
        <span>Contenido</span>
        <textarea
          className="input textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
        />
      </label>

      <label className="field">
        <span>URL de imagen (opcional)</span>
        <input
          className="input"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear pista"}
        </button>
      </div>
    </form>
  );
}
