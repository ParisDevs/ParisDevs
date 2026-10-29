function digits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function formatCnpj(value) {
  const d = digits(value).slice(0, 14)
  if (d.length !== 14) return value
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function isoDate(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (br) return `${br[3]}-${br[2]}-${br[1]}`
  return ''
}

export async function lookupCnpj(raw) {
  const cnpj = digits(raw)
  if (cnpj.length !== 14) return { error: 'Informe um CNPJ com 14 dígitos.' }
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
    if (!res.ok) return { error: 'Não foi possível consultar o CNPJ nas fontes públicas agora.' }
    const data = await res.json()
    const tipo = String(data.descricao_tipo_de_logradouro ?? '').trim()
    const logradouro = String(data.logradouro ?? '').trim()
    return {
      cnpj: formatCnpj(cnpj),
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || '',
      cnae: data.cnae_fiscal_descricao || '',
      situacao: data.descricao_situacao_cadastral || 'Não consultada',
      dataAbertura: isoDate(data.data_inicio_atividade),
      cep: digits(data.cep),
      logradouro: [tipo, logradouro].filter(Boolean).join(' '),
      numero: data.numero ? String(data.numero) : '',
      complemento: data.complemento ? String(data.complemento) : '',
      bairro: data.bairro || '',
      cidade: data.municipio || '',
      uf: data.uf || '',
      pais: 'Brasil',
      source: 'brasilapi',
    }
  } catch {
    return { error: 'Consulta pública indisponível neste ambiente.' }
  }
}

export async function lookupCep(raw) {
  const cep = digits(raw)
  if (cep.length !== 8) return { error: 'Informe um CEP com 8 dígitos.' }
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    if (!res.ok) return { error: 'Não foi possível consultar o CEP agora.' }
    const data = await res.json()
    if (data.erro) return { error: 'CEP não encontrado.' }
    return {
      cep,
      logradouro: data.logradouro || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
      pais: 'Brasil',
    }
  } catch {
    return { error: 'Consulta de CEP indisponível neste ambiente.' }
  }
}
