import { chartOfAccounts } from '@/models/fixtures'

import {
  Building2,
  Car,
  Coins,
  Drama,
  GraduationCap,
  HeartPulse,
  Home,
  Phone,
  Sparkles,
  UtensilsCrossed,
  User,
} from 'lucide-react'
import { gastoChartGroup, isAiMechanism } from '@/models/domain/finance'


/** Tons de verde da identidade Avenza para barras e chips. */
export const GASTO_BAR_GREENS = [
  '#0B5D4E',
  '#0E7C56',
  '#117A63',
  '#158F72',
  '#1A8F72',
  '#21987E',
  '#2AA388',
  '#35AE92',
  '#45B89C',
  '#5CC4A8',
  '#75CEB4',
  '#8EDBC5',
] 



export const GASTO_GROUP_META = {
  mercadorias: { label: 'Alimentação e viagem', Icon: UtensilsCrossed },
  outros: { label: 'Não classificado', Icon: Sparkles },
  ocupacao: { label: 'Aluguel e ocupação', Icon: Home },
  folha: { label: 'Folha e encargos', Icon: User },
  transporte: { label: 'Outras despesas', Icon: Car },
  manutencao: { label: 'Fornecedores e serviços', Icon: Drama },
  contas: { label: 'Outras despesas', Icon: Phone },
  marketing: { label: 'Marketing e publicidade', Icon: GraduationCap },
  deducoes: { label: 'Impostos e tributos', Icon: HeartPulse },
  financeiro: { label: 'Tarifas bancárias', Icon: Coins },
  admin: { label: 'Outras despesas', Icon: Building2 },
  tecnologia: { label: 'Tecnologia e software', Icon: Phone },
  transferencias: { label: 'Investimentos e transferências', Icon: Coins },
  emprestimos: { label: 'Empréstimos e financiamentos', Icon: Building2 },
}

 

















export function isGastoGroupId(id) {
  return id in GASTO_GROUP_META
}

function greenShade(index) {
  return GASTO_BAR_GREENS[Math.min(index, GASTO_BAR_GREENS.length - 1)]
}

export function filterSaidas(tx) {
  return tx.filter((t) => (t.saida || t.tipo === 'PAGAMENTO' || t.amount < 0) && t.recon !== 'interna')
}

export function txInGastoGroup(t, groupId) {
  return gastoChartGroup(t.category) === groupId
}



const MERCADORIAS_SUBS = [
  { slug: 'geral', label: 'Alimentação', match: (c) => !!c?.startsWith('C.1') || gastoChartGroup(c) === 'mercadorias' },
]

const GROUP_CHART_PARENT = {
  ocupacao: 'O.1',
  manutencao: 'O.2',
  contas: 'O.3',
  marketing: 'O.4',
  transporte: 'O.5',
  tecnologia: 'O.6',
  financeiro: 'F',
  deducoes: 'D',
  transferencias: 'X',
  emprestimos: 'P',
}

function slugFromCode(code) {
  return code.replace(/\./g, '-').toLowerCase()
}

export function getSubsForGroup(groupId) {
  const meta = GASTO_GROUP_META[groupId] ?? GASTO_GROUP_META.outros
  const geral = {
    slug: 'geral',
    label: meta.label,
    match: (code) => gastoChartGroup(code) === groupId,
  }
  if (groupId === 'mercadorias') return [geral, ...MERCADORIAS_SUBS.filter((s) => s.slug !== 'geral')]
  return [geral]
}

export function findSub(groupId, subSlug) {
  return getSubsForGroup(groupId).find((s) => s.slug === subSlug)
}

 

export function getLeavesForSub(groupId, subSlug) {
  const sub = findSub(groupId, subSlug)
  if (!sub) return []

  if (groupId === 'mercadorias') {
    return [{
      slug: 'geral',
      label: 'Alimentação',
      code: 'C.1',
      match: (code) => !!code?.startsWith('C.1') || gastoChartGroup(code) === 'mercadorias',
    }]
  }

  const parentCode = GROUP_CHART_PARENT[groupId]
  if (parentCode) {
    const subNode = chartOfAccounts.find((c) => slugFromCode(c.code) === subSlug)
    if (subNode) {
      const children = chartOfAccounts.filter((c) => c.parent === subNode.code)
      if (children.length) {
        return children.map((c) => ({
          slug: slugFromCode(c.code),
          label: c.name,
          code: c.code,
          match: (code) => code === c.code || !!code?.startsWith(`${c.code}.`),
        }))
      }
      return [{
        slug: slugFromCode(subNode.code),
        label: subNode.name,
        code: subNode.code,
        match: (code) => sub.match(code),
      }]
    }
  }

  return [{ slug: 'geral', label: sub.label, code: '', match: (code) => sub.match(code) }]
}

export function findLeaf(groupId, subSlug, folhaSlug) {
  return getLeavesForSub(groupId, subSlug).find((l) => l.slug === folhaSlug)
}

export function summarizeTransactions(items) {
  const amount = items.reduce((s, t) => s + Math.abs(t.amount), 0)
  const conc = items.filter((t) => t.recon === 'conciliado').length
  const pend = items.length - conc
  const ia = items.filter((t) => isAiMechanism(t.mechanism)).length
  const conf = items.length ? Math.round(items.reduce((s, t) => s + t.confidence, 0) / items.length) : 0
  return { amount, count: items.length, conc, pend, ia, conf, iaPct: items.length ? Math.round((ia / items.length) * 100) : 0 }
}

export function buildGastoCategoriaRows(saidas) {
  const map = new Map()
  for (const t of saidas) {
    const g = gastoChartGroup(t.category)
    const list = map.get(g) ?? []
    list.push(t)
    map.set(g, list)
  }
  const total = [...map.values()].reduce((s, items) => s + items.reduce((a, t) => a + Math.abs(t.amount), 0), 0)

  const rows = [...map.entries()].map(([id, items]) => {
    const meta = GASTO_GROUP_META[id] ?? GASTO_GROUP_META.outros
    const { amount, count } = summarizeTransactions(items)
    return {
      id,
      label: meta.label,
      amount,
      count,
      pct: total ? (amount / total) * 100 : 0,
      color: '#0B5D4E',
      Icon: meta.Icon,
    }
  })

  return rows
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((r, i) => ({ ...r, color: greenShade(i) }))
}

export function buildIaCategoriaRows(saidas) {
  return buildGastoCategoriaRows(saidas).map((row) => {
    const items = saidas.filter((t) => gastoChartGroup(t.category) === row.id)
    const stats = summarizeTransactions(items)
    return { ...row, ...stats }
  })
}

export function conciliacaoCategoriaHref(groupId) {
  return `/conciliacao/categorias/${groupId}`
}

export function conciliacaoSubHref(groupId, subSlug) {
  return `/conciliacao/categorias/${groupId}/${subSlug}`
}

export function conciliacaoFolhaHref(groupId, subSlug, folhaSlug) {
  return `/conciliacao/categorias/${groupId}/${subSlug}/${folhaSlug}`
}
