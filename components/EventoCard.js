import { useState } from 'react';
import { getInscritos } from '@/lib/api';

function formatarData(valor) {
  const data = new Date(typeof valor === 'string' ? valor.replace(' ', 'T') : valor);
  if (Number.isNaN(data.getTime())) return 'Data a confirmar';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(data);
}

export default function EventoCard({ evento }) {
  const [inscritos, setInscritos] = useState(null);
  const [mostrarInscritos, setMostrarInscritos] = useState(false);
  const [carregandoInscritos, setCarregandoInscritos] = useState(false);
  const [erroInscritos, setErroInscritos] = useState('');
  const lotado = Number(evento.vagas_restantes) <= 0;
  const encerrado = Boolean(Number(evento.encerrado));

  async function alternarInscritos() {
    if (mostrarInscritos) { setMostrarInscritos(false); return; }
    setMostrarInscritos(true);
    setCarregandoInscritos(true);
    setErroInscritos('');
    try { setInscritos(await getInscritos(evento.id)); }
    catch (erro) { setErroInscritos(erro.message); }
    finally { setCarregandoInscritos(false); }
  }

  return (
    <article className={`event-card${lotado ? ' event-card-full' : ''}`}>
      <div className="card-topline"><span className="tag">{evento.categoria}</span>{lotado ? <span className="full-badge">Lotado</span> : encerrado && <span className="full-badge">Encerrado</span>}</div>
      <h3>{evento.titulo}</h3>
      <dl className="event-details">
        <div><dt>Quando</dt><dd>{formatarData(evento.data_evento)}</dd></div>
        <div><dt>Onde</dt><dd>{evento.local}</dd></div>
      </dl>
      <div className="card-bottom">
        <p className="seats-line">{lotado ? <strong>Vagas esgotadas</strong> : <><strong>{evento.vagas_restantes}</strong> {Number(evento.vagas_restantes) === 1 ? 'vaga restante' : 'vagas restantes'}</>}</p>
        <button className="text-button" type="button" onClick={alternarInscritos} aria-expanded={mostrarInscritos}>{mostrarInscritos ? 'Ocultar inscritos' : 'Ver inscritos'}</button>
      </div>
      {(lotado || encerrado) && <button className="button button-disabled" type="button" disabled>{lotado ? 'Inscrições encerradas · Lotado' : 'Evento já realizado'}</button>}
      {mostrarInscritos && <div className="attendee-list"><h4>Participantes inscritos</h4>
        {carregandoInscritos ? <p>Carregando…</p> : erroInscritos ? <p className="inline-error">{erroInscritos}</p> : inscritos?.length ? <ul>{inscritos.map((pessoa) => <li key={pessoa.id}>{pessoa.nome}</li>)}</ul> : <p>Ainda não há participantes inscritos.</p>}
      </div>}
    </article>
  );
}
