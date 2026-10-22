'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { atualizarEvento, criarEvento, excluirEvento, getCategorias, getEventos } from '@/lib/api';

const novoEvento = { titulo: '', descricao: '', data_evento: '', local: '', vagas: '1', categoria_id: '' };

function paraInputData(valor) {
  return typeof valor === 'string' ? valor.replace(' ', 'T').slice(0, 16) : '';
}

function paraDataApi(valor) {
  return valor.length === 16 ? `${valor.replace('T', ' ')}:00` : valor.replace('T', ' ');
}

function formatarData(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    .format(new Date(valor.replace(' ', 'T')));
}

export default function AdminPage() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(novoEvento);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [listaEventos, listaCategorias] = await Promise.all([getEventos(), getCategorias()]);
      setEventos(listaEventos);
      setCategorias(listaCategorias);
      setForm((atual) => atual.categoria_id || !listaCategorias.length ? atual : { ...atual, categoria_id: String(listaCategorias[0].id) });
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let atual = true;
    Promise.all([getEventos(), getCategorias()]).then(([listaEventos, listaCategorias]) => {
      if (!atual) return;
      setEventos(listaEventos);
      setCategorias(listaCategorias);
      setForm((formulario) => formulario.categoria_id || !listaCategorias.length ? formulario : { ...formulario, categoria_id: String(listaCategorias[0].id) });
    }).catch((erro) => {
      if (atual) setMensagem({ tipo: 'erro', texto: erro.message });
    }).finally(() => {
      if (atual) setCarregando(false);
    });
    return () => { atual = false; };
  }, []);

  function atualizarCampo(evento) {
    setForm((atual) => ({ ...atual, [evento.target.name]: evento.target.value }));
  }

  function prepararEdicao(evento) {
    setEditandoId(evento.id);
    setForm({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      data_evento: paraInputData(evento.data_evento),
      local: evento.local,
      vagas: String(evento.vagas),
      categoria_id: String(evento.categoria_id)
    });
    setMensagem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ ...novoEvento, categoria_id: categorias[0] ? String(categorias[0].id) : '' });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem(null);
    const dados = { ...form, data_evento: paraDataApi(form.data_evento), vagas: Number(form.vagas), categoria_id: Number(form.categoria_id) };
    try {
      if (editandoId) await atualizarEvento(editandoId, dados);
      else await criarEvento(dados);
      setMensagem({ tipo: 'sucesso', texto: editandoId ? 'Evento atualizado.' : 'Evento criado.' });
      cancelarEdicao();
      await carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    } finally {
      setSalvando(false);
    }
  }

  async function removerEvento(evento) {
    if (!window.confirm(`Excluir “${evento.titulo}”? As inscrições desse evento também serão removidas.`)) return;
    setMensagem(null);
    try {
      await excluirEvento(evento.id);
      setMensagem({ tipo: 'sucesso', texto: 'Evento excluído.' });
      if (editandoId === evento.id) cancelarEdicao();
      await carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="admin-back" href="/">← Voltar à programação</Link>
        <p className="eyebrow eyebrow-dark">PAINEL DE CONTROLE</p>
        <h1>Administrar eventos</h1>
        <p>Crie eventos, atualize os detalhes e mantenha a programação em dia.</p>
      </header>

      <div className="admin-content">
        {mensagem && <div className={`notice notice-${mensagem.tipo}`} role="status" aria-live="polite"><span>{mensagem.texto}</span></div>}
        <section className="form-panel admin-form-panel" aria-labelledby="admin-form-heading">
          <div className="section-heading admin-section-heading"><div><p className="eyebrow eyebrow-dark">{editandoId ? 'EDIÇÃO' : 'NOVO EVENTO'}</p><h2 id="admin-form-heading">{editandoId ? 'Editar evento' : 'Criar evento'}</h2></div></div>
          <form className="admin-event-form" onSubmit={enviar}>
            <label>Título<input name="titulo" value={form.titulo} onChange={atualizarCampo} maxLength="120" required /></label>
            <label>Categoria<select name="categoria_id" value={form.categoria_id} onChange={atualizarCampo} required>
              <option value="">Selecione uma categoria</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
            </select></label>
            <label>Data e horário<input type="datetime-local" name="data_evento" value={form.data_evento} onChange={atualizarCampo} required /></label>
            <label>Local<input name="local" value={form.local} onChange={atualizarCampo} maxLength="100" required /></label>
            <label>Vagas<input type="number" name="vagas" min="1" step="1" value={form.vagas} onChange={atualizarCampo} required /></label>
            <label className="admin-description">Descrição<textarea name="descricao" value={form.descricao} onChange={atualizarCampo} rows="3" /></label>
            <div className="admin-form-actions">
              <button className="button button-primary" type="submit" disabled={salvando || !categorias.length}>{salvando ? 'Salvando…' : editandoId ? 'Salvar alterações' : 'Criar evento'}</button>
              {editandoId && <button className="button button-secondary" type="button" onClick={cancelarEdicao}>Cancelar edição</button>}
            </div>
          </form>
        </section>

        <section className="admin-list-section" aria-labelledby="admin-list-heading">
          <div className="section-heading"><div><p className="eyebrow eyebrow-dark">PROGRAMAÇÃO</p><h2 id="admin-list-heading">Eventos cadastrados</h2></div><span className="event-count">{eventos.length} eventos</span></div>
          {carregando ? <p className="empty-state">Carregando eventos…</p> : eventos.length ? <div className="admin-event-list">
            {eventos.map((evento) => <article className="admin-event-row" key={evento.id}>
              <div className="admin-event-info"><span className="tag">{evento.categoria}</span><h3>{evento.titulo}</h3><p>{formatarData(evento.data_evento)} · {evento.local} · {evento.vagas} vagas</p></div>
              <div className="admin-row-actions"><button className="button button-secondary" type="button" onClick={() => prepararEdicao(evento)}>Editar</button><button className="button button-danger" type="button" onClick={() => removerEvento(evento)}>Excluir</button></div>
            </article>)}
          </div> : <p className="empty-state">Nenhum evento cadastrado.</p>}
        </section>
      </div>
    </main>
  );
}
