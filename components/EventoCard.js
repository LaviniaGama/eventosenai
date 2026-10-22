export default function EventoCard({ evento }) {
  const lotado = evento.vagas_restantes <= 0;

  return (
    <article className="card">
      <h3>{evento.titulo}</h3>
      <span className="tag">{evento.categoria}</span>
      <p>
        {new Date(evento.data_evento).toLocaleString('pt-BR')} · {evento.local}
      </p>
      <p>
        {lotado ? <strong>Lotado</strong> : <>Vagas restantes: <strong>{evento.vagas_restantes}</strong></>}
      </p>
    </article>
  );
}