'use client';

import { useState } from 'react';

export default function FormInscricao({ eventos, participantes, onInscrever }) {
  const [eventoId, setEventoId] = useState('');
  const [participanteId, setParticipanteId] = useState('');
  const [enviando, setEnviando] = useState(false);
  const eventosAbertos = eventos.filter((evento) => Number(evento.vagas_restantes) > 0 && !Number(evento.encerrado));

  async function enviar(evento) {
    evento.preventDefault();
    if (!eventoId || !participanteId) return;
    setEnviando(true);
    const sucesso = await onInscrever(eventoId, participanteId);
    if (sucesso) { setEventoId(''); setParticipanteId(''); }
    setEnviando(false);
  }

  return (
    <section className="form-panel form-panel-accent" aria-labelledby="registration-heading">
      <div className="form-heading"><span className="form-number">02</span><div><p className="eyebrow eyebrow-dark">ESCOLHA SEU LUGAR</p><h2 id="registration-heading">Faça sua inscrição</h2></div></div>
      <p className="form-intro">Selecione um evento e o participante que vai participar.</p>
      <form onSubmit={enviar} className="stacked-form">
        <label>Evento<select value={eventoId} onChange={(e) => setEventoId(e.target.value)} required>
          <option value="">Selecione um evento</option>
          {eventos.map((evento) => { const lotado = Number(evento.vagas_restantes) <= 0; const encerrado = Boolean(Number(evento.encerrado)); return <option key={evento.id} value={evento.id} disabled={lotado || encerrado}>{evento.titulo}{lotado ? ' — Lotado' : encerrado ? ' — Encerrado' : ` — ${evento.vagas_restantes} vagas`}</option>; })}
        </select></label>
        <label>Participante<select value={participanteId} onChange={(e) => setParticipanteId(e.target.value)} required>
          <option value="">Selecione um participante</option>
          {participantes.map((participante) => <option key={participante.id} value={participante.id}>{participante.nome} · {participante.turma}</option>)}
        </select></label>
        {!eventosAbertos.length && eventos.length > 0 && <p className="inline-note">Não há eventos futuros com vagas disponíveis no momento.</p>}
        {!participantes.length && <p className="inline-note">Cadastre um participante antes de fazer a inscrição.</p>}
        <button className="button button-primary" type="submit" disabled={enviando || !eventosAbertos.length || !participantes.length}>{enviando ? 'Enviando…' : 'Confirmar inscrição'}</button>
      </form>
    </section>
  );
}
