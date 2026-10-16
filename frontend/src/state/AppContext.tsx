import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { auditSeed, documents as docsSeed, schedule as scheduleSeed, transactions as txSeed } from '@/data/fixtures'
import {
  buildAlerts,
  buildInsights,
  classStatus,
  lastMonth,
  statementFor,
} from '@/domain/finance'
import type { AppConfig, AuditEntry, Document, ScheduleItem, Session, Transaction } from '@/domain/types'
import { clearSession, loadSnapshot, persist, saveSession, sessionFromEmail } from './store'

export type TxFilter = {
  search: string
  periodo: string
  cnpj: string
  banco: string
  conta: string
  categoria: string
  status: string
  origem: string
  tipo: string
}

export const emptyTxFilter: TxFilter = {
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

type Ctx = {
  session: Session | null
  scope: string
  period: string
  config: AppConfig
  transactions: Transaction[]
  documents: Document[]
  schedule: ScheduleItem[]
  audit: AuditEntry[]
  login: (email: string, remember?: boolean) => Session
  logout: () => void
  setScope: (scope: string) => void
  setPeriod: (period: string) => void
  txFilter: TxFilter
  setTxFilter: (patch: Partial<TxFilter>) => void
  resetTxFilter: () => void
  saveConfig: (patch: Partial<AppConfig>) => void
  recordAudit: (entry: Omit<AuditEntry, 'at' | 'user'>) => void
  classify: (id: string, category: string | null, costCenter: string | null, reason: string, decision: 'aceita' | 'alterada' | 'rejeitada') => void
  setRecon: (id: string, status: Transaction['recon'], reason?: string) => void
  addDocument: (doc: Document) => void
  addBill: (item: ScheduleItem) => void
  updateBill: (item: ScheduleItem) => void
  inviteUserNote: string | null
  setInviteUserNote: (v: string | null) => void
}

const AppContext = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const snap = loadSnapshot()
  const [session, setSession] = useState<Session | null>(snap.session)
  const [scope, setScopeState] = useState(snap.scope)
  const [period, setPeriodState] = useState(snap.period)
  const [config, setConfig] = useState<AppConfig>(snap.config)
  const [overrides, setOverrides] = useState<Record<string, Partial<Transaction>>>(() => persist.read('overrides', {}))
  const [recon, setReconMap] = useState<Record<string, Transaction['recon']>>(() => persist.read('recon', {}))
  const [audit, setAudit] = useState<AuditEntry[]>(() => {
    const extra = persist.read<AuditEntry[]>('audit', [])
    return [...extra, ...auditSeed]
  })
  const [documents, setDocuments] = useState<Document[]>(docsSeed)
  const [schedule, setSchedule] = useState<ScheduleItem[]>(scheduleSeed)
  const [inviteUserNote, setInviteUserNote] = useState<string | null>(null)
  const [txFilter, setTxFilterState] = useState<TxFilter>(emptyTxFilter)

  const transactions = useMemo(
    () =>
      txSeed.map((t) => ({
        ...t,
        ...overrides[t.id],
        recon: recon[t.id] ?? t.recon,
      })),
    [overrides, recon],
  )

  const value = useMemo<Ctx>(() => {
    const recordAudit = (entry: Omit<AuditEntry, 'at' | 'user'>) => {
      const row: AuditEntry = {
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
      session,
      scope,
      period,
      config,
      transactions,
      documents,
      schedule,
      audit,
      inviteUserNote,
      setInviteUserNote,
      login: (email, remember = true) => {
        const next = sessionFromEmail(email)
        saveSession(next, remember)
        setSession(next)
        return next
      },
      logout: () => {
        clearSession()
        persist.remove('scope')
        setSession(null)
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
          const next = { ...prev, ...patch, thresholds: { ...prev.thresholds, ...patch.thresholds } }
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
            mechanism: 'manual' as const,
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
    }
  }, [session, scope, period, txFilter, config, transactions, documents, schedule, audit, overrides, recon, inviteUserNote])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp precisa do AppProvider')
  return ctx
}

export function useScopedTx() {
  const { transactions, scope, config } = useApp()
  const list = scope === 'grupo' ? transactions : transactions.filter((t) => t.companyId === scope)
  return list.map((t) => ({ ...t, status: classStatus(t, config) }))
}

export function useDashboardNumbers() {
  const { scope, period, schedule, transactions, config } = useApp()
  const st = statementFor(period || lastMonth(), scope)
  const alerts = buildAlerts(config, transactions, schedule)
  const insights = buildInsights(scope, schedule)
  return { st, alerts, insights }
}
