import { deriveRecon } from '@/models/domain/finance'

const PIE_COLORS = ['#0B5D4E', '#0E7C56', '#1F6F8B', '#B42318', '#5C6D6A', '#117A63', '#8B9B98', '#21987E']

const round = (v) => Math.round(v * 100) / 100

export function mapConta(dto) {
  const saldo = dto?.saldo
  const hasSaldo = saldo !== undefined && saldo !== null && saldo !== ''
  const ativo = dto?.ativo === true
  return {
    id: String(dto?.idContaBancaria ?? ''),
    bank: dto?.nomeInstituicao || 'Instituição',
    number: dto?.numeroConta || '',
    balance: hasSaldo ? Number(saldo) : 0,
    balanceUnavailable: !hasSaldo,
    connected: ativo,
    status: ativo ? 'ok' : 'erro',
    companyId: dto?.filial?.idFilial ?? null,
  }
}

export function mapOperacao(dto, contasById = {}) {
  const tipo = dto?.tipoOperacao
  const raw = Number(dto?.valorOperacao ?? 0)
  const amount = Math.abs(Number.isFinite(raw) ? raw : 0)
  const iso = dto?.dtHora ? String(dto.dtHora) : ''
  const date = iso.slice(0, 10)
  const accountId = dto?.contaBancariaDto?.idContaBancaria != null
    ? String(dto.contaBancariaDto.idContaBancaria)
    : ''
  const conta = contasById[accountId]
  return {
    id: String(dto?.idOperacao ?? ''),
    accountId,
    tipo,
    amount,
    category: String(dto?.categoria ?? '').trim(),
    razaoSocial: String(dto?.razaoSocial ?? '').trim(),
    instituicao: dto?.contaBancariaDto?.nomeInstituicao || conta?.bank || '',
    numeroConta: dto?.contaBancariaDto?.numeroConta || conta?.number || '',
    companyId: conta?.companyId ?? null,
    dtHora: iso,
    date,
    competence: date.slice(0, 7),
    entrada: tipo === 'RECEBIMENTO',
    saida: tipo === 'PAGAMENTO',
  }
}

export function mapConciliacao(dto, contasById = {}) {
  const base = mapOperacao(dto, contasById)
  return {
    ...base,
    description: base.razaoSocial,
    counterparty: base.razaoSocial,
    recon: deriveRecon(base.category),
    mechanism: 'manual',
    confidence: 0,
    document: '',
  }
}

export function payloadClassificacao(op, categoria) {
  const dtHora = op.dtHora ? (op.dtHora.length === 16 ? `${op.dtHora}:00` : String(op.dtHora).slice(0, 19)) : null
  return {
    valorOperacao: op.amount,
    tipoOperacao: op.tipo,
    razaoSocial: op.razaoSocial,
    categoria,
    dtHora,
    idContaBancaria: Number(op.accountId),
  }
}

export function inScope(companyId, scope) {
  if (scope === 'grupo' || scope == null || scope === '') return true
  return Number(companyId) === Number(scope)
}

export function scopedAccounts(list, scope) {
  return list.filter((a) => inScope(a.companyId, scope))
}

export function filterAccounts(list, bank, accountId) {
  return list.filter((a) => (!bank || a.bank === bank) && (!accountId || a.id === accountId))
}

export function consolidatedBalance(list) {
  const connected = list.filter((a) => a.connected && a.status === 'ok')
  const withSaldo = connected.filter((a) => !a.balanceUnavailable)
  const missing = list.filter((a) => !a.connected || a.balanceUnavailable)
  return {
    available: round(withSaldo.reduce((s, a) => s + Number(a.balance || 0), 0)),
    connected: connected.length,
    total: list.length,
    missing,
  }
}

function inRange(date, inicio, fim) {
  return date >= inicio && date < fim
}

export function periodMoves(ops, inicio, fim) {
  const rows = ops.filter((t) => t.date && inRange(t.date, inicio, fim))
  const entradas = round(rows.filter((t) => t.entrada).reduce((s, t) => s + t.amount, 0))
  const saidas = round(rows.filter((t) => t.saida).reduce((s, t) => s + t.amount, 0))
  return { rows, entradas, saidas, resultado: round(entradas - saidas) }
}

export function dayMoves(ops, day) {
  const rows = ops.filter((t) => t.date === day)
  return {
    entradas: round(rows.filter((t) => t.entrada).reduce((s, t) => s + t.amount, 0)),
    saidas: round(rows.filter((t) => t.saida).reduce((s, t) => s + t.amount, 0)),
    count: rows.length,
  }
}

export function monthlyCashSeries(ops, months, formatLabel) {
  return months.map((ym) => {
    const inicio = `${ym}-01`
    const [ano, mes] = ym.split('-').map(Number)
    const next = new Date(ano, mes, 1)
    const fim = [
      next.getFullYear(),
      String(next.getMonth() + 1).padStart(2, '0'),
      '01',
    ].join('-')
    const { entradas, saidas } = periodMoves(ops, inicio, fim)
    return { label: formatLabel(ym), entradas, saidas, periodo: ym }
  })
}

export function balanceHistory(accounts, ops, today) {
  const { available } = consolidatedBalance(accounts)
  const dated = ops.filter((t) => t.date).sort((a, b) => a.date.localeCompare(b.date))
  const dates = [...new Set(dated.map((t) => t.date))]
  if (!dates.length) {
    return [{ label: today.slice(5), saldo: available, date: today }]
  }

  const netByDate = new Map()
  for (const t of dated) {
    const signed = t.entrada ? t.amount : t.saida ? -t.amount : 0
    netByDate.set(t.date, (netByDate.get(t.date) ?? 0) + signed)
  }

  let cursor = available
  const points = []
  for (const date of [...dates].reverse()) {
    points.unshift({ label: date.slice(5), saldo: round(cursor), date })
    cursor = round(cursor - (netByDate.get(date) ?? 0))
  }
  return points
}

export function categoryPie(ops, inicio, fim, side) {
  const rows = ops.filter(
    (t) => t.date && inRange(t.date, inicio, fim) && t.category && (side === 'saida' ? t.saida : t.entrada),
  )
  const grouped = new Map()
  for (const t of rows) {
    grouped.set(t.category, (grouped.get(t.category) ?? 0) + t.amount)
  }
  return [...grouped.entries()]
    .map(([name, value], i) => ({
      name,
      value: round(value),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
}
