import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { accounts as accountsSeed, auditSeed, documents as docsSeed, schedule as scheduleSeed, transactions as txSeed } from '@/data/fixtures'
import {
  buildAlerts,
  buildInsights,
  classStatus,
  lastMonth,
} from '@/domain/finance'
import { statementFromTransactions } from '@/domain/banking'
import type { Account, AppConfig, AuditEntry, Document, ScheduleItem, Session, StatementImport, Transaction } from '@/domain/types'
import { applyTheme, clearSession, loadSnapshot, persist, saveSession, sessionFromEmail } from './store'

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

export type Usuario = {
  id: number
  filial: {
    idFilial: number
    razaoSocial: string
  } | null
  nome: string
  cargo: string
  email: string
}

type Ctx = {
  session: Session | null
  scope: string
  period: string
  config: AppConfig
  transactions: Transaction[]
  accounts: Account[]
  documents: Document[]
  schedule: ScheduleItem[]
  audit: AuditEntry[]
  imports: StatementImport[]
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
  updateAccount: (id: string, patch: Partial<Account>) => void
  addAccount: (account: Account) => void
  addTransactions: (rows: Transaction[], record?: StatementImport) => void
  inviteUserNote: string | null
  setInviteUserNote: (v: string | null) => void
  usuario: Usuario | null
  setUsuario: (usuario: Usuario | null) => void
}

const AppContext = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
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
  const [accountPatch, setAccountPatch] = useState<Record<string, Partial<Account>>>(() => persist.read('accountPatch', {}))
  const [extraAccounts, setExtraAccounts] = useState<Account[]>(() => persist.read('extraAccounts', []))
  const [extraTx, setExtraTx] = useState<Transaction[]>(() => persist.read('extraTx', []))
  const [imports, setImports] = useState<StatementImport[]>(() => persist.read('imports', []))

  useEffect(() => {
    applyTheme(config.theme)
  }, [config.theme])

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
      usuario,
      setUsuario,
      session,
      scope,
      period,
      config,
      transactions,
      accounts,
      documents,
      schedule,
      audit,
      imports,
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
          const next: AppConfig = {
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
  }, [session, usuario, scope, period, txFilter, config, transactions, accounts, documents, schedule, audit, imports, overrides, recon, inviteUserNote])

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
  const { scope, period, schedule, transactions, config, accounts } = useApp()
  const st = statementFromTransactions(transactions, period || lastMonth(), scope)
  const alerts = buildAlerts(config, transactions, schedule, accounts)
  const insights = buildInsights(scope, schedule)
  return { st, alerts, insights }
}
