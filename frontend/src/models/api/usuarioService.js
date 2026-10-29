import api from './client'

function apiMessage(erro, fallback) {
  const data = erro?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  return fallback
}

export async function listarUsuarios() {
  const resposta = await api.get('/usuarios')
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function buscarUsuarioPorId(id) {
  const resposta = await api.get(`/usuarios/${id}`)
  return resposta.data
}

export async function cadastrarUsuario(payload) {
  try {
    const resposta = await api.post('/usuarios', payload)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível cadastrar o usuário.'))
  }
}

export async function atualizarUsuario(id, payload) {
  try {
    const resposta = await api.put(`/usuarios/${id}`, payload)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível atualizar o usuário.'))
  }
}

export async function excluirUsuario(id) {
  try {
    await api.delete(`/usuarios/${id}`)
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível excluir o usuário.'))
  }
}
