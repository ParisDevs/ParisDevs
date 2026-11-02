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

export async function listarConexoes() {
  const resposta = await chamada(api.get('/conexoes'), 'Não foi possível consultar as conexões.')
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function criarConexao(payload) {
  const resposta = await chamada(api.post('/conexoes', payload), 'Não foi possível criar a conexão.')
  return resposta.data
}

export async function removerConexao(id) {
  await chamada(api.delete(`/conexoes/${id}`), 'Não foi possível desconectar.')
}

export async function salvarCredencialProvedor(payload) {
  const resposta = await chamada(api.put('/conexoes/credencial', payload), 'Não foi possível guardar a credencial.')
  return resposta.data
}

export async function sincronizarConexao(id, payload) {
  const resposta = await chamada(api.post(`/conexoes/${id}/sincronizar`, payload), 'Não foi possível sincronizar.')
  return resposta.data
}

export async function conectarPluggy(id, payload) {
  const resposta = await chamada(api.post(`/conexoes/${id}/pluggy`, payload), 'Não foi possível conectar o sandbox.')
  return resposta.data
}
