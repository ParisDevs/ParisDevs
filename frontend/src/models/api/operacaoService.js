import api from './client'

function apiMessage(erro, fallback) {
  const data = erro?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  return fallback
}

export async function listarOperacoes() {
  const resposta = await api.get('/operacoes')
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function buscarOperacaoPorId(id) {
  const resposta = await api.get(`/operacoes/${id}`)
  return resposta.data
}

export async function cadastrarOperacao(payload) {
  try {
    const resposta = await api.post('/operacoes', payload)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível cadastrar a operação.'))
  }
}

export async function atualizarOperacao(id, payload) {
  try {
    const resposta = await api.put(`/operacoes/${id}`, payload)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível atualizar a operação.'))
  }
}

export async function excluirOperacao(id) {
  try {
    await api.delete(`/operacoes/${id}`)
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível excluir a operação.'))
  }
}
