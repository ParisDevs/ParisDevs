export type Role = 'administrador' | 'analista' | 'gestor' | 'auditor'
export type Permission = 'edit' | 'view' | 'none'
export type AccountStatus = 'ok' | 'atrasada' | 'erro'
export type ReconStatus = 'conciliado' | 'sugestao' | 'pendente' | 'divergencia' | 'duplicidade' | 'interna'
export type ClassStatus = 'automatica' | 'sugerida' | 'revisao' | 'aprovada' | 'nao_classificada'
export type Mechanism = 'regra' | 'historico' | 'ml' | 'llm' | 'manual'
export type AlertGroup = 'critico' | 'atencao' | 'informacao'
export type AlertKind = 'financeiro' | 'conciliacao' | 'classificacao' | 'integracao'
export type DocStatus = 'pendente' | 'inconsistente' | 'processado' | 'conciliado'
export type BillStatus = 'aberto' | 'pago' | 'vencido'
export type TxSource = 'open_finance' | 'import' | 'manual'
export type DocOrigin = 'Arquivo' | 'XML' | 'Manual' | 'OCR'
export type DreNature = 'receita' | 'despesa' | 'transferencia' | 'patrimonial' | 'nao_classificado'
export type ThemeMode = 'light' | 'dark'
export type IntegrationStatus = 'nao_configurado' | 'configurado' | 'erro'
export type StatementFormat = 'ofx' | 'csv' | 'pdf' | 'txt' | 'xml'

export type Session = {
  userId: string
  name: string
  email: string
  role: Role
  firstAccess: boolean
}

export type Company = {
  id: string
  code: string
  name: string
  fantasy: string
  cnpj: string
  segment: string
  segmentLabel: string
  city: string
  unit?: string
  status: 'ativo' | 'inativo'
}

export type Account = {
  id: string
  companyId: string
  bank: string
  agency: string
  number: string
  type: string
  balance: number
  provider: string
  status: AccountStatus
  lastSync: string
  consentUntil: string
  note?: string
  institutionId?: string
  connected?: boolean
  balanceUnavailable?: boolean
}

export type Category = {
  code: string
  name: string
  parent: string | null
  group: string
}

export type Transaction = {
  id: string
  sourceId: string
  accountId: string
  companyId: string
  date: string
  competence: string
  description: string
  counterparty: string
  document: string
  amount: number
  category: string | null
  costCenter: string | null
  confidence: number
  mechanism: Mechanism
  recon: ReconStatus
  intercompany: boolean
  pairId?: string
  duplicateOf?: string
  source?: TxSource
  importId?: string
  fitId?: string
  ocrConfidence?: number
}

export type ExpectedEntry = {
  id: string
  txId: string
  kind: 'sugestao' | 'divergencia'
  description: string
  counterparty: string
  amount: number
  dueDate: string
  score?: number
  source: string
  reason?: string
}

export type ScheduleItem = {
  id: string
  companyId: string
  date: string
  competence: string
  kind: 'pagar' | 'receber'
  description: string
  counterparty: string
  amount: number
  category: string
  status: BillStatus
  intercompany?: boolean
}

export type Document = {
  id: string
  number: string
  supplier: string
  date: string
  amount: number
  origin: DocOrigin
  status: DocStatus
  companyId: string
  txId?: string
  note?: string
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
  scope: string
  status: 'ativo' | 'inativo' | 'convidado'
  lastAccess: string | null
  mfa: boolean
  phone?: string
}

export type CostCenter = {
  id: string
  name: string
  companyId: string | null
  type: string
}

export type FinancialRule = {
  id: string
  name: string
  segment: string
  segmentLabel: string
  limit: number
  active: boolean
}

export type AppConfig = {
  thresholds: { auto: number; suggest: number }
  syncMaxHours: number
  financialRules: FinancialRule[]
  expenseIncreaseAlert: number
  revenueDropAlert: number
  useRules: boolean
  useHistory: boolean
  requireHuman: boolean
  currency: string
  timezone: string
  theme: ThemeMode
  notifications: {
    inApp: boolean
    email: boolean
    kinds: { financeiro: boolean; conciliacao: boolean; classificacao: boolean; integracao: boolean }
  }
  openFinance: {
    provider: string
    status: IntegrationStatus
    clientIdMasked: string
    lastError: string
  }
  aiApi: {
    provider: string
    status: IntegrationStatus
    keyMasked: string
    lastError: string
  }
}

export type Institution = {
  id: string
  name: string
  short: string
  color: string
  openFinance: boolean
}

export type StatementImport = {
  id: string
  fileName: string
  format: StatementFormat
  accountId: string
  at: string
  user: string
  count: number
  errors: string[]
  status: 'concluida' | 'parcial' | 'erro'
}

export type PreviewMovement = {
  id: string
  date: string
  description: string
  counterparty: string
  document: string
  amount: number
  fitId: string
  confidence: number
  missing: string[]
  possibleDuplicate?: boolean
}

export type AuditEntry = {
  at: string
  user: string
  action: string
  entity: string
  before: string
  after: string
  reason: string
}

export type MonthlyLine = {
  vendasSalao: number
  vendasDelivery: number
  vendasAtacado: number
  servicos: number
  outras: number
  deducoes: number
  mercadorias: number
  maoDeObra: number
  ocupacao: number
  manutencao: number
  contas: number
  marketing: number
  administrativo: number
  financeiras: number
  tributos: number
  eliminacao: number
}

export type Statement = MonthlyLine & {
  receitaBruta: number
  receitaLiquida: number
  custos: number
  lucroBruto: number
  despesasOperacionais: number
  resultadoOperacional: number
  resultadoAntesTributos: number
  resultadoLiquido: number
  despesasTotais: number
  margemBruta: number
  margemOperacional: number
  margemLiquida: number
  cmvReceita: number
  maoDeObraReceita: number
  opexReceita: number
}

export type CashDay = {
  date: string
  entradas: number
  saidas: number
  saldoInicial?: number
  saldoFinal?: number
  saldo?: number
  items?: ScheduleItem[]
}

export type AppAlert = {
  id: string
  kind: AlertKind
  group: AlertGroup
  companyId: string | null
  title: string
  detail: string
  link: string
}

export type Insight = {
  text: string
  tone: 'success' | 'warning' | 'danger' | 'info'
}
