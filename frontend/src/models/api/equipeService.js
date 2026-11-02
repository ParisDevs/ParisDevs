import api from './client'

function apiMessage(erro, fallback) {
  const data = erro?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  return fallback
}

async function chamada(promise, fallback) {
  try {
    return await promise
  } catch (erro) {
    throw new Error(apiMessage(erro, fallback))
  }
}

export async function listarConversasEquipe() {
  const resposta = await chamada(api.get('/equipe/conversas'), 'Não foi possível carregar as conversas.')
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function contarNaoLidasEquipe() {
  try {
    const resposta = await api.get('/equipe/nao-lidas')
    return Number(resposta.data?.total) || 0
  } catch {
    return 0
  }
}

export async function abrirDiretaEquipe(usuarioId) {
  const resposta = await chamada(api.post('/equipe/conversas/diretas', { usuarioId }), 'Não foi possível abrir a conversa.')
  return resposta.data
}

export async function criarGrupoEquipe(titulo, usuarioIds) {
  const resposta = await chamada(
    api.post('/equipe/conversas/grupos', { titulo, usuarioIds }),
    'Não foi possível criar o grupo.',
  )
  return resposta.data
}

export async function listarMensagensEquipe(id) {
  const resposta = await chamada(api.get(`/equipe/conversas/${id}/mensagens`), 'Não foi possível carregar as mensagens.')
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function enviarMensagemEquipe(id, texto) {
  const resposta = await chamada(
    api.post(`/equipe/conversas/${id}/mensagens`, { texto }),
    'Não foi possível enviar a mensagem.',
  )
  return resposta.data
}

export async function editarMensagemEquipe(conversaId, mensagemId, texto) {
  const resposta = await chamada(
    api.patch(`/equipe/conversas/${conversaId}/mensagens/${mensagemId}`, { texto }),
    'Não foi possível editar a mensagem.',
  )
  return resposta.data
}

export async function removerMensagemEquipe(conversaId, mensagemId) {
  await chamada(
    api.delete(`/equipe/conversas/${conversaId}/mensagens/${mensagemId}`),
    'Não foi possível apagar a mensagem.',
  )
}

export async function marcarLeituraEquipe(id) {
  await chamada(api.post(`/equipe/conversas/${id}/leitura`), 'Não foi possível marcar a leitura.')
}

export async function listarEventosEquipe(ano, mes) {
  const resposta = await chamada(
    api.get('/equipe/eventos', { params: { ano, mes } }),
    'Não foi possível carregar os lembretes.',
  )
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function criarEventoEquipe(payload) {
  const resposta = await chamada(api.post('/equipe/eventos', payload), 'Não foi possível guardar o lembrete.')
  return resposta.data
}

export async function atualizarEventoEquipe(id, payload) {
  const resposta = await chamada(api.patch(`/equipe/eventos/${id}`, payload), 'Não foi possível atualizar o lembrete.')
  return resposta.data
}

export async function removerEventoEquipe(id) {
  await chamada(api.delete(`/equipe/eventos/${id}`), 'Não foi possível excluir o lembrete.')
}

export async function listarChecklistEquipe() {
  const resposta = await chamada(api.get('/equipe/checklist'), 'Não foi possível carregar o checklist.')
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function criarItemChecklistEquipe(texto) {
  const resposta = await chamada(api.post('/equipe/checklist', { texto }), 'Não foi possível adicionar o item.')
  return resposta.data
}

export async function atualizarItemChecklistEquipe(id, payload) {
  const resposta = await chamada(api.patch(`/equipe/checklist/${id}`, payload), 'Não foi possível atualizar o item.')
  return resposta.data
}

export async function removerItemChecklistEquipe(id) {
  await chamada(api.delete(`/equipe/checklist/${id}`), 'Não foi possível excluir o item.')
}
