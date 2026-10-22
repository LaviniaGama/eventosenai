'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import EventoCard from '@/components/EventoCard';
import FormInscricao from '@/components/FormInscricao';
import FormParticipante from '@/components/FormParticipante';
import { cadastrarParticipante, getCategorias, getEventos, getParticipantes, inscrever } from '@/lib/api';

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async (categoriaId = '') => {
    const resultados = await Promise.allSettled([getEventos(categoriaId), getParticipantes(), getCategorias()]);
    const [eventosResult, participantesResult, categoriasResult] = resultados;
    if (eventosResult.status === 'fulfilled') setEventos(eventosResult.value);
    if (participantesResult.status === 'fulfilled') setParticipantes(participantesResult.value);
    if (categoriasResult.status === 'fulfilled') setCategorias(categoriasResult.value);
    const erros = resultados.filter((resultado) => resultado.status === 'rejected').map((resultado) => resultado.reason.message);
    if (erros.length) setMensagem({ tipo: 'erro', texto: erros.join(' ') });
    setCarregando(false);
  }, []);

  useEffect(() => {
    let atual = true;
    Promise.allSettled([getEventos(categoriaSelecionada), getParticipantes(), getCategorias()]).then((resultados) => {
      if (!atual) return;
      const [eventosResult, participantesResult, categoriasResult] = resultados;
      if (eventosResult.status === 'fulfilled') setEventos(eventosResult.value);
      if (participantesResult.status === 'fulfilled') setParticipantes(participantesResult.value);
      if (categoriasResult.status === 'fulfilled') setCategorias(categoriasResult.value);
      const erros = resultados.filter((resultado) => resultado.status === 'rejected').map((resultado) => resultado.reason.message);
      if (erros.length) setMensagem({ tipo: 'erro', texto: erros.join(' ') });
      setCarregando(false);
    });
    return () => { atual = false; };
  }, [categoriaSelecionada]);

  async function handleCadastrarParticipante(dados) {
    try {
      const participante = await cadastrarParticipante(dados);
      setParticipantes((atuais) => [...atuais, participante].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
      setMensagem({ tipo: 'sucesso', texto: 'Participante cadastrado com sucesso.' });
      return true;
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      return false;
    }
  }

  async function handleInscrever(eventoId, participanteId) {
    try {
      await inscrever(eventoId, participanteId);
      setMensagem({ tipo: 'sucesso', texto: 'Inscrição realizada com sucesso.' });
      await carregarDados(categoriaSelecionada);
      return true;
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      if (erro.message === 'Evento lotado') await getEventos(categoriaSelecionada).then(setEventos).catch(() => {});
      return false;
    }
  }

  return (
    <main className="page-shell">
      <header className="hero"><div className="hero-inner">
        <Link className="admin-link" href="/admin">Administrar eventos <span aria-hidden="true">↗</span></Link>
        <p className="eyebrow">SENAI · AGENDA</p>
        <h1>Encontre seu próximo evento.</h1>
        <p className="hero-copy">Palestras, oficinas e encontros para aprender fazendo.</p>
      </div></header>
      <div className="content-shell">
        {mensagem && <div className={`notice notice-${mensagem.tipo}`} role="status" aria-live="polite">
          <span>{mensagem.texto}</span>
          <button className="notice-close" type="button" aria-label="Fechar mensagem" onClick={() => setMensagem(null)}>×</button>
        </div>}
        <section className="events-section" aria-labelledby="events-heading">
          <div className="section-heading"><div><p className="eyebrow eyebrow-dark">PROGRAMAÇÃO</p><h2 id="events-heading">Próximos eventos</h2></div>
            <label className="category-filter">Categoria
              <select value={categoriaSelecionada} onChange={(evento) => setCategoriaSelecionada(evento.target.value)}>
                <option value="">Todas as categorias</option>
                {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
              </select>
            </label>
            <span className="event-count">{eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}</span>
          </div>
          {carregando ? <p className="empty-state">Carregando eventos…</p> : eventos.length ? (
            <div className="event-grid">{eventos.map((evento) => <EventoCard key={evento.id} evento={evento} />)}</div>
          ) : <p className="empty-state">Nenhum evento disponível no momento.</p>}
        </section>
        <section className="forms-section" aria-label="Cadastro e inscrição">
          <FormParticipante onCadastrar={handleCadastrarParticipante} />
          <FormInscricao eventos={eventos} participantes={participantes} onInscrever={handleInscrever} />
        </section>
        <footer className="site-footer">Feito para aprender, compartilhar e participar.</footer>
      </div>
    </main>
  );
}
