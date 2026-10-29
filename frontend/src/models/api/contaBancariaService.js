import api from './client'

function apiMessage(erro, fallback) {
  const data = erro?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  return fallback
}

export async function listarContasBancarias() {
  const resposta = await api.get('/contasBancarias')
  return Array.isArray(resposta.data) ? resposta.data : []
}

export async function cadastrarContaBancaria(payload) {
  try {
    const resposta = await api.post('/contasBancarias', payload)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível cadastrar a conta bancária.'))
  }
}

export async function atualizarContaBancaria(id, payload) {
  try {
    const resposta = await api.put(`/contasBancarias/${id}`, payload)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível atualizar a conta bancária.'))
  }
}

export async function excluirContaBancaria(id) {
  try {
    await api.delete(`/contasBancarias/${id}`)
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não é possível excluir: há cadastros vinculados.'))
  }
}
