import { date, money } from '@/lib/format'
import { COLUNAS_CONCILIACAO, downloadXlsx } from '@/lib/downloadXlsx'
import { buildGastoCategoriaRows } from '@/models/domain/reconCategories'

export function rotuloSituacao(recon) {
  return recon === 'conciliado' ? 'Classificado' : 'Sem categoria'
}

export function rotuloOrigem(origem) {
  if (origem === 'ITAU') return 'Itaú'
  if (origem === 'XP') return 'XP'
  if (origem === 'PLUGGY') return 'Open Finance'
  if (origem === 'IMPORTACAO') return 'Importação'
  return 'Manual'
}

export function nomeArquivoConciliacao(period, classificados) {
  const mes = String(period || '').slice(0, 7) || 'periodo'
  return classificados ? `conciliacao-${mes}-classificados.xlsx` : `conciliacao-${mes}.xlsx`
}

export function linhasExportacao(items) {
  return items.map((t) => ({
    Data: t.date ? date(t.date) : '',
    Descrição: t.description || '',
    Contraparte: t.counterparty || '',
    Valor: Number(t.amount) || 0,
    Categoria: t.category || '',
    Situação: rotuloSituacao(t.recon),
    'Conta/instituição': [t.instituicao, t.numeroConta].filter(Boolean).join(' · '),
    Origem: rotuloOrigem(t.origem),
    'Id da operação': t.id,
  }))
}

export function baixarConciliacao(filename, items) {
  return downloadXlsx(filename, linhasExportacao(items), COLUNAS_CONCILIACAO)
}

export function filtrarSaidas(saidas, { busca = '', situacao = 'todos' } = {}) {
  const q = String(busca).trim().toLowerCase()
  return saidas.filter((t) => {
    if (situacao === 'conciliado' && t.recon !== 'conciliado') return false
    if (situacao === 'pendente' && t.recon === 'conciliado') return false
    if (!q) return true
    return [t.description, t.counterparty, t.category].some((s) =>
      String(s || '').toLowerCase().includes(q),
    )
  })
}

export function resumoConciliacao(saidas) {
  const classificados = saidas.filter((t) => t.recon === 'conciliado')
  const pendentes = saidas.filter((t) => t.recon !== 'conciliado')
  const soma = (lista) => lista.reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0)
  const rankingPendentes = buildGastoCategoriaRows(pendentes).sort((a, b) => b.count - a.count)
  return {
    total: saidas.length,
    classificados: classificados.length,
    pendentes: pendentes.length,
    valorClassificados: soma(classificados),
    valorPendentes: soma(pendentes),
    rankingPendentes,
    itensClassificados: classificados,
    itensPendentes: pendentes,
  }
}

export function contextoInsights({ period, scope, resumo, categorias }) {
  return [
    `Período: ${period}.`,
    `Escopo: ${scope === 'grupo' ? 'grupo' : `filial ${scope}`}.`,
    `Saídas no período: ${resumo.total}.`,
    `Classificados (categoria conhecida): ${resumo.classificados}, valor ${money(resumo.valorClassificados)}.`,
    `Sem categoria: ${resumo.pendentes}, valor ${money(resumo.valorPendentes)}.`,
    categorias.length
      ? `Categorias com mais itens sem categoria: ${categorias
          .slice(0, 6)
          .map((c) => `${c.label} (${c.count}, ${money(c.amount)})`)
          .join('; ')}.`
      : 'Nenhuma categoria pendente.',
    'Não invente número, percentual ou categoria que não esteja nestas linhas.',
  ].join(' ')
}

export function parseInsights(texto) {
  const linhas = String(texto || '')
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*•])\s+/, '').replace(/\*\*/g, '').trim())
    .filter(Boolean)
  if (linhas.length >= 2) return linhas.slice(0, 8)
  return String(texto || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8)
}

export const INSTRUCAO_INSIGHTS =
  'Você analisa classificação de saídas financeiras. Responda em português do Brasil. Use só os números do contexto. Não invente valores, percentuais ou categorias. Não cite nota fiscal nem documento. Devolva 4 a 8 frases curtas, uma por linha, começando com hífen. Cada frase deve ser uma observação ou ação para o financeiro classificar as saídas.'
