import { MONTHS, TODAY } from '@/data/fixtures'
import { companyIds } from './finance'
import type { Account, CashDay, DreNature, Statement, Transaction } from './types'

const round = (v: number) => Math.round(v * 100) / 100

export function dreNature(category: string | null): DreNature {
  if (!category) return 'nao_classificado'
  if (category.startsWith('R')) return 'receita'
  if (category.startsWith('X') || category.startsWith('I')) return 'transferencia'
  if (category.startsWith('P') || category.startsWith('E')) return 'patrimonial'
  if (category.startsWith('D') || category.startsWith('C') || category.startsWith('O') || category.startsWith('F') || category.startsWith('T')) {
    return 'despesa'
  }
  return 'nao_classificado'
}

export function isCashMovement(t: Transaction) {
  return t.recon !== 'interna' && dreNature(t.category) !== 'transferencia'
}

export function isDreEligible(t: Transaction) {
  const nature = dreNature(t.category)
  return nature === 'receita' || nature === 'despesa'
}

export function scopedAccounts(list: Account[], scope: string) {
  const ids = companyIds(scope)
  return list.filter((a) => ids.includes(a.companyId))
}

export function connectedAccounts(list: Account[], scope: string) {
  return scopedAccounts(list, scope).filter((a) => a.status === 'ok' && a.connected !== false)
}

export function unavailableAccounts(list: Account[], scope: string) {
  return scopedAccounts(list, scope).filter((a) => a.status !== 'ok' || a.connected === false || a.balanceUnavailable)
}

export function consolidatedBalance(list: Account[], scope: string) {
  const ok = connectedAccounts(list, scope).filter((a) => !a.balanceUnavailable)
  const missing = unavailableAccounts(list, scope)
  return {
    available: round(ok.reduce((s, a) => s + a.balance, 0)),
    connected: connectedAccounts(list, scope).length,
    total: scopedAccounts(list, scope).length,
    missing,
  }
}

export function inPeriod(t: Transaction, period: string) {
  return t.competence === period || t.date.slice(0, 7) === period
}

export function periodMoves(tx: Transaction[], scope: string, period: string) {
  const ids = new Set(companyIds(scope))
  const rows = tx.filter((t) => ids.has(t.companyId) && inPeriod(t, period))
  const cash = rows.filter(isCashMovement)
  const entradas = round(cash.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0))
  const saidas = round(cash.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0))
  return { rows, cash, entradas, saidas }
}

export function dayMoves(tx: Transaction[], scope: string, day = TODAY) {
  const ids = new Set(companyIds(scope))
  const rows = tx.filter((t) => ids.has(t.companyId) && t.date === day && isCashMovement(t))
  return {
    entradas: round(rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)),
    saidas: round(rows.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)),
    count: rows.length,
  }
}

export function reconPending(tx: Transaction[], scope: string) {
  const ids = new Set(companyIds(scope))
  const rows = tx.filter(
    (t) => ids.has(t.companyId) && (t.recon === 'pendente' || t.recon === 'sugestao' || t.recon === 'divergencia' || t.recon === 'duplicidade'),
  )
  return {
    count: rows.length,
    amount: round(rows.reduce((s, t) => s + Math.abs(t.amount), 0)),
  }
}

export function reconMix(tx: Transaction[], scope: string, period: string) {
  const { rows } = periodMoves(tx, scope, period)
  const buckets = {
    conciliado: 0,
    pendente: 0,
    divergencia: 0,
    duplicidade: 0,
    interna: 0,
    sugestao: 0,
  }
  for (const t of rows) buckets[t.recon] += 1
  return [
    { name: 'Conciliadas', value: buckets.conciliado, color: '#0E7C56' },
    { name: 'Sugestão', value: buckets.sugestao, color: '#1F6F8B' },
    { name: 'Pendentes', value: buckets.pendente, color: '#9A6B08' },
    { name: 'Divergentes', value: buckets.divergencia, color: '#B42318' },
    { name: 'Duplicidade', value: buckets.duplicidade, color: '#8B9B98' },
    { name: 'Internas', value: buckets.interna, color: '#5C6D6A' },
  ].filter((r) => r.value > 0)
}

export function monthlyCashSeries(tx: Transaction[], scope: string) {
  return MONTHS.map((m) => {
    const { entradas, saidas } = periodMoves(tx, scope, m)
    return { label: m.slice(5), entradas, saidas, periodo: m }
  })
}

export function cashObserved(tx: Transaction[], scope: string, list: Account[]): CashDay[] {
  const ids = new Set(companyIds(scope))
  const rows = tx.filter((t) => ids.has(t.companyId) && isCashMovement(t))
  const dates = [...new Set(rows.map((t) => t.date))].sort()
  const { available } = consolidatedBalance(list, scope)
  const days: CashDay[] = dates.map((date) => {
    const day = rows.filter((t) => t.date === date)
    return {
      date,
      entradas: round(day.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)),
      saidas: round(day.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)),
    }
  })
  let closing = available
  for (let i = days.length - 1; i >= 0; i--) {
    const inicial = round(closing - days[i].entradas + days[i].saidas)
    days[i].saldoFinal = round(closing)
    days[i].saldoInicial = inicial
    closing = inicial
  }
  return days
}

export function balanceHistory(list: Account[], tx: Transaction[], scope: string) {
  const { available } = consolidatedBalance(list, scope)
  const ids = new Set(companyIds(scope))
  const scoped = tx.filter((t) => ids.has(t.companyId) && isCashMovement(t)).sort((a, b) => a.date.localeCompare(b.date))
  const dates = [...new Set(scoped.map((t) => t.date))]
  if (!dates.length) return [{ label: TODAY.slice(5), saldo: available, date: TODAY }]

  const netByDate = new Map<string, number>()
  for (const t of scoped) netByDate.set(t.date, (netByDate.get(t.date) ?? 0) + t.amount)

  let cursor = available
  const reverse = [...dates].reverse()
  const points: { label: string; saldo: number; date: string }[] = []
  for (const date of reverse) {
    points.unshift({ label: date.slice(5), saldo: round(cursor), date })
    cursor = round(cursor - (netByDate.get(date) ?? 0))
  }
  return points
}

function creditCat(rows: Transaction[], prefix: string) {
  return round(rows.filter((t) => t.category?.startsWith(prefix) && t.amount > 0).reduce((s, t) => s + t.amount, 0))
}

function debitCat(rows: Transaction[], prefix: string) {
  return round(rows.filter((t) => t.category?.startsWith(prefix) && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0))
}

export function statementFromTransactions(tx: Transaction[], period: string, scope: string): Statement {
  const ids = new Set(companyIds(scope))
  const rows = tx.filter((t) => ids.has(t.companyId) && inPeriod(t, period) && isDreEligible(t))
  const m = {
    vendasSalao: creditCat(rows, 'R.1.1'),
    vendasDelivery: creditCat(rows, 'R.1.2'),
    vendasAtacado: creditCat(rows, 'R.1.3'),
    servicos: creditCat(rows, 'R.2'),
    outras: creditCat(rows, 'R.3'),
    deducoes: debitCat(rows, 'D'),
    mercadorias: debitCat(rows, 'C.1'),
    maoDeObra: debitCat(rows, 'C.2'),
    ocupacao: debitCat(rows, 'O.1'),
    manutencao: debitCat(rows, 'O.2'),
    contas: debitCat(rows, 'O.3'),
    marketing: debitCat(rows, 'O.4'),
    administrativo: debitCat(rows, 'O.5') + debitCat(rows, 'O.6'),
    financeiras: debitCat(rows, 'F'),
    tributos: debitCat(rows, 'T'),
    eliminacao: 0,
  }
  const receitaBruta = m.vendasSalao + m.vendasDelivery + m.vendasAtacado + m.servicos + m.outras
  const receitaLiquida = receitaBruta - m.deducoes
  const custos = m.mercadorias + m.maoDeObra
  const lucroBruto = receitaLiquida - custos
  const despesasOperacionais = m.ocupacao + m.manutencao + m.contas + m.marketing + m.administrativo
  const resultadoOperacional = lucroBruto - despesasOperacionais
  const resultadoAntesTributos = resultadoOperacional - m.financeiras
  const resultadoLiquido = resultadoAntesTributos - m.tributos
  const safe = (n: number, d: number) => (d ? n / d : 0)
  return {
    ...m,
    receitaBruta,
    receitaLiquida,
    custos,
    lucroBruto,
    despesasOperacionais,
    resultadoOperacional,
    resultadoAntesTributos,
    resultadoLiquido,
    despesasTotais: m.deducoes + custos + despesasOperacionais + m.financeiras + m.tributos,
    margemBruta: safe(lucroBruto, receitaLiquida),
    margemOperacional: safe(resultadoOperacional, receitaLiquida),
    margemLiquida: safe(resultadoLiquido, receitaLiquida),
    cmvReceita: safe(m.mercadorias, receitaBruta),
    maoDeObraReceita: safe(m.maoDeObra, receitaBruta),
    opexReceita: safe(despesasOperacionais, receitaBruta),
  }
}

export function classifiedPie(tx: Transaction[], scope: string, period: string, kind: 'despesa' | 'receita') {
  const { rows } = periodMoves(tx, scope, period)
  const eligible = rows.filter((t) => dreNature(t.category) === kind)
  const groups: Record<string, { name: string; value: number; color: string }> = {
    'R.1': { name: 'Receitas operacionais', value: 0, color: '#0B5D4E' },
    'R.2': { name: 'Serviços', value: 0, color: '#0E7C56' },
    'R.3': { name: 'Outras receitas', value: 0, color: '#1F6F8B' },
    'C.2': { name: 'Folha e encargos', value: 0, color: '#0B5D4E' },
    'T': { name: 'Impostos e tributos', value: 0, color: '#B42318' },
    'D': { name: 'Impostos e tributos', value: 0, color: '#B42318' },
    'O.1': { name: 'Aluguel e ocupação', value: 0, color: '#5C6D6A' },
    'C.1': { name: 'Alimentação', value: 0, color: '#117A63' },
    'O.2': { name: 'Fornecedores e serviços', value: 0, color: '#158F72' },
    'O.6': { name: 'Tecnologia e software', value: 0, color: '#1A8F72' },
    'F': { name: 'Tarifas bancárias', value: 0, color: '#8B9B98' },
    'O.4': { name: 'Marketing', value: 0, color: '#21987E' },
    'O.3': { name: 'Outras despesas', value: 0, color: '#2AA388' },
    'O.5': { name: 'Outras despesas', value: 0, color: '#2AA388' },
  }
  for (const t of eligible) {
    const code = t.category!
    const key =
      code.startsWith('R.1') ? 'R.1'
      : code.startsWith('R.2') ? 'R.2'
        : code.startsWith('R.3') ? 'R.3'
          : code.startsWith('C.1') ? 'C.1'
            : code.startsWith('C.2') ? 'C.2'
              : code.startsWith('O.1') ? 'O.1'
                : code.startsWith('O.2') ? 'O.2'
                  : code.startsWith('O.3') ? 'O.3'
                    : code.startsWith('O.4') ? 'O.4'
                      : code.startsWith('O.5') ? 'O.5'
                        : code.startsWith('O.6') ? 'O.6'
                          : code.startsWith('F') ? 'F'
                            : code.startsWith('D') ? 'D'
                              : code.startsWith('T') ? 'T'
                                : ''
    if (!key || !groups[key]) continue
    groups[key].value += Math.abs(t.amount)
  }
  const merged = new Map<string, { name: string; value: number; color: string }>()
  for (const g of Object.values(groups)) {
    if (!g.value) continue
    const prev = merged.get(g.name)
    if (prev) prev.value += g.value
    else merged.set(g.name, { ...g })
  }
  return [...merged.values()].sort((a, b) => b.value - a.value)
}

export function extractCnpj(text: string) {
  const match = text.replace(/\s/g, '').match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/)
  return match ? match[0].replace(/\D/g, '') : ''
}
