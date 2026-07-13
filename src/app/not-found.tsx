export default function NotFound() {
  return (
    <div className="page">
      <div className="bg-texture" aria-hidden="true" />
      <main className="landing-main">
        <span className="kicker accent">Expediente no encontrado</span>
        <h1 className="display-title">404</h1>
        <p className="body-copy">
          Este link no corresponde a ningún invitado. Verificá el link con
          quien organiza la partida.
        </p>
      </main>
    </div>
  );
}
