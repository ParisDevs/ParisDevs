import api from './client'

function apiMessage(erro, fallback) {
  const data = erro?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  return fallback
}

export async function listarFiliais() {
  const resposta = await api.get('/filiais')
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function buscarFilialPorId(id) {
  const resposta = await api.get(`/filiais/${id}`)
  return resposta.data
}

export async function cadastrarFilial(payload) {
  try {
    const resposta = await api.post('/filiais', payload)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível cadastrar a empresa.'))
  }
}

export async function atualizarFilial(id, payload) {
  try {
    const resposta = await api.put(`/filiais/${id}`, payload)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível atualizar a empresa.'))
  }
}

export async function excluirFilial(id) {
  try {
    await api.delete(`/filiais/${id}`)
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não é possível excluir: há cadastros vinculados.'))
  }
}
