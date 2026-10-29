import { money, percent } from '@/lib/format'

export const DRE_FATOR_LIQUIDO = 0.87
export const DRE_PERC_ALTO = 0.5

export function isMercadoria(categoria) {
  const valor = String(categoria ?? '').toLowerCase()
  if (valor === 'alimentos') return true
  return (
    valor.includes('mercador') ||
    valor.includes('alimento') ||
    valor.includes('ceagesp') ||
    valor.includes('ambev') ||
    valor.includes('vinho') ||
    valor.includes('fornecedor')
  )
}

export function empresaRelatorio(razaoSocial) {
  const nome = String(razaoSocial ?? '')
  const lower = nome.toLowerCase()
  if (lower.includes('vaudeville')) return 'A3 - VAUDEVILLE'
  if (lower.includes('classique')) return 'B3 - CLASSIQUE'
  if (lower.includes('cave')) return 'LA CAVE'
  return nome.trim() || '—'
}

export function isoDateSaoPaulo(from = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(from)
}

export function dataD1(from = new Date()) {
  const [year, month, day] = isoDateSaoPaulo(from).split('-').map(Number)
  const cursor = new Date(Date.UTC(year, month - 1, day))
  cursor.setUTCDate(cursor.getUTCDate() - 1)
  return cursor.toISOString().slice(0, 10)
}

export function moneyParen(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (n < 0) return `(${money(Math.abs(n))})`
  return money(n)
}

export function percLabel(ratio) {
  if (ratio == null || !Number.isFinite(Number(ratio))) return '—'
  return percent(Number(ratio) * 100, 1)
}

export function percAlto(ratio) {
  return Number(ratio) >= DRE_PERC_ALTO
}

export function dataExtenso(iso) {
  const value = String(iso ?? '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '—'
  const [year, month, day] = value.split('-').map(Number)
  const dt = new Date(year, month - 1, day)
  return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function mapDreLinha(dto) {
  return {
    idFilial: dto?.idFilial ?? null,
    empresaRelatorio: dto?.empresaRelatorio || '—',
    receitaTotal: Number(dto?.receitaTotal) || 0,
    receitaLiquida: Number(dto?.receitaLiquida) || 0,
    mercadorias: Number(dto?.mercadorias) || 0,
    percMercadorias: dto?.percMercadorias == null ? null : Number(dto.percMercadorias),
    resultado: Number(dto?.resultado) || 0,
  }
}

export function mapDreRelatorio(dto) {
  const linhas = Array.isArray(dto?.linhas) ? dto.linhas.map(mapDreLinha) : []
  return {
    dataReferencia: dto?.dataReferencia ? String(dto.dataReferencia).slice(0, 10) : '',
    origem: dto?.origem === 'SNAPSHOT' ? 'SNAPSHOT' : 'AO_VIVO',
    linhas,
    total: mapDreLinha(dto?.total ?? { empresaRelatorio: 'Total' }),
  }
}

export function mapDreHistoricoItem(dto) {
  return {
    dataReferencia: dto?.dataReferencia ? String(dto.dataReferencia).slice(0, 10) : '',
    geradoEm: dto?.geradoEm ? String(dto.geradoEm) : '',
    receitaTotal: Number(dto?.receitaTotal) || 0,
    receitaLiquida: Number(dto?.receitaLiquida) || 0,
    mercadorias: Number(dto?.mercadorias) || 0,
    percMercadorias: dto?.percMercadorias == null ? null : Number(dto.percMercadorias),
    resultado: Number(dto?.resultado) || 0,
  }
}

export const DRE_COLUNAS = [
  'Empresa no relatório',
  'Receita total até D-1 (c/ rateio H1)',
  'Receita líquida (−13%)',
  'Mercadorias liquidadas até D-1',
  '% Mercadorias / Receita líquida',
  'Receita total − todos os valores pagos',
]
