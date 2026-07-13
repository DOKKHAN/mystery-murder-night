"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Clue = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  order: number;
};

type Props = {
  guestName: string;
  roleName: string | null;
  publicDescription: string | null;
  secretInfo: string;
  sessionName: string;
  sessionSlug: string;
};

const POLL_INTERVAL_MS = 5000;

export function GuestExperience({
  guestName,
  roleName,
  publicDescription,
  secretInfo,
  sessionName,
  sessionSlug,
}: Props) {
  const [clues, setClues] = useState<Clue[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const [newestId, setNewestId] = useState<string | null>(null);

  const fetchClues = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/clues/${sessionSlug}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      const nextClues: Clue[] = data.clues ?? [];

      const newIds = nextClues
        .map((c) => c.id)
        .filter((id) => !knownIdsRef.current.has(id));

      if (knownIdsRef.current.size > 0 && newIds.length > 0) {
        setNewestId(newIds[newIds.length - 1]);
      }

      knownIdsRef.current = new Set(nextClues.map((c) => c.id));
      setClues(nextClues);
    } catch {
      // Falla silenciosa: se reintenta en el próximo ciclo de polling.
    } finally {
      setLoaded(true);
    }
  }, [sessionSlug]);

  useEffect(() => {
    fetchClues();
    const interval = setInterval(fetchClues, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchClues]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchClues();
    window.setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="page">
      <div className="bg-texture" aria-hidden="true" />

      <header className="guest-header">
        <span className="kicker">{sessionName}</span>
        <button className="btn btn-ghost btn-sm" onClick={handleManualRefresh} type="button">
          <span className={refreshing ? "spin" : undefined} aria-hidden="true">
            ↻
          </span>
          Actualizar
        </button>
      </header>

      <main className="guest-main">
        <section className="card blueprint elev-md profile-card">
          <i className="corner corner-tl" />
          <i className="corner corner-tr" />
          <i className="corner corner-bl" />
          <i className="corner corner-br" />
          <span className="kicker accent">Perfil confidencial</span>
          <h1 className="display-title">{guestName}</h1>
          {roleName && <span className="tag">{roleName}</span>}
          {publicDescription && <p className="body-copy">{publicDescription}</p>}
          <p className="secret-copy">{secretInfo}</p>
          <p className="footnote">
            Tu rol es confidencial. No lo compartas con nadie... todavía.
          </p>
        </section>

        <section className="clues-section">
          <span className="kicker">A medida que avanza la noche</span>
          <h2 className="section-title">Pistas del expediente</h2>

          {loaded && clues.length === 0 && (
            <p className="empty-state">
              Aún no hay pistas liberadas. Toca &quot;Actualizar&quot; más
              tarde.
            </p>
          )}

          <ul className="clue-list">
            {clues.map((clue, idx) => (
              <li key={clue.id} className="card blueprint elev-sm clue-card">
                {clue.id === newestId && (
                  <span className="badge-new">Nueva</span>
                )}
                <div className="clue-thumb">
                  {clue.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={clue.imageUrl} alt={clue.title} />
                  ) : (
                    <span className="thumb-placeholder">Foto</span>
                  )}
                </div>
                <div className="clue-body">
                  <span className="kicker accent">
                    Evidencia {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="clue-title">{clue.title}</h3>
                  <p className="clue-teaser">{clue.content}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
