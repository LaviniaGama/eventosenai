'use client';

import { useEffect, useState } from 'react';
import { getEventos, inscrever } from '@/lib/api';
import EventoCard from '@/components/EventoCard';

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [mensagem, setMensagem] = useState(null);

  async function carregarEventos() {
    try {
      setEventos(await getEventos());
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    }
  }

  useEffect(() => { carregarEventos(); }, []);

  async function handleInscrever(eventoId, participanteId) {
    const { ok, dados } = await inscrever(eventoId, participanteId);
    if (!ok) {
      setMensagem({ tipo: 'erro', texto: dados.erro }); // ex.: "Evento lotado"
      return;
    }
    setMensagem({ tipo: 'sucesso', texto: 'Inscrição realizada!' });
    carregarEventos(); // atualiza as vagas na tela
  }

  return (
    <main>
      <h1>EventoSENAI</h1>
      {mensagem && <p className={mensagem.tipo}>{mensagem.texto}</p>}

      <section className="grid">
        {eventos.map(ev => <EventoCard key={ev.id} evento={ev} />)}
      </section>

      {/* TODO: <FormParticipante /> e <FormInscricao onInscrever={handleInscrever} /> */}
    </main>
  );
}