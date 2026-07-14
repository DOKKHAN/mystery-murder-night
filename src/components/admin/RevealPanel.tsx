"use client";

import { useState, type FormEvent } from "react";

type Props = {
  initialRevealEnabled: boolean;
  initialValues: {
    revealTitle: string;
    revealSubtitle: string;
    revealBody: string;
    revealTagline: string;
    revealImageUrl: string;
  };
};

export function RevealPanel({ initialRevealEnabled, initialValues }: Props) {
  const [revealEnabled, setRevealEnabled] = useState(initialRevealEnabled);
  const [toggling, setToggling] = useState(false);

  const [revealTitle, setRevealTitle] = useState(initialValues.revealTitle);
  const [revealSubtitle, setRevealSubtitle] = useState(initialValues.revealSubtitle);
  const [revealBody, setRevealBody] = useState(initialValues.revealBody);
  const [revealTagline, setRevealTagline] = useState(initialValues.revealTagline);
  const [revealImageUrl, setRevealImageUrl] = useState(initialValues.revealImageUrl);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    const res = await fetch("/api/reveal/toggle", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setRevealEnabled(data.revealEnabled);
    }
    setToggling(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/reveal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revealTitle,
        revealSubtitle,
        revealBody,
        revealTagline,
        revealImageUrl,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    }
  };

  return (
    <div>
      <div className="card blueprint elev-sm admin-toggle-card">
        <div>
          <p className="body-copy">
            {revealEnabled
              ? "Los invitados YA VEN el botón para abrir la revelación final."
              : "El botón de revelación todavía está oculto para los invitados."}
          </p>
          <span
            className={`status-pill ${revealEnabled ? "is-released" : "is-hidden"}`}
          >
            {revealEnabled ? "Revelación habilitada" : "Revelación oculta"}
          </span>
        </div>
        <button
          className={revealEnabled ? "btn btn-secondary" : "btn btn-primary"}
          onClick={handleToggle}
          disabled={toggling}
          type="button"
        >
          {toggling ? "..." : revealEnabled ? "Ocultar revelación" : "Revelar respuesta"}
        </button>
      </div>

      <form className="card blueprint elev-md admin-form" onSubmit={handleSave}>
        <span className="kicker accent">Contenido de la revelación</span>

        <label className="field">
          <span>Título (ej: nombre del culpable)</span>
          <input
            className="input"
            value={revealTitle}
            onChange={(e) => setRevealTitle(e.target.value)}
            placeholder="Francisca"
          />
        </label>

        <label className="field">
          <span>Subtítulo</span>
          <input
            className="input"
            value={revealSubtitle}
            onChange={(e) => setRevealSubtitle(e.target.value)}
            placeholder="The Last Vampire"
          />
        </label>

        <label className="field">
          <span>Cuerpo</span>
          <textarea
            className="input textarea"
            value={revealBody}
            onChange={(e) => setRevealBody(e.target.value)}
            rows={4}
            placeholder="Gerard nunca desapareció. Francisca le succionó todo..."
          />
        </label>

        <label className="field">
          <span>Frase final (itálica)</span>
          <input
            className="input"
            value={revealTagline}
            onChange={(e) => setRevealTagline(e.target.value)}
            placeholder="End of issue. Begin the afterparty."
          />
        </label>

        <label className="field">
          <span>URL de imagen de fondo (opcional)</span>
          <input
            className="input"
            value={revealImageUrl}
            onChange={(e) => setRevealImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar contenido"}
          </button>
        </div>
      </form>
    </div>
  );
}
