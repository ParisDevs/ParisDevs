import api from './client'

function apiMessage(erro, fallback) {
  const data = erro?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  return fallback
}

export async function statusAssistente(provedor) {
  const resposta = await api.get('/assistente/status', {
    params: provedor ? { provedor } : {},
  })
  return resposta.data
}

export async function salvarChaveAssistente(provedor, chave) {
  try {
    const resposta = await api.put('/assistente/credencial', { provedor, chave })
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível guardar a chave.'))
  }
}

export async function conversarAssistente({ provedor, instrucoes, contexto, mensagens }) {
  try {
    const resposta = await api.post('/assistente/chat', { provedor, instrucoes, contexto, mensagens })
    return resposta.data?.texto || ''
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível consultar o assistente.'))
  }
}
