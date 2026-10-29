import { useEffect, useMemo, useState } from 'react'
import { buscarKpisDashboard } from '@/models/api/dashboardService'
import { listarContasBancarias } from '@/models/api/contaBancariaService'
import { listarOperacoes } from '@/models/api/operacaoService'
import {
  balanceHistory,
  categoryPie,
  consolidatedBalance,
  dayMoves,
  filterAccounts,
  mapConta,
  mapOperacao,
  monthlyCashSeries,
  periodMoves,
  scopedAccounts,
} from '@/models/domain/dashboardBanking'
import { currentMonth, isoDateToday, periodRange, previousMonth } from '@/lib/period'
import { dateTimeMark, month, money, signedPercent } from '@/lib/format'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

function delta(current, previous) {
  if (!previous) return null
  return (current - previous) / Math.abs(previous)
}

function vsHint(change, prevLabel) {
  if (change == null) return undefined
  return `${signedPercent(change * 100)} vs ${prevLabel}`
}

function toneFor(change, invert = false) {
  if (change == null || change === 0) return undefined
  const up = invert ? change < 0 : change > 0
  return up ? 'up' : 'down'
}

function alertTone(group) {
  if (group === 'critico') return 'danger'
  if (group === 'atencao') return 'warning'
  return 'info'
}

function alertLabel(group) {
  if (group === 'critico') return 'Crítico'
  if (group === 'atencao') return 'Atenção'
  return 'Informação'
}

function insightTo(item) {
  return `/ia/insights?item=${encodeURIComponent(item.text)}`
}

export function useDashboardViewModel() {
  const { scope, usuario, period, periodMonths } = useAppViewModel()
  const TODAY = isoDateToday()
  const months = periodMonths?.length ? periodMonths : [currentMonth()]
  const [bank, setBank] = useState('')
  const [accountId, setAccountId] = useState('')
  const [contas, setContas] = useState([])
  const [operacoes, setOperacoes] = useState([])
  const [kpisApi, setKpisApi] = useState(null)
  const [carregandoKpis, setCarregandoKpis] = useState(true)
  const [erroKpis, setErroKpis] = useState(false)

  useEffect(() => {
    setBank('')
    setAccountId('')
  }, [scope, period])

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        setCarregandoKpis(true)
        setErroKpis(false)
        const { inicio, fim } = periodRange(period)
        const idFilial = scope === 'grupo' ? undefined : Number(scope)
        if (scope !== 'grupo' && (!Number.isInteger(idFilial) || idFilial <= 0)) {
          throw new Error('O identificador da filial é inválido.')
        }
        const [dadosKpi, contasDto, operacoesDto] = await Promise.all([
          buscarKpisDashboard(inicio, fim, idFilial),
          listarContasBancarias(),
          listarOperacoes(),
        ])
        if (!ativo) return
        setKpisApi(dadosKpi)
        setContas((contasDto || []).map(mapConta).filter((a) => a.id))
        setOperacoes((operacoesDto || []).map(mapOperacao).filter((t) => t.id))
      } catch {
        if (ativo) {
          setErroKpis(true)
          setKpisApi(null)
          setContas([])
          setOperacoes([])
        }
      } finally {
        if (ativo) setCarregandoKpis(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [period, scope])

  const allScoped = scopedAccounts(contas, scope)
  const banks = [...new Set(allScoped.map((a) => a.bank).filter(Boolean))]
  const filteredAccounts = filterAccounts(allScoped, bank, accountId)
  const filteredIds = new Set(filteredAccounts.map((a) => a.id))
  const filteredOps = useMemo(
    () => operacoes.filter((t) => filteredIds.has(t.accountId)),
    [operacoes, filteredAccounts],
  )

  let inicio
  let fim
  try {
    const range = periodRange(period)
    inicio = range.inicio
    fim = range.fim
  } catch {
    inicio = `${period}-01`
    fim = `${period}-28`
  }

  const periodLabel = month(period)
  const cons = consolidatedBalance(filteredAccounts.length ? filteredAccounts : allScoped)
  const moves = periodMoves(filteredOps, inicio, fim)
  const today = dayMoves(filteredOps, TODAY)
  const pendingRecon = { count: 0, amount: 0 }
  const prevPeriod = previousMonth(period, months)
  const prevRange = (() => {
    try {
      return periodRange(prevPeriod)
    } catch {
      return { inicio, fim }
    }
  })()
  const prevMoves = periodMoves(filteredOps, prevRange.inicio, prevRange.fim)
  const cashSeries = monthlyCashSeries(filteredOps, months, month)
  const saldoSeries = balanceHistory(
    filteredAccounts.length ? filteredAccounts : allScoped,
    filteredOps,
    TODAY,
  )
  const expensePie = categoryPie(filteredOps, inicio, fim, 'saida')
  const revenuePie = categoryPie(filteredOps, inicio, fim, 'entrada')
  const reconPie = []
  const scopedAlerts = []
  const insights = []
  const firstName = usuario?.nome?.split(' ')[0] ?? ''
  const lastSync = ''
  const syncedPool = filteredAccounts.length ? filteredAccounts : allScoped
  const syncedAccounts = syncedPool.filter((a) => a.connected && !a.balanceUnavailable).slice(0, 3)
  const recChange = delta(moves.entradas, prevMoves.entradas)
  const expChange = delta(moves.saidas, prevMoves.saidas)
  const pending = [
    { label: 'Classificações aguardando revisão', n: 0, to: '/ia/fila' },
    { label: 'Pendências de conciliação', n: 0, to: '/conciliacao/pendencias' },
    { label: 'Bancos sem sincronização', n: cons.missing.length, to: '/conexoes' },
    { label: 'Documentos inconsistentes', n: 0, to: '/documentos?filtro=inconsistente' },
  ]
  const pendingTotal = pending.reduce((s, c) => s + c.n, 0)
  const empty = !carregandoKpis && !erroKpis && !allScoped.length
  const filtered = Boolean(bank || accountId)
  const kpis = filtered
    ? {
        saldoConsolidado: cons.available,
        entradas: moves.entradas,
        saidas: moves.saidas,
        resultado: moves.resultado,
      }
    : kpisApi

  function valorKpi(valor) {
    if (carregandoKpis) return 'Carregando...'
    if (erroKpis || valor === undefined || valor === null) return 'Indisponível'
    return money(valor)
  }

  function valorLocal(valor) {
    if (carregandoKpis) return 'Carregando...'
    if (erroKpis) return 'Indisponível'
    return money(valor)
  }

  return {
    TODAY,
    usuario,
    firstName,
    empty,
    lastSync,
    bank,
    accountId,
    banks,
    allScoped,
    setBank,
    setAccountId,
    valorKpi,
    valorLocal,
    kpisApi: kpis,
    erroKpis,
    cons,
    moves,
    today,
    recChange,
    expChange,
    periodLabel,
    pending,
    pendingTotal,
    pendingRecon,
    prevPeriod,
    cashSeries,
    saldoSeries,
    expensePie,
    revenuePie,
    reconPie,
    scopedAlerts,
    insights,
    syncedAccounts,
    money,
    month,
    dateTimeMark,
    vsHint,
    toneFor,
    alertTone,
    alertLabel,
    insightTo,
  }
}

export function usePendenciasViewModel() {
  return {
    cards: [
      { label: 'Classificações aguardando revisão', n: 0, to: '/ia/fila' },
      { label: 'Pendências de conciliação', n: 0, to: '/conciliacao/pendencias' },
      { label: 'Bancos sem sincronização', n: 0, to: '/conexoes' },
      { label: 'Documentos inconsistentes', n: 0, to: '/documentos?filtro=inconsistente' },
    ],
    total: 0,
  }
}
