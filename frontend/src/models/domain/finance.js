import {
  MONTHS,
  TODAY,
  accounts,
  chartOfAccounts,
  companies,
  intercompanyMonthly,
  maintenanceSpike,
  monthlyBase,
  seasonality,
} from '@/models/fixtures'
import { money, month as monthFmt, percent } from '@/lib/format'













const round = (v) => Math.round(v * 100) / 100

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function noise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function lastMonth() {
  return MONTHS[MONTHS.length - 1]
}

export function prevMonth() {
  return MONTHS[MONTHS.length - 2]
}

export function companyIds(scope) {
  return scope === 'grupo' ? companies.map((c) => c.id) : [scope]
}

export function companyOf(id) {
  return companies.find((c) => c.id === id)
}

export function accountOf(id, list = accounts) {
  return list.find((a) => a.id === id)
}

export function categoryOf(code) {
  return chartOfAccounts.find((c) => c.code === code)
}

export function categoryLabel(code) {
  if (!code) return '—'
  if (!categoryOf(code)) return String(code)
  const parts = []
  let node = categoryOf(code)
  while (node) {
    parts.unshift(node.name)
    node = node.parent ? categoryOf(node.parent) : undefined
  }
  if (parts.length > 1) parts.shift()
  return parts.join(' > ') || String(code)
}

export function isAiMechanism(m) {
  return m !== 'manual'
}

/** Nível intermediário do plano para agrupar conciliação (ex.: C.1.2, O.3). */
export function categoryBucket(code) {
  if (!code) return 'sem_categoria'
  const parts = code.split('.')
  if (parts.length >= 3) return parts.slice(0, 3).join('.')
  return code
}

const LABEL_TO_GROUP = {
  alimentos: 'mercadorias',
  'folha e encargos': 'folha',
  'aluguel e ocupação': 'ocupacao',
  energia: 'contas',
  'tarifas bancárias': 'financeiro',
  'vendas no salão': 'receita',
  'vendas delivery': 'receita',
  serviços: 'receita',
  'aplicações financeiras': 'transferencias',
}

function normLabel(value) {
  return String(value ?? '').trim().toLowerCase()
}

function gastoChartGroupByCode(code) {
  if (!code) return 'outros'
  if (code.startsWith('C.1')) return 'mercadorias'
  if (code === 'C.2' || code.startsWith('C.2.')) return 'folha'
  if (code.startsWith('O.1')) return 'ocupacao'
  if (code.startsWith('O.2')) return 'manutencao'
  if (code.startsWith('O.3')) return 'contas'
  if (code.startsWith('O.4')) return 'marketing'
  if (code.startsWith('O.5')) return 'transporte'
  if (code.startsWith('O.6')) return 'tecnologia'
  if (code.startsWith('F')) return 'financeiro'
  if (code.startsWith('D') || code.startsWith('T')) return 'deducoes'
  if (code.startsWith('X') || code.startsWith('I')) return 'transferencias'
  if (code.startsWith('P') || code.startsWith('E')) return 'emprestimos'
  return 'outros'
}

function groupFromCoAName(label) {
  const node = chartOfAccounts.find((c) => normLabel(c.name) === normLabel(label))
  if (!node) return null
  return gastoChartGroupByCode(node.code)
}

/** Agrupa saídas para o gráfico de barras da conciliação (categorias generalistas). Aceita código C.1 ou nome do seed. */
export function gastoChartGroup(code) {
  if (!code) return 'outros'
  const labeled = LABEL_TO_GROUP[normLabel(code)]
  if (labeled) return labeled === 'receita' ? 'outros' : labeled
  const fromName = groupFromCoAName(code)
  if (fromName && fromName !== 'outros') return fromName
  return gastoChartGroupByCode(code)
}

export function isKnownCategory(code) {
  if (!String(code ?? '').trim()) return false
  if (LABEL_TO_GROUP[normLabel(code)]) return true
  if (categoryOf(code)) return true
  if (chartOfAccounts.some((c) => normLabel(c.name) === normLabel(code))) return true
  return gastoChartGroupByCode(code) !== 'outros'
}

export function deriveRecon(category) {
  return isKnownCategory(category) ? 'conciliado' : 'pendente'
}

export const SEED_CATEGORIES = [
  'Vendas no salão',
  'Vendas delivery',
  'Serviços',
  'Aplicações financeiras',
  'Alimentos',
  'Folha e encargos',
  'Aluguel e ocupação',
  'Energia',
  'Tarifas bancárias',
]

export function categoriaCatalogo() {
  const folhas = chartOfAccounts
    .filter((c) => !chartOfAccounts.some((ch) => ch.parent === c.code))
    .map((c) => c.name)
  return [...new Set([...SEED_CATEGORIES, ...folhas])].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function saidaMercadoriasHierarchy(code) {
  if (!code?.startsWith('C.1')) {
    return { categoria: '—', subcategoria: '—', subsub: '—' }
  }
  const leaf = categoryOf(code)
  if (!leaf) return { categoria: '—', subcategoria: '—', subsub: '—' }
  if (code.startsWith('C.1.2')) {
    return {
      categoria: 'Alimentos',
      subcategoria: 'Bebidas',
      subsub: code === 'C.1.2' ? '—' : leaf.name,
    }
  }
  if (code.startsWith('C.1.1.1')) {
    return { categoria: 'Alimentos', subcategoria: 'Hortifruti', subsub: code === 'C.1.1.1' ? '—' : leaf.name }
  }
  if (code.startsWith('C.1.1.2')) {
    return { categoria: 'Alimentos', subcategoria: 'Açougue', subsub: code === 'C.1.1.2' ? '—' : leaf.name }
  }
  if (code.startsWith('C.1.1.3')) {
    return { categoria: 'Alimentos', subcategoria: 'Padaria', subsub: code === 'C.1.1.3' ? '—' : leaf.name }
  }
  if (code.startsWith('C.1.1')) {
    return {
      categoria: 'Alimentos',
      subcategoria: 'Alimentos',
      subsub: code === 'C.1.1' ? '—' : leaf.name,
    }
  }
  const bucket = categoryOf(categoryBucket(code))
  return {
    categoria: 'Alimentos',
    subcategoria: bucket?.name ?? 'Mercadorias',
    subsub: leaf.name,
  }
}

export function accountLabel(id, list = accounts) {
  const a = accountOf(id, list)
  return a ? `${a.bank} · ${a.number}` : id
}

export function classStatus(t, cfg) {
  if (!t.category) return 'nao_classificada'
  if (t.confidence >= cfg.thresholds.auto) return 'automatica'
  if (t.confidence >= cfg.thresholds.suggest) return 'sugerida'
  return 'revisao'
}

export function monthly(companyId, month) {
  const b = monthlyBase[companyId]
  const s = seasonality[month] ?? 1
  const seed = hash(companyId + month)
  const f = 1 + (noise(seed) - 0.5) * 0.06
  const R = b.receita * s * f
  const spike = maintenanceSpike[companyId]?.[month] ?? 1
  const vendas = R * (1 - b.servicos - b.outras)
  const m = {
    vendasSalao: companyId === 'c3' ? 0 : vendas * (1 - b.delivery),
    vendasDelivery: companyId === 'c3' ? 0 : vendas * b.delivery,
    vendasAtacado: companyId === 'c3' ? vendas : 0,
    servicos: R * b.servicos,
    outras: R * b.outras,
    deducoes: R * b.deducoes,
    mercadorias: R * b.mercadorias * (1 + (noise(seed + 1) - 0.5) * 0.04),
    maoDeObra: b.receita * b.maoDeObra * (1 + (noise(seed + 2) - 0.5) * 0.02),
    ocupacao: b.receita * b.ocupacao,
    manutencao: R * b.manutencao * spike * (1 + (noise(seed + 3) - 0.5) * 0.05),
    contas: R * b.contas,
    marketing: R * b.marketing,
    administrativo: b.receita * b.administrativo,
    financeiras: R * b.financeiras,
    tributos: R * b.tributos,
    eliminacao: 0,
  }
  ;(Object.keys(m) ).forEach((k) => {
    m[k] = round(m[k])
  })
  return m
}

export function monthlyScope(month, scope) {
  const ids = companyIds(scope)
  const sum = monthly(ids[0], month)
  ids.slice(1).forEach((id) => {
    const m = monthly(id, month)
    ;(Object.keys(sum) ).forEach((k) => {
      sum[k] += m[k]
    })
  })
  if (scope === 'grupo') {
    sum.eliminacao = intercompanyMonthly
    sum.vendasAtacado -= intercompanyMonthly
    sum.mercadorias -= intercompanyMonthly
  }
  return sum
}

export function statement(m) {
  const receitaBruta = m.vendasSalao + m.vendasDelivery + m.vendasAtacado + m.servicos + m.outras
  const receitaLiquida = receitaBruta - m.deducoes
  const custos = m.mercadorias + m.maoDeObra
  const lucroBruto = receitaLiquida - custos
  const despesasOperacionais = m.ocupacao + m.manutencao + m.contas + m.marketing + m.administrativo
  const resultadoOperacional = lucroBruto - despesasOperacionais
  const resultadoAntesTributos = resultadoOperacional - m.financeiras
  const resultadoLiquido = resultadoAntesTributos - m.tributos
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
    margemBruta: lucroBruto / receitaLiquida,
    margemOperacional: resultadoOperacional / receitaLiquida,
    margemLiquida: resultadoLiquido / receitaLiquida,
    cmvReceita: m.mercadorias / receitaBruta,
    maoDeObraReceita: m.maoDeObra / receitaBruta,
    opexReceita: despesasOperacionais / receitaBruta,
  }
}

export function statementFor(month, scope) {
  return statement(monthlyScope(month, scope))
}

export function balance(scope, list = accounts) {
  const ids = companyIds(scope)
  return list.filter((a) => ids.includes(a.companyId) && a.status === 'ok' && !a.balanceUnavailable).reduce((s, a) => s + a.balance, 0)
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function cashRealized(scope, list = accounts) {
  const ids = companyIds(scope)
  const days = []
  for (let d = '2026-09-01'; d <= TODAY; d = addDays(d, 1)) days.push(d)
  const rows = days.map((date) => ({ date, entradas: 0, saidas: 0 }))
  ids.forEach((id) => {
    const b = monthlyBase[id]
    rows.forEach((row) => {
      const dow = new Date(`${row.date}T12:00:00`).getDay()
      const seed = hash(id + row.date)
      const weekend = dow === 0 || dow === 6
      let entradas = (b.receita / 30) * (0.55 + noise(seed) * 0.9)
      let saidas = ((b.receita * 0.68) / 30) * (0.4 + noise(seed + 7) * 0.9)
      if (weekend) {
        entradas *= 0.35
        saidas *= 0.2
      }
      const day = Number(row.date.slice(8))
      if (day === 4 || day === 5) saidas += (b.receita * (b.maoDeObra + b.ocupacao)) / 2
      if (day === 20) saidas += b.receita * b.deducoes
      row.entradas += round(entradas)
      row.saidas += round(saidas)
    })
  })
  let closing = balance(scope, list)
  for (let i = rows.length - 1; i >= 0; i--) {
    const inicial = round(closing - rows[i].entradas + rows[i].saidas)
    rows[i].saldoFinal = round(closing)
    rows[i].saldoInicial = inicial
    closing = inicial
  }
  return rows
}

export function cashProjected(scope, items, horizon = 30, list = accounts) {
  const ids = new Set(companyIds(scope))
  const scoped = items.filter((s) => ids.has(s.companyId))
  let saldo = balance(scope, list)
  const rows = []
  for (let i = 1; i <= horizon; i++) {
    const date = addDays(TODAY, i)
    const dayItems = scoped.filter((s) => s.date === date)
    const entradas = dayItems.filter((s) => s.amount > 0).reduce((s, x) => s + x.amount, 0)
    const saidas = -dayItems.filter((s) => s.amount < 0).reduce((s, x) => s + x.amount, 0)
    saldo = round(saldo + entradas - saidas)
    rows.push({ date, entradas, saidas, saldo, items: dayItems })
  }
  return rows
}

export function payableIn7(items, scope) {
  const ids = new Set(companyIds(scope))
  const limit = addDays(TODAY, 7)
  return items
    .filter((s) => ids.has(s.companyId) && s.kind === 'pagar' && s.date <= limit && s.date >= TODAY)
    .reduce((s, x) => s + Math.abs(x.amount), 0)
}

export function receivableIn7(items, scope) {
  const ids = new Set(companyIds(scope))
  const limit = addDays(TODAY, 7)
  return items
    .filter((s) => ids.has(s.companyId) && s.kind === 'receber' && s.date <= limit && s.date >= TODAY)
    .reduce((s, x) => s + x.amount, 0)
}

export function ruleChecks(cfg, month = lastMonth()) {
  return companies.flatMap((c) =>
    cfg.financialRules
      .filter((r) => r.active && r.segment === c.segment)
      .map((rule) => {
        const st = statement(monthly(c.id, month))
        const ratio = (st.mercadorias + st.maoDeObra) / st.receitaBruta
        return { company: c, rule, month, ratio, ok: ratio * 100 <= rule.limit }
      }),
  )
}

export function buildAlerts(
  cfg,
  tx,
  items,
  accountList = accounts,
) {
  const list = []
  const lm = lastMonth()
  const pm = prevMonth()

  companies.forEach((c) => {
    const proj = cashProjected(c.id, items, 30, accountList)
    const negative = proj.filter((d) => (d.saldo ?? 0) < 0)
    if (negative.length) {
      const min = negative.reduce((a, b) => ((b.saldo ?? 0) < (a.saldo ?? 0) ? b : a))
      list.push({
        id: `cash-${c.id}`,
        kind: 'financeiro',
        group: 'critico',
        companyId: c.id,
        title: `Caixa projetado negativo — ${c.code}`,
        detail: `O saldo projetado chega a ${money(min.saldo ?? 0)} em ${min.date}. São ${negative.length} dia(s) negativos nos próximos 30 dias.`,
        link: '/fluxo-de-caixa?aba=projetado',
      })
    }
  })

  ruleChecks(cfg, lm)
    .filter((r) => !r.ok)
    .forEach((r) => {
      list.push({
        id: `rule-${r.rule.id}-${r.company.id}`,
        kind: 'financeiro',
        group: 'atencao',
        companyId: r.company.id,
        title: `Mercadorias + mão de obra acima do limite — ${r.company.code}`,
        detail: `${percent(r.ratio * 100)} da receita em ${monthFmt(lm)}. O limite configurado para ${r.rule.segmentLabel.toLowerCase()} é ${r.rule.limit}%.`,
        link: '/dre',
      })
    })

  companies.forEach((c) => {
    const cur = monthly(c.id, lm).manutencao
    const prev = monthly(c.id, pm).manutencao
    const change = (cur - prev) / prev
    if (change * 100 >= cfg.expenseIncreaseAlert) {
      list.push({
        id: `exp-${c.id}`,
        kind: 'financeiro',
        group: 'atencao',
        companyId: c.id,
        title: `Manutenção subiu ${percent(change * 100, 0)} — ${c.code}`,
        detail: `Despesas com manutenção foram de ${money(prev)} em ${monthFmt(pm)} para ${money(cur)} em ${monthFmt(lm)}.`,
        link: '/analytics?aba=indicadores',
      })
    }
  })

  tx.filter((t) => t.recon === 'divergencia').forEach((t) => {
    list.push({
      id: `div-${t.id}`,
      kind: 'conciliacao',
      group: 'critico',
      companyId: t.companyId,
      title: `Divergência na conciliação — ${t.counterparty || t.description}`,
      detail: `${money(t.amount)} em ${t.date} (${accountLabel(t.accountId)}).`,
      link: `/conciliacao/pendencias?estado=divergencia`,
    })
  })

  tx.filter((t) => t.recon === 'duplicidade').forEach((t) => {
    list.push({
      id: `dup-${t.id}`,
      kind: 'conciliacao',
      group: 'critico',
      companyId: t.companyId,
      title: `Possível pagamento em duplicidade — ${t.counterparty}`,
      detail: `${t.document} aparece duas vezes no valor de ${money(t.amount)}.`,
      link: `/extratos/${t.id}`,
    })
  })

  const unclassified = tx.filter((t) => !t.category)
  if (unclassified.length) {
    list.push({
      id: 'uncl',
      kind: 'classificacao',
      group: 'atencao',
      companyId: null,
      title: `${unclassified.length} transação(ões) sem classificação`,
      detail: 'Lançamentos sem categoria não entram na DRE gerencial até serem classificados.',
      link: '/ia/fila',
    })
  }

  const review = tx.filter((t) => classStatus(t, cfg) === 'revisao')
  if (review.length) {
    list.push({
      id: 'rev-ai',
      kind: 'classificacao',
      group: 'atencao',
      companyId: null,
      title: `${review.length} classificação(ões) com confiança abaixo de ${cfg.thresholds.suggest}%`,
      detail: 'Esses lançamentos exigem revisão humana antes de compor os demonstrativos.',
      link: '/ia/fila',
    })
  }

  accountList.forEach((a) => {
    if (a.status === 'ok' && a.connected !== false) return
    const c = companyOf(a.companyId)
    list.push({
      id: `sync-${a.id}`,
      kind: 'integracao',
      group: a.status === 'erro' ? 'critico' : 'informacao',
      companyId: a.companyId,
      title: `${a.status === 'erro' ? 'Falha de conexão' : a.connected === false ? 'Instituição desconectada' : 'Sincronização atrasada'} — ${a.bank} ${a.number}`,
      detail: `${a.note ? `${a.note} ` : ''}Última sincronização em ${a.lastSync.slice(0, 16).replace('T', ' ')} (${c?.code}).`,
      link: '/conexoes',
    })
  })

  return list
}

export function buildInsights(scope, items) {
  const ids = companyIds(scope)
  const out = []
  const lm = lastMonth()
  const pm = prevMonth()

  ids.forEach((id) => {
    const c = companyOf(id)
    const cur = monthly(id, lm).manutencao
    const prev = monthly(id, pm).manutencao
    const ch = (cur - prev) / prev
    if (Math.abs(ch) >= 0.15 && c) {
      out.push({
        tone: ch > 0 ? 'warning' : 'success',
        text: `As despesas com manutenção do ${c.code} ${ch > 0 ? 'aumentaram' : 'caíram'} ${percent(Math.abs(ch) * 100, 0)} em relação a ${monthFmt(pm)}.`,
      })
    }
    const neg = cashProjected(id, items).filter((d) => (d.saldo ?? 0) < 0)
    if (neg.length && c) {
      out.push({
        tone: 'danger',
        text: `O ${c.code} apresenta previsão de caixa negativo a partir de ${neg[0].date}.`,
      })
    }
  })

  const rc = statementFor(lm, scope).receitaBruta
  const rp = statementFor(pm, scope).receitaBruta
  const rch = (rc - rp) / rp
  out.push({
    tone: rch >= 0 ? 'success' : 'info',
    text: `A receita ${scope === 'grupo' ? 'do grupo' : `do ${companyOf(scope)?.code}`} ${rch >= 0 ? 'cresceu' : 'caiu'} ${percent(Math.abs(rch) * 100)} em ${monthFmt(lm)} frente a ${monthFmt(pm)}.`,
  })
  return out
}

export function inScope(items, scope) {
  if (scope === 'grupo') return items
  return items.filter((i) => !i.companyId || i.companyId === scope)
}
