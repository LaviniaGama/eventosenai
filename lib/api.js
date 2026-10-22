const API = process.env.NEXT_PUBLIC_API_URL;

export async function getEventos() {
  const resposta = await fetch(`${API}/eventos`, { cache: 'no-store' });
  if (!resposta.ok) throw new Error('Erro ao buscar eventos');
  return resposta.json();
}

export async function inscrever(evento_id, participante_id) {
  const resposta = await fetch(`${API}/inscricoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento_id, participante_id })
  });
  const dados = await resposta.json();
  return { ok: resposta.ok, dados };
}

// TODO: getParticipantes, cadastrarParticipante, getInscritos