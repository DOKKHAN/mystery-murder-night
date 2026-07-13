"use client";

import { useCallback, useEffect, useState } from "react";

type Vote = {
  id: string;
  createdAt: string;
  voter: { id: string; name: string };
  suspect: { id: string; name: string };
};

const POLL_INTERVAL_MS = 5000;

export function VoteList({ initialVotes }: { initialVotes: Vote[] }) {
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [resetting, setResetting] = useState(false);

  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch("/api/votes", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setVotes(data);
    } catch {
      // silencioso, se reintenta en el próximo ciclo
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchVotes, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchVotes]);

  const handleReset = async () => {
    if (
      !confirm(
        "¿Reset total de votación? Esto borra TODOS los votos enviados hasta ahora. Los invitados y las pistas no se tocan."
      )
    ) {
      return;
    }
    setResetting(true);
    const res = await fetch("/api/votes/reset", { method: "POST" });
    if (res.ok) {
      setVotes([]);
    }
    setResetting(false);
  };

  return (
    <div>
      <div className="admin-page-header">
        <p className="muted">{votes.length} voto{votes.length === 1 ? "" : "s"} recibidos · se actualiza solo cada 5s</p>
        <button className="btn btn-danger" onClick={handleReset} disabled={resetting} type="button">
          {resetting ? "Reseteando..." : "Reset total"}
        </button>
      </div>

      {votes.length === 0 ? (
        <p className="empty-state">Todavía no llegó ningún voto.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Invitado</th>
              <th>Sospecha de</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((vote) => (
              <tr key={vote.id}>
                <td>{vote.voter.name}</td>
                <td>{vote.suspect.name}</td>
                <td>{new Date(vote.createdAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
