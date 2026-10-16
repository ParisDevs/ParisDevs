import { Link } from 'react-router-dom'
import { BarCard, LineCard, PieCard } from '@/components/charts'
import { Badge, Banner, Card, Empty, Kpi, PageHeader } from '@/components/ui'
import { MONTHS, accounts, companies } from '@/data/fixtures'
import { dateShort, money, month, percent, signedPercent } from '@/lib/format'
import { balance, cashProjected, payableIn7, receivableIn7, statementFor } from '@/domain/finance'
import { useApp, useDashboardNumbers, useScopedTx } from '@/state/AppContext'
import type { AlertGroup, Insight } from '@/domain/types'

function delta(current: number, previous: number) {
  if (!previous) return null
  return (current - previous) / Math.abs(previous)
}

function vsHint(change: number | null, prevLabel: string) {
  if (change == null) return undefined
  return `${signedPercent(change * 100)} vs ${prevLabel}`
}

function toneFor(change: number | null, invert = false): 'up' | 'down' | undefined {
  if (change == null || change === 0) return undefined
  const up = invert ? change < 0 : change > 0
  return up ? 'up' : 'down'
}

function alertTone(group: AlertGroup) {
  if (group === 'critico') return 'danger' as const
  if (group === 'atencao') return 'warning' as const
  return 'info' as const
}

function alertLabel(group: AlertGroup) {
  if (group === 'critico') return 'Crítico'
  if (group === 'atencao') return 'Atenção'
  return 'Informação'
}

function insightTo(item: Insight) {
  return `/ia/insights?item=${encodeURIComponent(item.text)}`
}

function SectionHead({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="t-h2">{title}</h2>
      <Link to={to} className="t-label">
        Ver todos
      </Link>
    </div>
  )
}

export function DashboardPage() {
  const { scope, period, schedule, documents } = useApp()
  const { st, alerts, insights } = useDashboardNumbers()
  const tx = useScopedTx()
  const prev = MONTHS[Math.max(0, MONTHS.indexOf(period) - 1)]
  const prevSt = statementFor(prev, scope)
  const company = companies.find((c) => c.id === scope)
  const scopedAccounts = accounts.filter((a) => scope === 'grupo' || a.companyId === scope)
  const scopedDocs = documents.filter((d) => scope === 'grupo' || d.companyId === scope)
  const scopedAlerts = alerts.filter((a) => scope === 'grupo' || !a.companyId || a.companyId === scope)
  const periodLabel = month(period)
  const prevLabel = month(prev)

  const recChange = delta(st.receitaBruta, prevSt.receitaBruta)
  const expChange = delta(st.despesasTotais, prevSt.despesasTotais)
  const resChange = delta(st.resultadoLiquido, prevSt.resultadoLiquido)
  const noMovement = scope !== 'grupo' && st.receitaBruta === 0 && st.despesasTotais === 0

  const series = MONTHS.map((m) => {
    const s = statementFor(m, scope)
    return { label: month(m), receita: s.receitaBruta, despesa: s.despesasTotais, resultado: s.resultadoLiquido }
  })
  const cash = cashProjected(scope, schedule).map((d) => ({ label: dateShort(d.date), saldo: d.saldo ?? 0 }))
  const pie = [
    { name: 'Mercadorias', value: st.mercadorias, color: '#0B5D4E' },
    { name: 'Mão de obra', value: st.maoDeObra, color: '#5C6D6A' },
    { name: 'Operacionais', value: st.despesasOperacionais, color: '#8B9B98' },
    { name: 'Financeiras', value: st.financeiras, color: '#B42318' },
  ]

  const pending = [
    { label: 'Classificações aguardando revisão', n: tx.filter((t) => t.status === 'sugerida' || t.status === 'revisao' || t.status === 'nao_classificada').length, to: '/ia/fila' },
    { label: 'Divergências de conciliação', n: tx.filter((t) => t.recon === 'divergencia' || t.recon === 'pendente').length, to: '/conciliacao/pendencias' },
    { label: 'Bancos sem sincronização', n: scopedAccounts.filter((a) => a.status !== 'ok').length, to: '/configuracoes/open-finance' },
    { label: 'Documentos inconsistentes', n: scopedDocs.filter((d) => d.status === 'inconsistente').length, to: '/documentos?filtro=inconsistente' },
  ]
  const pendingTotal = pending.reduce((s, c) => s + c.n, 0)

  if (!scopedAccounts.length) {
    return <Empty>Conecte um banco para ver os números deste período.</Empty>
  }

  return (
    <div>
      <PageHeader title="Visão do dia">
        {scope === 'grupo' ? (
          <div className="space-y-3">
          </div>
        ) : (
          <div className="space-y-3">
            <Badge tone="neutral">{company?.unit || company?.name}</Badge>
            <Banner tone="info">Números desta empresa no período selecionado.</Banner>
          </div>
        )}
      </PageHeader>

      {noMovement ? <Empty>Esta empresa não tem movimento no período.</Empty> : null}

      <div className="grid grid-cols-1 gap-3 overflow-visible sm:grid-cols-2 xl:grid-cols-3">
        <Kpi
          label="Receita"
          value={money(st.receitaBruta)}
          hint={vsHint(recChange, prevLabel)}
          hintTone={toneFor(recChange)}
          to="/dre"
          tip="Receita bruta do período na empresa ou grupo selecionado."
        />
        <Kpi
          label="Despesas"
          value={money(st.despesasTotais)}
          hint={vsHint(expChange, prevLabel)}
          hintTone={toneFor(expChange, true)}
          to="/dre"
          tip="Despesas totais do período, incluindo custos, operacionais, financeiras e tributos."
        />
        <Kpi
          label="Resultado"
          value={money(st.resultadoLiquido)}
          hint={[vsHint(resChange, prevLabel), `Margem ${percent(st.margemLiquida * 100)}`].filter(Boolean).join(' · ')}
          hintTone={toneFor(resChange)}
          to="/dre"
          tip="Resultado líquido do período: receita menos despesas."
        />
        <Kpi
          label="Saldo"
          value={money(balance(scope))}
          to="/fluxo-de-caixa"
          tip="Saldo atual das contas bancárias na visão selecionada."
        />
        <Kpi
          label="Contas a pagar"
          value={money(payableIn7(schedule, scope))}
          hint="7 dias"
          to="/contas-a-pagar"
          tip="Títulos a pagar com vencimento nos próximos 7 dias."
        />
        <Kpi
          label="Contas a receber"
          value={money(receivableIn7(schedule, scope))}
          hint="7 dias"
          to="/contas-a-receber"
          tip="Títulos a receber com vencimento nos próximos 7 dias."
        />
      </div>

      <div className="mt-6 grid min-w-0 items-stretch gap-3 overflow-visible xl:grid-cols-2">
        <BarCard
          title="Receita x despesa"
          tip="Comparativo mensal de receita, despesa e resultado líquido."
          data={series}
          highlight={periodLabel}
          series={[
            { key: 'receita', name: 'Receita', color: '#0B5D4E' },
            { key: 'despesa', name: 'Despesa', color: '#8B9B98' },
          ]}
          tooltipOnly={[{ key: 'resultado', name: 'Resultado' }]}
        />
        <LineCard
          title="Evolução do resultado"
          tip="Resultado líquido mês a mês no recorte selecionado."
          data={series}
          highlight={periodLabel}
          series={[{ key: 'resultado', name: 'Resultado', color: '#0E7C56' }]}
        />
        <LineCard
          title="Fluxo de caixa"
          tip="Saldo projetado com recebimentos e pagamentos futuros."
          data={cash}
          series={[{ key: 'saldo', name: 'Saldo projetado', color: '#1F6F8B' }]}
        />
        <PieCard
          title="Distribuição das despesas"
          tip="Composição das despesas do período: mercadorias, mão de obra, operacionais e financeiras."
          data={pie}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHead title="Alertas" to="/alertas" />
          {scopedAlerts.slice(0, 4).map((a) => (
            <Link key={a.id} to={a.link || '/alertas'} className="t-body mb-3 flex items-start justify-between gap-3 border-b border-borda pb-3 last:mb-0">
              <span>{a.title}</span>
              <Badge tone={alertTone(a.group)}>{alertLabel(a.group)}</Badge>
            </Link>
          ))}
          {!scopedAlerts.length ? <Empty>Nenhum alerta em aberto.</Empty> : null}
        </Card>

        <Card>
          <SectionHead title="Insights" to="/ia/insights" />
          {insights.map((i) => (
            <Link key={i.text} to={insightTo(i)} className="t-body mb-3 block border-b border-borda pb-3 last:mb-0">
              {i.text}
            </Link>
          ))}
        </Card>

        <Card>
          <SectionHead title="Pendências" to="/pendencias" />
          {pendingTotal === 0 ? (
            <Empty>Nenhuma pendência em aberto.</Empty>
          ) : (
            pending.map((item) => (
              <Link key={item.label} to={item.to} className="t-body mb-3 flex items-center justify-between gap-3 border-b border-borda pb-3 last:mb-0">
                <span>{item.label}</span>
                <span className="num font-semibold">{item.n}</span>
              </Link>
            ))
          )}
        </Card>

        <Card>
          <SectionHead title="Integrações" to="/configuracoes/open-finance" />
          {scopedAccounts.slice(0, 4).map((a) => (
            <Link key={a.id} to="/configuracoes/open-finance" className="t-body mb-3 flex items-start justify-between gap-3 border-b border-borda pb-3 last:mb-0">
              <span>
                {a.bank} {a.number}
              </span>
              <Badge tone={a.status === 'ok' ? 'success' : a.status === 'erro' ? 'danger' : 'warning'}>
                {a.status === 'ok' ? 'Sincronizada' : a.status === 'erro' ? 'Erro de conexão' : 'Sincronização atrasada'}
              </Badge>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  )
}

export function PendenciasPage() {
  const { documents } = useApp()
  const tx = useScopedTx()
  const cards = [
    { label: 'Classificações aguardando revisão', n: tx.filter((t) => t.status === 'sugerida' || t.status === 'revisao' || t.status === 'nao_classificada').length, to: '/ia/fila' },
    { label: 'Divergências de conciliação', n: tx.filter((t) => t.recon === 'divergencia' || t.recon === 'pendente').length, to: '/conciliacao/pendencias' },
    { label: 'Bancos sem sincronização', n: accounts.filter((a) => a.status !== 'ok').length, to: '/configuracoes/open-finance' },
    { label: 'Documentos inconsistentes', n: documents.filter((d) => d.status === 'inconsistente').length, to: '/documentos?filtro=inconsistente' },
  ]
  const total = cards.reduce((s, c) => s + c.n, 0)
  return (
    <div>
      <PageHeader title="Pendências" />
      {total === 0 ? (
        <Empty>Nenhuma pendência em aberto.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => (
            <Kpi key={c.label} label={c.label} value={String(c.n)} to={c.to} />
          ))}
        </div>
      )}
    </div>
  )
}
