export type CnpjInfo = {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  cnae: string
  situacao: string
  source: 'brasilapi' | 'indisponivel'
}

function digits(value: string) {
  return value.replace(/\D/g, '')
}

export function formatCnpj(value: string) {
  const d = digits(value).slice(0, 14)
  if (d.length !== 14) return value
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export async function lookupCnpj(raw: string): Promise<CnpjInfo | { error: string }> {
  const cnpj = digits(raw)
  if (cnpj.length !== 14) return { error: 'Informe um CNPJ com 14 dígitos.' }
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
    if (!res.ok) return { error: 'Não foi possível consultar o CNPJ nas fontes públicas agora.' }
    const data = (await res.json()) as {
      razao_social?: string
      nome_fantasia?: string
      cnae_fiscal_descricao?: string
      descricao_situacao_cadastral?: string
    }
    return {
      cnpj: formatCnpj(cnpj),
      razaoSocial: data.razao_social ?? '—',
      nomeFantasia: data.nome_fantasia || '—',
      cnae: data.cnae_fiscal_descricao ?? '—',
      situacao: data.descricao_situacao_cadastral ?? '—',
      source: 'brasilapi',
    }
  } catch {
    return { error: 'Consulta pública indisponível neste ambiente.' }
  }
}
