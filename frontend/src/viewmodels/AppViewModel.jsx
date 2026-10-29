import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from 'react'
import { accounts as accountsSeed, auditSeed, documents as docsSeed, schedule as scheduleSeed, transactions as txSeed } from '@/models/fixtures'
import {
  buildAlerts,
  buildInsights,
  classStatus,
  lastMonth,
} from '@/models/domain/finance'
import { statementFromTransactions } from '@/models/domain/banking'

import {
  applyTheme,
  clearSession,
  loadSnapshot,
  persist,
  saveSession,
  saveUsuario,
  sessionFromUsuario,
} from '@/models/session'
import { listarFiliais } from '@/models/api/filialService'
import { currentMonth, lastTwelveMonths } from '@/lib/period'



 











export const emptyTxFilter = {
  search: '',
  periodo: '',
  cnpj: '',
  banco: '',
  conta: '',
  categoria: '',
  status: '',
  origem: '',
  tipo: '',
}



































const AppContext = createContext(null)

const PERIOD_MONTHS = lastTwelveMonths()

function initialPeriod(stored) {
  if (stored && PERIOD_MONTHS.includes(stored)) return stored
  return currentMonth()
}

export function AppViewModelProvider({ children }) {
  const snap = loadSnapshot()
  const [usuario, setUsuario] = useState(snap.usuario)
  const [session, setSession] = useState(snap.session)
  const [scope, setScopeState] = useState(snap.scope === 'grupo' || /^\d+$/.test(String(snap.scope || '')) ? snap.scope : 'grupo')
  const [period, setPeriodState] = useState(initialPeriod(snap.period))
  const [filiais, setFiliais] = useState([])
  const [config, setConfig] = useState(snap.config)
  const [overrides, setOverrides] = useState(() => persist.read('overrides', {}))
  const [recon, setReconMap] = useState(() => persist.read('recon', {}))
  const [audit, setAudit] = useState(() => {
    const extra = persist.read('audit', [])
    return [...extra, ...auditSeed]
  })
  const [documents, setDocuments] = useState(docsSeed)
  const [schedule, setSchedule] = useState(scheduleSeed)
  const [inviteUserNote, setInviteUserNote] = useState(null)
  const [txFilter, setTxFilterState] = useState(emptyTxFilter)
  const [accountPatch, setAccountPatch] = useState(() => persist.read('accountPatch', {}))
  const [extraAccounts, setExtraAccounts] = useState(() => persist.read('extraAccounts', []))
  const [extraTx, setExtraTx] = useState(() => persist.read('extraTx', []))
  const [imports, setImports] = useState(() => persist.read('imports', []))

  useEffect(() => {
    applyTheme(config.theme)
  }, [config.theme])

  const recarregarFiliais = useCallback(async (opcoes = {}) => {
    if (!usuario) {
      setFiliais([])
      return []
    }
    try {
      const lista = await listarFiliais()
      const next = Array.isArray(lista) ? lista : []
      setFiliais(next)
      const ids = new Set(next.map((f) => String(f.idFilial)))
      setScopeState((current) => {
        if (current === 'grupo') return current
        if (ids.has(String(current))) return String(current)
        if (opcoes.fallbackOwn) {
          const own = usuario?.filial?.idFilial
          const fallback = own != null && ids.has(String(own)) ? String(own) : 'grupo'
          persist.write('scope', fallback)
          return fallback
        }
        persist.write('scope', 'grupo')
        return 'grupo'
      })
      return next
    } catch {
      setFiliais([])
      return []
    }
  }, [usuario])

  useEffect(() => {
    if (!usuario) {
      setFiliais([])
      return
    }
    recarregarFiliais({ fallbackOwn: true })
  }, [usuario, recarregarFiliais])

  const accounts = useMemo(() => {
    const extras = extraAccounts.filter((a) => !accountsSeed.some((s) => s.id === a.id))
    return [...accountsSeed, ...extras].map((a) => ({ ...a, ...accountPatch[a.id] }))
  }, [accountPatch, extraAccounts])

  const transactions = useMemo(
    () =>
      [...txSeed, ...extraTx].map((t) => ({
        ...t,
        ...overrides[t.id],
        recon: recon[t.id] ?? t.recon,
      })),
    [overrides, recon, extraTx],
  )

  const value = useMemo(() => {
    const recordAudit = (entry) => {
      const row = {
        at: new Date().toISOString().slice(0, 19),
        user: session?.name ?? 'Sistema',
        ...entry,
      }
      setAudit((prev) => {
        const next = [row, ...prev]
        persist.write(
          'audit',
          next.filter((a) => !auditSeed.includes(a)),
        )
        return next
      })
    }

    return {
      usuario,
      setUsuario,
      session,
      scope,
      period,
      periodMonths: PERIOD_MONTHS,
      filiais,
      recarregarFiliais,
      config,
      transactions,
      accounts,
      documents,
      schedule,
      audit,
      imports,
      inviteUserNote,
      setInviteUserNote,
      login: (nextUsuario, remember = true) => {
        const next = sessionFromUsuario(nextUsuario)
        saveUsuario(nextUsuario, remember)
        saveSession(next, remember)
        setUsuario(nextUsuario)
        setSession(next)
        return next
      },
      logout: () => {
        clearSession()
        persist.remove('scope')
        setSession(null)
        setUsuario(null)
      },
      setScope: (s) => {
        persist.write('scope', s)
        setScopeState(s)
      },
      setPeriod: (p) => {
        persist.write('period', p)
        setPeriodState(p)
      },
      txFilter,
      setTxFilter: (patch) => setTxFilterState((prev) => ({ ...prev, ...patch })),
      resetTxFilter: () => setTxFilterState(emptyTxFilter),
      saveConfig: (patch) => {
        setConfig((prev) => {
          const next = {
            ...prev,
            ...patch,
            thresholds: { ...prev.thresholds, ...patch.thresholds },
            notifications: {
              ...prev.notifications,
              ...patch.notifications,
              kinds: { ...prev.notifications.kinds, ...patch.notifications?.kinds },
            },
            openFinance: { ...prev.openFinance, ...patch.openFinance },
            aiApi: { ...prev.aiApi, ...patch.aiApi },
          }
          persist.write('config', next)
          return next
        })
      },
      recordAudit,
      classify: (id, category, costCenter, reason, decision) => {
        const before = transactions.find((t) => t.id === id)
        const next = {
          ...overrides,
          [id]: {
            category: decision === 'rejeitada' ? null : category,
            costCenter: decision === 'rejeitada' ? null : costCenter,
            confidence: decision === 'rejeitada' ? 0 : 100,
            mechanism: 'manual' ,
          },
        }
        setOverrides(next)
        persist.write('overrides', next)
        recordAudit({
          action: decision === 'alterada' ? 'Reclassificação' : 'Classificação aceita',
          entity: `Lançamento ${id}`,
          before: before?.category ?? 'Sem classificação',
          after: decision === 'rejeitada' ? 'Sem classificação' : (category ?? '—'),
          reason,
        })
      },
      setRecon: (id, status, reason) => {
        const next = { ...recon, [id]: status }
        setReconMap(next)
        persist.write('recon', next)
        recordAudit({
          action: 'Conciliação atualizada',
          entity: `Lançamento ${id}`,
          before: transactions.find((t) => t.id === id)?.recon ?? '',
          after: status,
          reason: reason ?? '',
        })
      },
      addDocument: (doc) => setDocuments((prev) => [doc, ...prev]),
      addBill: (item) => setSchedule((prev) => [...prev, item]),
      updateBill: (item) => setSchedule((prev) => prev.map((s) => (s.id === item.id ? item : s))),
      updateAccount: (id, patch) => {
        setAccountPatch((prev) => {
          const next = { ...prev, [id]: { ...prev[id], ...patch } }
          persist.write('accountPatch', next)
          return next
        })
      },
      addAccount: (account) => {
        setExtraAccounts((prev) => {
          const next = [account, ...prev.filter((a) => a.id !== account.id)]
          persist.write('extraAccounts', next)
          return next
        })
        recordAudit({
          action: 'Conta bancária conectada',
          entity: `${account.bank} ${account.number}`,
          before: 'Desconectada',
          after: 'Conectada (fluxo simulado)',
          reason: 'Consentimento de demonstração. Integração Open Finance ainda não operacional.',
        })
      },
      addTransactions: (rows, record) => {
        setExtraTx((prev) => {
          const next = [...rows, ...prev]
          persist.write('extraTx', next)
          return next
        })
        if (record) {
          setImports((prev) => {
            const next = [record, ...prev]
            persist.write('imports', next)
            return next
          })
          recordAudit({
            action: 'Importação de extrato',
            entity: record.fileName,
            before: '',
            after: `${record.count} lançamento(s) · ${record.status}`,
            reason: record.errors.join(' ') || `Formato ${record.format.toUpperCase()}`,
          })
        }
      },
    }
  }, [session, usuario, scope, period, filiais, recarregarFiliais, txFilter, config, transactions, accounts, documents, schedule, audit, imports, overrides, recon, inviteUserNote])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppViewModel() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppViewModel precisa do AppViewModelProvider')
  return ctx
}

export function useScopedTx() {
  const { transactions, scope, config } = useAppViewModel()
  const list = scope === 'grupo' ? transactions : transactions.filter((t) => t.companyId === scope)
  return list.map((t) => ({ ...t, status: classStatus(t, config) }))
}

export function useDashboardNumbers() {
  const { scope, period, schedule, transactions, config, accounts } = useAppViewModel()
  const st = statementFromTransactions(transactions, period || lastMonth(), scope)
  const alerts = buildAlerts(config, transactions, schedule, accounts)
  const insights = buildInsights(scope, schedule)
  return { st, alerts, insights }
}
