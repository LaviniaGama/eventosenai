const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3307';

async function request(caminho, opcoes) {
  let resposta;
  try {
    resposta = await fetch(`${API}${caminho}`, opcoes);
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o servidor está em execução.');
  }

  const dados = resposta.status === 204 ? null : await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados?.erro || `A solicitação falhou (${resposta.status}).`);
  return dados;
}

export async function getEventos(categoriaId = '') {
  const query = categoriaId ? `?categoria=${encodeURIComponent(categoriaId)}` : '';
  return request(`/eventos${query}`, { cache: 'no-store' });
}

export async function getCategorias() {
  return request('/categorias', { cache: 'no-store' });
}

export async function getParticipantes() {
  return request('/participantes', { cache: 'no-store' });
}

export async function cadastrarParticipante(participante) {
  return request('/participantes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(participante)
  });
}

export async function getInscritos(eventoId) {
  return request(`/eventos/${eventoId}/inscritos`, { cache: 'no-store' });
}

export async function inscrever(evento_id, participante_id) {
  return request('/inscricoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento_id, participante_id })
  });
}

export async function criarEvento(evento) {
  return request('/eventos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento)
  });
}

export async function atualizarEvento(id, evento) {
  return request(`/eventos/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evento)
  });
}

export async function excluirEvento(id) {
  return request(`/eventos/${id}`, { method: 'DELETE' });
}
