'use client';

import { useState } from 'react';

export default function FormParticipante({ onCadastrar }) {
  const [form, setForm] = useState({ nome: '', email: '', turma: '' });
  const [enviando, setEnviando] = useState(false);
  function atualizar(evento) { setForm((atual) => ({ ...atual, [evento.target.name]: evento.target.value })); }
  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    const sucesso = await onCadastrar(form);
    if (sucesso) setForm({ nome: '', email: '', turma: '' });
    setEnviando(false);
  }

  return (
    <section className="form-panel" aria-labelledby="participant-heading">
      <div className="form-heading"><span className="form-number">01</span><div><p className="eyebrow eyebrow-dark">PRIMEIRO PASSO</p><h2 id="participant-heading">Cadastre-se</h2></div></div>
      <p className="form-intro">Crie seu perfil para poder participar dos eventos.</p>
      <form onSubmit={enviar} className="stacked-form">
        <label>Nome<input name="nome" autoComplete="name" value={form.nome} onChange={atualizar} required /></label>
        <label>E-mail<input name="email" type="email" autoComplete="email" value={form.email} onChange={atualizar} required /></label>
        <label>Turma<input name="turma" value={form.turma} onChange={atualizar} placeholder="Ex.: DEV-2026.1" required /></label>
        <button className="button button-primary" type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Cadastrar participante'}</button>
      </form>
    </section>
  );
}
