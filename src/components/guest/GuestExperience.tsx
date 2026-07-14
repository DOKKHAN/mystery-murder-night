"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Clue = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  order: number;
};

type Alert = {
  id: string;
  title: string;
  content: string;
  order: number;
};

type Suspect = {
  id: string;
  name: string;
};

type VoteResult = {
  id: string;
  name: string;
  count: number;
};

type RevealContent = {
  title: string | null;
  subtitle: string | null;
  body: string | null;
  tagline: string | null;
  imageUrl: string | null;
};

type Props = {
  guestSlug: string;
  guestName: string;
  roleName: string | null;
  publicDescription: string | null;
  secretInfo: string;
  sessionName: string;
  sessionSlug: string;
  suspects: Suspect[];
  initialVote: Suspect | null;
  initialVotingEnabled: boolean;
  initialRevealEnabled: boolean;
  initialRevealContent: RevealContent;
};

const POLL_INTERVAL_MS = 5000;
const ENTERED_STORAGE_KEY = "mmn_entered";

const PIE_COLORS = [
  "#b21230",
  "#f2c9cf",
  "#8f0f27",
  "#e8a0ab",
  "#730c1f",
  "#c96b76",
  "#d9848f",
  "#4a0d18",
];

export function GuestExperience({
  guestSlug,
  guestName,
  roleName,
  publicDescription,
  secretInfo,
  sessionName,
  sessionSlug,
  suspects,
  initialVote,
  initialVotingEnabled,
  initialRevealEnabled,
  initialRevealContent,
}: Props) {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<"main" | "results">("main");

  const [clues, setClues] = useState<Clue[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const knownClueIdsRef = useRef<Set<string>>(new Set());
  const [newestClueId, setNewestClueId] = useState<string | null>(null);

  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [votedSuspect, setVotedSuspect] = useState<Suspect | null>(initialVote);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [votingEnabled, setVotingEnabled] = useState(initialVotingEnabled);

  const [voteResults, setVoteResults] = useState<VoteResult[]>([]);
  const [voteTotal, setVoteTotal] = useState(0);

  const [revealEnabled, setRevealEnabled] = useState(initialRevealEnabled);
  const [revealContent, setRevealContent] = useState(initialRevealContent);
  const [revealedOpen, setRevealedOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(ENTERED_STORAGE_KEY) === "1") {
      setEntered(true);
    }
  }, []);

  const handleEnter = () => {
    setEntered(true);
    window.sessionStorage.setItem(ENTERED_STORAGE_KEY, "1");
  };

  const fetchData = useCallback(async () => {
    try {
      const [cluesRes, alertsRes, sessionRes, resultsRes] = await Promise.all([
        fetch(`/api/public/clues/${sessionSlug}`, { cache: "no-store" }),
        fetch(`/api/public/alerts/${sessionSlug}`, { cache: "no-store" }),
        fetch(`/api/public/session/${sessionSlug}`, { cache: "no-store" }),
        fetch(`/api/public/vote-results/${sessionSlug}`, { cache: "no-store" }),
      ]);

      if (cluesRes.ok) {
        const data = await cluesRes.json();
        const nextClues: Clue[] = data.clues ?? [];

        const newIds = nextClues
          .map((c) => c.id)
          .filter((id) => !knownClueIdsRef.current.has(id));

        if (knownClueIdsRef.current.size > 0 && newIds.length > 0) {
          setNewestClueId(newIds[newIds.length - 1]);
        }

        knownClueIdsRef.current = new Set(nextClues.map((c) => c.id));
        setClues(nextClues);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts ?? []);
      }

      if (sessionRes.ok) {
        const data = await sessionRes.json();
        setVotingEnabled(Boolean(data.votingEnabled));
        setRevealEnabled(Boolean(data.revealEnabled));
        setRevealContent({
          title: data.revealTitle ?? null,
          subtitle: data.revealSubtitle ?? null,
          body: data.revealBody ?? null,
          tagline: data.revealTagline ?? null,
          imageUrl: data.revealImageUrl ?? null,
        });
      }

      if (resultsRes.ok) {
        const data = await resultsRes.json();
        setVoteResults(data.results ?? []);
        setVoteTotal(data.total ?? 0);
      }
    } catch {
      // Falla silenciosa: se reintenta en el próximo ciclo de polling.
    } finally {
      setLoaded(true);
    }
  }, [sessionSlug]);

  useEffect(() => {
    if (!entered) return;
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [entered, fetchData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    window.setTimeout(() => setRefreshing(false), 500);
  };

  const handleSubmitVote = async () => {
    if (!selectedSuspectId) return;
    setVoting(true);
    setVoteError(null);

    const res = await fetch("/api/public/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestSlug, suspectId: selectedSuspectId }),
    });

    const data = await res.json().catch(() => null);
    setVoting(false);

    if (!res.ok) {
      setVoteError(data?.error ?? "No se pudo enviar tu sospecha");
      return;
    }

    setVotedSuspect(data.suspect ?? suspects.find((s) => s.id === selectedSuspectId) ?? null);
    fetchData();
  };

  if (!entered) {
    return (
      <div className="page">
        <div className="bg-texture" aria-hidden="true" />
        <main className="welcome-screen">
          <span className="kicker">Top Secret</span>
          <span className="stamp">CONFIDENCIAL</span>
          <h1 className="display-title">
            Bienvenida,
            <br />
            {guestName}
          </h1>
          <p className="welcome-subtext">
            Tu perfil ya está listo en el expediente. Esta noche, nada es lo
            que parece.
          </p>
          <button className="btn btn-primary" onClick={handleEnter} type="button">
            Entrar al expediente
          </button>
        </main>
      </div>
    );
  }

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

      {view === "results" ? (
        <main className="guest-main results-screen">
          <h2 className="section-title">Resultados en vivo</h2>
          <p className="muted">
            {voteTotal} voto{voteTotal === 1 ? "" : "s"} recibido{voteTotal === 1 ? "" : "s"}
          </p>

          {voteTotal === 0 ? (
            <p className="empty-state">Todavía no hay votos para mostrar.</p>
          ) : (
            <>
              <div
                className="pie-chart"
                style={{
                  background: `conic-gradient(${buildConicGradient(voteResults, voteTotal)})`,
                }}
              />
              <ul className="pie-legend">
                {voteResults.map((result, idx) => (
                  <li key={result.id} className="pie-legend-item">
                    <span
                      className="pie-swatch"
                      style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="pie-legend-name">{result.name}</span>
                    <span className="pie-legend-count">
                      {result.count} ({Math.round((result.count / voteTotal) * 100)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setView("main")}
            style={{ marginTop: 20 }}
          >
            Volver al expediente
          </button>
        </main>
      ) : (
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
            <div className="secret-box">
              <span className="secret-label">Información secreta · solo vos</span>
              <p className="secret-copy">{secretInfo}</p>
            </div>
            <p className="footnote">
              Tu rol es confidencial. No lo compartas con nadie... todavía.
            </p>
          </section>

          {alerts.map((alert) => (
            <div key={alert.id} className="alert-strip">
              <span className="stamp stamp-sm">ALERTA</span>
              <div>
                <p className="alert-strip-title">{alert.title}</p>
                <p className="alert-strip-body">{alert.content}</p>
              </div>
            </div>
          ))}

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
                  {clue.id === newestClueId && (
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

          {votingEnabled && suspects.length > 0 && (
            <section className="card blueprint elev-md vote-section">
              <h2 className="section-title">¿Quién lo hizo?</h2>

              {votedSuspect ? (
                <>
                  <span className="stamp stamp-sm">SOSPECHA REGISTRADA</span>
                  <p className="body-copy vote-result">
                    Acusaste a <strong>{votedSuspect.name}</strong>.
                  </p>
                  <button
                    className="btn btn-secondary vote-submit"
                    type="button"
                    onClick={() => setView("results")}
                  >
                    Ver resultados en vivo
                  </button>
                </>
              ) : (
                <>
                  <p className="body-copy vote-intro">
                    Elegí a quién sospechás. Una vez enviado, no se puede
                    cambiar.
                  </p>
                  <div className="suspect-list">
                    {suspects.map((suspect) => (
                      <button
                        key={suspect.id}
                        type="button"
                        className={`suspect-option${
                          selectedSuspectId === suspect.id ? " selected" : ""
                        }`}
                        onClick={() => setSelectedSuspectId(suspect.id)}
                        disabled={voting}
                      >
                        {suspect.name}
                      </button>
                    ))}
                  </div>
                  {voteError && <p className="form-error">{voteError}</p>}
                  <button
                    className="btn btn-primary vote-submit"
                    type="button"
                    disabled={!selectedSuspectId || voting}
                    onClick={handleSubmitVote}
                  >
                    {voting ? "Enviando..." : "Yo sé quién lo mató"}
                  </button>
                </>
              )}
            </section>
          )}

          <section className="reveal-cta-wrap">
            {revealEnabled ? (
              <button
                className="btn btn-primary reveal-cta"
                type="button"
                onClick={() => setRevealedOpen(true)}
              >
                Ver la revelación final
              </button>
            ) : (
              <p className="reveal-teaser">
                El expediente final se abrirá cuando la fiesta lo decida.
              </p>
            )}
          </section>
        </main>
      )}

      {revealedOpen && (
        <div className="reveal-overlay">
          <div
            className={`reveal-bg${revealContent.imageUrl ? "" : " no-image"}`}
            style={
              revealContent.imageUrl
                ? { backgroundImage: `url(${revealContent.imageUrl})` }
                : undefined
            }
          />
          <div className="reveal-vignette" />
          <div className="reveal-scrim" />
          <div className="reveal-grain" />

          <button
            className="reveal-close"
            type="button"
            onClick={() => setRevealedOpen(false)}
            aria-label="Cerrar"
          >
            ✕
          </button>

          <div className="reveal-content">
            <span className="stamp stamp-sm">CASO CERRADO</span>
            <span className="reveal-edition">{sessionName}</span>
            <h1 className="reveal-title">
              {revealContent.title || "?"}
              {revealContent.subtitle && (
                <>
                  <br />
                  {revealContent.subtitle}
                </>
              )}
            </h1>
            <div className="reveal-divider" />
            {revealContent.body && <p className="reveal-body">{revealContent.body}</p>}
            {revealContent.tagline && (
              <p className="reveal-tagline">{revealContent.tagline}</p>
            )}
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setRevealedOpen(false)}
            >
              Volver al expediente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildConicGradient(results: VoteResult[], total: number) {
  if (total === 0) return "var(--color-divider) 0 100%";

  let cumulative = 0;
  const stops: string[] = [];

  results.forEach((result, idx) => {
    const start = (cumulative / total) * 100;
    cumulative += result.count;
    const end = (cumulative / total) * 100;
    const color = PIE_COLORS[idx % PIE_COLORS.length];
    stops.push(`${color} ${start}% ${end}%`);
  });

  return stops.join(", ");
}
