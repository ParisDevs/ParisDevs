
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  FileText,
  Hourglass,
  Landmark,
  Link2,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { BarCard, LineCard, PieCard } from '@/components/charts'
import { Badge, Button, Card, Empty, FilterCard, Kpi, PageHeader } from '@/components/ui'
import { MONTHS, TODAY } from '@/data/fixtures'
import { BankLogo } from '@/components/BankLogo'
import {
  balanceHistory,
  classifiedPie,
  consolidatedBalance,
  statementFromTransactions,
  dayMoves,
  monthlyCashSeries,
  periodMoves,
  reconMix,
  reconPending,
  scopedAccounts,
} from '@/domain/banking'
import { dateTimeMark, month, money, signedPercent } from '@/lib/format'
import { useApp, useDashboardNumbers, useScopedTx } from '@/state/AppContext'
import type { AlertGroup, Insight } from '@/domain/types'
import { buscarKpisDashboard } from '../../components/services/dashboardService'
import type { DashboardKpi } from '@/types/DashboardKpi'

function delta(current: number, previous: number) {
  if (!previous) return null
  return (current - previous) / Math.abs(previous)
}

function vsHint(change: number | null, prevLabel: string) {
  if (change == null) return undefined
  return `${signedPercent(change * 100)} vs ${prevLabel}`
}

function toneFor(
  change: number | null,
  invert = false,
): 'up' | 'down' | undefined {
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
  const { scope, usuario, period, documents, accounts, transactions } = useApp()
  const { alerts, insights } = useDashboardNumbers()
  const tx = useScopedTx()

  const [bank, setBank] = useState('')
  const [accountId, setAccountId] = useState('')

  // Dados dos quatro KPIs vindos do backend
  const [kpisApi, setKpisApi] = useState<DashboardKpi | null>(null)
  const [carregandoKpis, setCarregandoKpis] = useState(true)
  const [erroKpis, setErroKpis] = useState(false)

  // Consulta a API quando o período ou a filial mudar
  useEffect(() => {
    let ativo = true

    async function carregarKpis() {
      try {
        setCarregandoKpis(true)
        setErroKpis(false)

        const [ano, mes] = period.split('-').map(Number)

        if (!ano || !mes || mes < 1 || mes > 12) {
          throw new Error('O período deve estar no formato YYYY-MM.')
        }

        const inicio = `${period}-01`

        // O backend considera a data final exclusiva.
        const proximoMes = new Date(ano, mes, 1)

        const fim = [
          proximoMes.getFullYear(),
          String(proximoMes.getMonth() + 1).padStart(2, '0'),
          '01',
        ].join('-')

        const idFilial =
          scope === 'grupo' ? undefined : Number(scope)

          console.log('Scope atual:', scope)
          console.log('ID da filial enviado:', idFilial)

        if (
          scope !== 'grupo' &&
          (!Number.isInteger(idFilial) || idFilial! <= 0)
        ) {
          throw new Error('O identificador da filial é inválido.')
        }

        const dados = await buscarKpisDashboard(
          inicio,
          fim,
          idFilial,
        )

        if (ativo) {
          setKpisApi(dados)
        }
      } catch (erro) {
        console.error('Erro ao carregar os KPIs do dashboard:', erro)

        if (ativo) {
          setErroKpis(true)
        }
      } finally {
        if (ativo) {
          setCarregandoKpis(false)
        }
      }
    }

    carregarKpis()

    return () => {
      ativo = false
    }
  }, [period, scope])

  const allScoped = scopedAccounts(accounts, scope)
  const banks = [...new Set(allScoped.map((a) => a.bank))]

  const filteredAccounts = allScoped.filter(
    (a) =>
      (!bank || a.bank === bank) &&
      (!accountId || a.id === accountId),
  )

  const filteredTx = useMemo(
    () =>
      transactions.filter((t) =>
        filteredAccounts.some((a) => a.id === t.accountId),
      ),
    [transactions, filteredAccounts],
  )

  const periodLabel = month(period)

  // Indicadores locais mantidos para os demais componentes do dashboard
  const cons = consolidatedBalance(
    filteredAccounts.length ? filteredAccounts : allScoped,
    scope,
  )

  const moves = periodMoves(filteredTx, scope, period)
  const today = dayMoves(filteredTx, scope, TODAY)
  const pendingRecon = reconPending(filteredTx, scope)

  const prevPeriod =
    MONTHS[Math.max(0, MONTHS.indexOf(period) - 1)] || period

  const prevMoves = periodMoves(filteredTx, scope, prevPeriod)
  const dreSt = statementFromTransactions(filteredTx, period, scope)

  const cashSeries = monthlyCashSeries(filteredTx, scope).map((row) => ({
    ...row,
    label: month(`2026-${row.label}`),
  }))

  const saldoSeries = balanceHistory(
    filteredAccounts.length ? filteredAccounts : allScoped,
    filteredTx,
    scope,
  )

  const expensePie = classifiedPie(
    filteredTx,
    scope,
    period,
    'despesa',
  )

  const revenuePie = classifiedPie(
    filteredTx,
    scope,
    period,
    'receita',
  )

  const reconPie = reconMix(filteredTx, scope, period)

  const scopedDocs = documents.filter(
    (d) => scope === 'grupo' || d.companyId === scope,
  )

  const scopedAlerts = alerts.filter(
    (a) => scope === 'grupo' || !a.companyId || a.companyId === scope,
  )

  const firstName = usuario?.nome?.split(' ')[0] ?? ''

  const lastSync = allScoped.reduce(
    (max, a) => (a.lastSync > max ? a.lastSync : max),
    '',
  )

  const syncedPool = filteredAccounts.length
    ? filteredAccounts
    : allScoped

  const syncedAccounts = (
    ['Itaú', 'XP', 'BTG Pactual'] as const
  )
    .map((name) =>
      syncedPool.find(
        (a) =>
          a.bank === name &&
          a.status === 'ok' &&
          a.connected !== false &&
          !a.balanceUnavailable,
      ),
    )
    .filter(
      (a): a is NonNullable<typeof a> => Boolean(a),
    )

  const recChange = delta(moves.entradas, prevMoves.entradas)
  const expChange = delta(moves.saidas, prevMoves.saidas)

  const pending = [
    {
      label: 'Classificações aguardando revisão',
      n: tx.filter(
        (t) =>
          t.status === 'sugerida' ||
          t.status === 'revisao' ||
          t.status === 'nao_classificada',
      ).length,
      to: '/ia/fila',
    },
    {
      label: 'Pendências de conciliação',
      n: pendingRecon.count,
      to: '/conciliacao/pendencias',
    },
    {
      label: 'Bancos sem sincronização',
      n: cons.missing.length,
      to: '/conexoes',
    },
    {
      label: 'Documentos inconsistentes',
      n: scopedDocs.filter((d) => d.status === 'inconsistente').length,
      to: '/documentos?filtro=inconsistente',
    },
  ]

  const pendingTotal = pending.reduce((s, c) => s + c.n, 0)

  // Mantém a tela de boas-vindas caso não existam contas locais
  // e a consulta inicial ao backend já tenha terminado.
  if (!allScoped.length && !carregandoKpis && !kpisApi) {
    return (
      <div>
        <PageHeader
          kicker="Visão financeira"
          title={
            firstName
              ? `Olá, ${usuario?.nome}!`
              : 'Visão financeira'
          }
          subtitle="Conecte uma instituição ou importe um extrato para ver os indicadores."
        />

        <Empty
          action={
            <>
              <Link to="/conexoes">
                <Button>Conectar instituição</Button>
              </Link>
              <Link to="/extratos/importar">
                <Button variant="secondary">Importar extrato</Button>
              </Link>
            </>
          }
        >
          Nenhuma conta bancária neste recorte.
        </Empty>
      </div>
    )
  }

  // Mostra os dados financeiros do backend quando disponíveis.
  // Os outros indicadores continuam usando os dados locais existentes.
  const valorKpi = (valor: number | undefined) => {
    if (carregandoKpis) return 'Carregando...'
    if (erroKpis || valor === undefined || valor === null) {
      return 'Indisponível'
    }
    return money(valor)
  }

  return (
    <div>
      <PageHeader
        kicker="Visão financeira"
        title={`Olá, ${usuario?.nome}!`}
        subtitle="Saldos e movimentações bancárias do período. O resultado da DRE usa só lançamentos classificados e exclui transferências."
        meta={
          lastSync ? (
            <div className="flex items-start justify-end gap-2">
              <CalendarDays
                size={15}
                className="mt-0.5 shrink-0 text-faint"
              />
              <div className="whitespace-nowrap">
                <span className="block text-[11px] font-semibold tracking-[0.06em] text-faint uppercase">
                  Última atualização
                </span>
                <span className="mt-0.5 block text-texto-secundario">
                  {dateTimeMark(lastSync)}
                </span>
              </div>
            </div>
          ) : null
        }
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          <FilterCard
            icon={Landmark}
            value={bank}
            onChange={(e) => {
              setBank(e.target.value)
              setAccountId('')
            }}
            aria-label="Instituição"
          >
            <option value="">Todas as instituições</option>
            {banks.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </FilterCard>

          <FilterCard
            icon={FileText}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            aria-label="Conta"
          >
            <option value="">Todas as contas</option>
            {allScoped
              .filter((a) => !bank || a.bank === bank)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bank} {a.number}
                </option>
              ))}
          </FilterCard>
        </div>
      </PageHeader>

      {/* Quatro KPIs consultados no backend */}
      <div className="grid grid-cols-1 gap-3 overflow-visible sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Wallet}
          label="Saldo bancário consolidado"
          value={valorKpi(kpisApi?.saldoConsolidado)}
          hint={
            erroKpis
              ? 'Não foi possível consultar a API'
              : cons.missing.length
                ? `${cons.missing.length} conta(s) sem saldo disponível`
                : `${cons.connected} conta(s) conectada(s)`
          }
          hintTone={cons.missing.length ? 'ok' : undefined}
          to="/conexoes"
          tip="Soma dos saldos bancários retornados pelo backend."
        />

        <Kpi
          icon={TrendingUp}
          label="Entradas do período"
          value={valorKpi(kpisApi?.entradas)}
          hint={
            erroKpis
              ? 'Não foi possível consultar a API'
              : vsHint(recChange, month(prevPeriod))
          }
          hintTone={toneFor(recChange)}
          to="/extratos"
          tip="Soma das receitas registradas no banco de dados no período selecionado."
        />

        <Kpi
          icon={TrendingDown}
          label="Saídas do período"
          value={valorKpi(kpisApi?.saidas)}
          hint={
            erroKpis
              ? 'Não foi possível consultar a API'
              : vsHint(expChange, month(prevPeriod))
          }
          hintTone={toneFor(expChange, true)}
          to="/extratos"
          tip="Soma das despesas registradas no banco de dados no período selecionado."
        />

        <Kpi
          icon={BarChart3}
          label="Resultado do período"
          value={valorKpi(kpisApi?.resultado)}
          hint={
            erroKpis
              ? 'Não foi possível consultar a API'
              : `Receitas menos despesas · ${periodLabel}`
          }
          to="/dre"
          tip="Diferença entre as receitas e despesas retornadas pelo backend para o período."
        />
      </div>

      {/* Demais KPIs mantidos com os dados locais atuais */}
      <div className="mt-3 grid grid-cols-1 gap-3 overflow-visible sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={CalendarDays}
          label="Entradas do dia"
          value={money(today.entradas)}
          hint={TODAY}
          to="/extratos"
          tip="Créditos na data de referência da demonstração."
        />

        <Kpi
          icon={CalendarDays}
          label="Saídas do dia"
          value={money(today.saidas)}
          hint={TODAY}
          to="/extratos"
          tip="Débitos na data de referência da demonstração."
        />

        <Kpi
          icon={Hourglass}
          label="Pendentes de conciliação"
          value={String(pendingRecon.count)}
          hint={
            pendingRecon.count
              ? money(pendingRecon.amount)
              : 'Nenhuma'
          }
          to="/conciliacao/pendencias"
          tip="Quantidade e valor das movimentações ainda não conciliadas."
        />

        <Kpi
          icon={Link2}
          label="Contas conectadas"
          value={`${cons.connected}/${cons.total}`}
          hint={
            cons.missing.length
              ? 'Há conexões indisponíveis'
              : 'Todas ativas'
          }
          to="/conexoes"
          tip="Contas com conexão ativa no recorte. A sincronização real depende de um provedor Open Finance."
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.45fr_0.85fr]">
        <Card className="p-5">
          <div className="mb-1 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-destaque text-primaria">
              <Landmark size={15} />
            </span>
            <h2 className="t-h3">Contas sincronizadas</h2>
          </div>

          {syncedAccounts.length ? (
            syncedAccounts.map((a) => (
              <Link
                key={a.id}
                to="/conexoes"
                className="t-body flex items-center gap-3 border-b border-borda py-3.5 last:border-0"
              >
                <BankLogo bank={a.bank} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{a.bank}</span>
                  <span className="t-apoio text-faint">{a.number}</span>
                </span>
                <Badge tone="success">Sincronizada</Badge>
                <ChevronRight size={16} className="text-faint" />
              </Link>
            ))
          ) : (
            <p className="t-apoio mt-3 text-texto-secundario">
              Nenhuma conta sincronizada neste recorte.
            </p>
          )}
        </Card>

        <Link
          to="/dre"
          className="relative min-h-[176px] overflow-hidden rounded-[16px] bg-[#08362c] p-5 text-white"
        >
          <svg
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-[58%] opacity-[0.35]"
            viewBox="0 0 220 180"
            fill="none"
            aria-hidden
          >
            <rect x="110" y="70" width="36" height="110" fill="#c9b07a" opacity="0.35" />
            <rect x="150" y="40" width="44" height="140" fill="#d7c49a" opacity="0.45" />
            <rect x="80" y="88" width="28" height="92" fill="#9bb8a8" opacity="0.4" />
            <rect x="188" y="58" width="32" height="122" fill="#e4d4ae" opacity="0.3" />
            <path
              d="M0 180 L0 130 C30 118 48 142 72 128 C96 114 118 148 220 120 L220 180 Z"
              fill="#062921"
              opacity="0.55"
            />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-r from-[#08362c] via-[#08362c]/88 to-transparent" />

          <div className="relative flex h-full flex-col">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white">
              <Target size={16} strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-[16px] leading-snug font-semibold">
              Mais controle, melhores decisões
            </p>
            <p className="mt-1.5 max-w-[15.5rem] text-[13px] leading-relaxed text-white/75">
              Tenha uma visão completa das suas finanças em tempo real.
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-medium">
              Ver relatórios <ArrowRight size={14} />
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-6 grid min-w-0 items-stretch gap-3 overflow-visible xl:grid-cols-2">
        <BarCard
          title="Entradas e saídas"
          tip="Movimentações bancárias observadas no extrato, mês a mês."
          data={cashSeries}
          highlight={periodLabel}
          series={[
            { key: 'entradas', name: 'Entradas', color: '#0B5D4E' },
            { key: 'saidas', name: 'Saídas', color: '#8B9B98' },
          ]}
        />

        <LineCard
          title="Evolução do saldo consolidado"
          tip="Saldo reconstruído a partir do saldo atual das contas conectadas e das movimentações observadas."
          data={saldoSeries}
          series={[
            { key: 'saldo', name: 'Saldo', color: '#1F6F8B' },
          ]}
        />

        <PieCard
          title="Despesas classificadas"
          tip="Categorias generalistas das saídas classificadas no período."
          data={expensePie}
        />

        <PieCard
          title={revenuePie.length ? 'Receitas classificadas' : 'Conciliação no período'}
          tip={
            revenuePie.length
              ? 'Categorias generalistas das entradas classificadas.'
              : 'Situação das movimentações do período.'
          }
          data={revenuePie.length ? revenuePie : reconPie}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHead title="Alertas" to="/alertas" />
          {scopedAlerts.slice(0, 4).map((a) => (
            <Link
              key={a.id}
              to={a.link || '/alertas'}
              className="t-body mb-3 flex items-start justify-between gap-3 border-b border-borda pb-3 last:mb-0 last:border-0"
            >
              <span>{a.title}</span>
              <Badge tone={alertTone(a.group)}>
                {alertLabel(a.group)}
              </Badge>
            </Link>
          ))}
          {!scopedAlerts.length ? (
            <Empty>Nenhum alerta em aberto.</Empty>
          ) : null}
        </Card>

        <Card>
          <SectionHead title="Insights" to="/ia/insights" />
          {insights.map((i) => (
            <Link
              key={i.text}
              to={insightTo(i)}
              className="t-body mb-3 block border-b border-borda pb-3 last:mb-0 last:border-0"
            >
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
              <Link
                key={item.label}
                to={item.to}
                className="t-body mb-3 flex items-center justify-between gap-3 border-b border-borda pb-3 last:mb-0 last:border-0"
              >
                <span>{item.label}</span>
                <span className="num font-semibold">{item.n}</span>
              </Link>
            ))
          )}
        </Card>

        <Card>
          <SectionHead title="Contas bancárias" to="/conexoes" />
          {allScoped.slice(0, 4).map((a) => (
            <Link
              key={a.id}
              to="/conexoes"
              className="t-body mb-3 flex items-start justify-between gap-3 border-b border-borda pb-3 last:mb-0 last:border-0"
            >
              <span className="flex min-w-0 items-start gap-2.5">
                <BankLogo bank={a.bank} size={28} />
                <span>
                  {a.bank} {a.number}
                  <span className="mt-0.5 block t-apoio text-faint">
                    {a.balanceUnavailable || a.connected === false
                      ? 'Saldo indisponível'
                      : money(a.balance)}
                  </span>
                </span>
              </span>

              <Badge
                tone={
                  a.status === 'ok' && a.connected !== false
                    ? 'success'
                    : a.status === 'erro'
                      ? 'danger'
                      : 'warning'
                }
              >
                {a.connected === false
                  ? 'Desconectada'
                  : a.status === 'ok'
                    ? 'Conectada'
                    : a.status === 'erro'
                      ? 'Expirada'
                      : 'Atrasada'}
              </Badge>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  )
}

export function PendenciasPage() {
  const { documents, accounts } = useApp()
  const tx = useScopedTx()

  const missing = accounts.filter(
    (a) => a.status !== 'ok' || a.connected === false,
  )

  const cards = [
    {
      label: 'Classificações aguardando revisão',
      n: tx.filter(
        (t) =>
          t.status === 'sugerida' ||
          t.status === 'revisao' ||
          t.status === 'nao_classificada',
      ).length,
      to: '/ia/fila',
    },
    {
      label: 'Pendências de conciliação',
      n: tx.filter(
        (t) =>
          t.recon === 'divergencia' ||
          t.recon === 'pendente' ||
          t.recon === 'sugestao',
      ).length,
      to: '/conciliacao/pendencias',
    },
    {
      label: 'Bancos sem sincronização',
      n: missing.length,
      to: '/conexoes',
    },
    {
      label: 'Documentos inconsistentes',
      n: documents.filter((d) => d.status === 'inconsistente').length,
      to: '/documentos?filtro=inconsistente',
    },
  ]

  const total = cards.reduce((s, c) => s + c.n, 0)

  return (
    <div>
      <PageHeader
        kicker="Operação"
        title="Pendências"
        subtitle="Itens que ainda exigem conferência neste recorte."
      />

      {total === 0 ? (
        <Empty>Nenhuma pendência em aberto.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => (
            <Kpi
              key={c.label}
              label={c.label}
              value={String(c.n)}
              to={c.to}
            />
          ))}
        </div>
      )}
    </div>
  )
}
