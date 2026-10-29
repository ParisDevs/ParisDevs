import api from './client'

export async function listarContasBancarias() {
  const resposta = await api.get('/contasBancarias')
  return Array.isArray(resposta.data) ? resposta.data : []
}
