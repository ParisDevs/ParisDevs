import api from './client'

function apiMessage(erro, fallback) {
  const data = erro?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  return fallback
}

function paramsOf({ data, idFilial } = {}) {
  const params = {}
  if (data) params.data = data
  if (idFilial != null) params.idFilial = idFilial
  return params
}

export async function buscarDre({ data, idFilial } = {}) {
  try {
    const resposta = await api.get('/dre', { params: paramsOf({ data, idFilial }) })
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível consultar a DRE.'))
  }
}

export async function buscarDreHistorico({ idFilial } = {}) {
  try {
    const resposta = await api.get('/dre/historico', { params: paramsOf({ idFilial }) })
    return Array.isArray(resposta.data) ? resposta.data : []
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível consultar o histórico da DRE.'))
  }
}

export async function buscarDrePorData(data, { idFilial } = {}) {
  try {
    const resposta = await api.get(`/dre/historico/${data}`, { params: paramsOf({ idFilial }) })
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível consultar a DRE desta data.'))
  }
}

export async function gerarDre({ data, idFilial } = {}) {
  try {
    const body = {}
    if (data) body.data = data
    if (idFilial != null) body.idFilial = idFilial
    const resposta = await api.post('/dre/gerar', body)
    return resposta.data
  } catch (erro) {
    throw new Error(apiMessage(erro, 'Não foi possível gravar a DRE no histórico.'))
  }
}
