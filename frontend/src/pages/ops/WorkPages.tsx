import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, CloudUpload, FileCode, PenLine, Plug, Search } from 'lucide-react'
import { Banner, Badge, Button, Card, Drawer, Empty, Field, Input, Kpi, Modal, PageHeader, Select, SummaryCard, Table, Td, Textarea, Toast, Tip, Kv } from '@/components/ui'
import { MONTHS, accounts, chartOfAccounts, classLabels, companies, costCenters, expectedEntries, mechanismLabels, reconLabels, reconTips } from '@/data/fixtures'
import { GastosPorCategoriaCard } from '@/components/charts'
import { accountLabel, buildInsights, categoryLabel, classStatus, gastoChartGroup, saidaMercadoriasHierarchy } from '@/domain/finance'
import {
  GASTO_GROUP_META,
  buildGastoCategoriaRows,
  buildIaCategoriaRows,
  conciliacaoCategoriaHref,
  conciliacaoFolhaHref,
  conciliacaoSubHref,
  filterSaidas,
  findLeaf,
  findSub,
  getLeavesForSub,
  getSubsForGroup,
  isGastoGroupId,
  summarizeTransactions,
  txInGastoGroup,
  type IaCategoriaRow,
} from '@/domain/reconCategories'
import { date, dateTime, money, monthLong, percent } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useApp, useScopedTx } from '@/state/AppContext'
import type { AuditEntry, Document, Transaction } from '@/domain/types'

function txHistory(t: Transaction, audit: AuditEntry[]): AuditEntry[] {
  const acc = accounts.find((a) => a.id === t.accountId)
  const imported: AuditEntry = {
    at: `${t.date}T06:12:00`,
    user: 'Sistema',
    action: 'Importação do extrato',
    entity: `Lançamento ${t.id}`,
    before: '—',
    after: `${accountLabel(t.accountId)} · ${t.description}`,
    reason: acc?.provider ? `Origem ${acc.provider}` : '',
  }
  const classified: AuditEntry | null = t.category
    ? {
        at: `${t.date}T08:30:00`,
        user: t.mechanism === 'manual' ? 'Gabriela Veríssimo' : 'Sistema',
        action: 'Classificação',
        entity: `Lançamento ${t.id}`,
        before: 'Sem classificação',
        after: `${categoryLabel(t.category)} · ${mechanismLabels[t.mechanism]} (${t.confidence}%)`,
        reason: '',
      }
    : null
  const recon: AuditEntry | null =
    t.recon !== 'pendente'
      ? {
          at: `${t.date}T09:15:00`,
          user: t.recon === 'sugestao' || t.recon === 'divergencia' || t.recon === 'duplicidade' ? 'Sistema' : 'Gabriela Veríssimo',
          action: 'Conciliação',
          entity: `Lançamento ${t.id}`,
          before: 'Pendente',
          after: reconLabels[t.recon],
          reason: '',
        }
      : null
  const extra = audit.filter((a) => a.entity.includes(t.id))
  return [imported, classified, recon, ...extra]
    .filter((row): row is AuditEntry => Boolean(row))
    .sort((a, b) => (a.at < b.at ? 1 : -1))
}

function reconTone(r: Transaction['recon']) {
  if (r === 'conciliado') return 'success' as const
  if (r === 'divergencia' || r === 'duplicidade') return 'danger' as const
  if (r === 'sugestao') return 'info' as const
  if (r === 'interna') return 'neutral' as const
  return 'warning' as const
}

function ReconStatusBadge({ recon }: { recon: Transaction['recon'] }) {
  const tip = reconTips[recon]
  return (
    <span className="inline-flex items-center gap-1">
      <Badge tone={reconTone(recon)}>{reconLabels[recon]}</Badge>
      {tip ? <Tip text={tip} /> : null}
    </span>
  )
}

const DOC_ORIGINS: Array<{ id: 'todos' | Document['origin']; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'Arquivo', label: 'Arquivo' },
  { id: 'XML', label: 'XML' },
  { id: 'Manual', label: 'Manual' },
  { id: 'ERP', label: 'ERP' },
]

function docStatusLabel(s: Document['status']) {
  if (s === 'inconsistente') return 'Com inconsistência'
  if (s === 'processado') return 'Processado'
  if (s === 'conciliado') return 'Conciliado'
  return 'Pendente'
}

function Dropzone({
  accept,
  hint,
  fileName,
  hover,
  error,
  onFile,
  onHover,
}: {
  accept: string
  hint: string
  fileName: string
  hover: boolean
  error: string
  onFile: (file: File) => void
  onHover: (v: boolean) => void
}) {
  return (
    <label
      className={cn(
        'block cursor-pointer rounded-[10px] border border-dashed px-5 py-8 text-center transition-colors',
        hover ? 'border-primaria bg-destaque' : 'border-borda-forte bg-superficie-2',
        error && 'border-erro',
      )}
      onDragEnter={(e) => { e.preventDefault(); onHover(true) }}
      onDragOver={(e) => { e.preventDefault(); onHover(true) }}
      onDragLeave={(e) => { e.preventDefault(); onHover(false) }}
      onDrop={(e) => {
        e.preventDefault()
        onHover(false)
        const file = e.dataTransfer.files[0]
        if (file) onFile(file)
      }}
    >
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-borda-forte bg-superficie text-primaria">
        <CloudUpload size={18} />
      </span>
      <p className="text-[14px] font-semibold">{fileName || 'Arraste o arquivo ou clique para escolher'}</p>
      <p className="t-apoio mt-1 text-texto-secundario">{hint}</p>
      <input
        type="file"
        className="sr-only"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
      {error ? <p className="t-body mt-3 text-erro">{error}</p> : null}
    </label>
  )
}

export function DocumentosPage() {
  const { documents, addDocument, scope } = useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const filtro = params.get('filtro') ?? 'todos'
  const [origem, setOrigem] = useState<'todos' | Document['origin']>('todos')
  const [q, setQ] = useState('')
  const [panel, setPanel] = useState<'add' | 'upload' | 'xml' | 'manual' | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [hover, setHover] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [sending, setSending] = useState(false)
  const [manualError, setManualError] = useState('')
  const [manual, setManual] = useState({
    number: '',
    supplier: '',
    amount: '',
    date: '',
    competence: '',
    companyId: scope === 'grupo' ? 'c1' : scope,
  })

  const scoped = documents.filter((d) => scope === 'grupo' || d.companyId === scope)
  const count = (status: string) => scoped.filter((d) => d.status === status).length
  const total = scoped.reduce((s, d) => s + Math.abs(d.amount), 0)
  const setFiltro = (v: string) => setParams(v === 'todos' ? {} : { filtro: v })

  const rows = scoped.filter((d) => {
    if (filtro !== 'todos' && d.status !== filtro) return false
    if (origem !== 'todos' && d.origin !== origem) return false
    if (q.trim()) {
      const hay = `${d.number} ${d.supplier} ${d.origin}`.toLowerCase()
      if (!hay.includes(q.trim().toLowerCase())) return false
    }
    return true
  })

  function closePanel() {
    setPanel(null)
    setFileName('')
    setFileError('')
    setHover(false)
    setSending(false)
    setManualError('')
  }

  function acceptFile(file: File, xml: boolean) {
    const ok = xml
      ? /\.xml$/i.test(file.name)
      : /\.(pdf|jpe?g|png)$/i.test(file.name)
    if (!ok) {
      setFileError('Este formato de arquivo não é aceito.')
      setFileName('')
      return
    }
    setFileError('')
    setFileName(file.name)
  }

  function importDoc(origin: Document['origin'], name?: string) {
    const id = 'd' + Date.now()
    addDocument({
      id,
      number: (name || 'NF ' + id.slice(-4)).replace(/\.[^.]+$/, ''),
      supplier: origin === 'XML' ? 'XML importado' : 'Arquivo importado',
      date: '2026-10-02',
      amount: -100,
      origin,
      status: 'pendente',
      companyId: scope === 'grupo' ? 'c1' : scope,
    })
    closePanel()
    setToast('Documento enviado. A leitura começa em seguida.')
  }

  function saveManual() {
    if (!manual.supplier.trim() || !manual.number.trim() || !manual.amount || !manual.date) {
      setManualError('Preencha os campos obrigatórios.')
      return
    }
    const id = 'd' + Date.now()
    addDocument({
      id,
      number: manual.number.trim(),
      supplier: manual.supplier.trim(),
      date: manual.date,
      amount: -Math.abs(Number(manual.amount)),
      origin: 'Manual',
      status: 'pendente',
      companyId: manual.companyId,
    })
    closePanel()
    navigate(`/documentos/${id}`)
  }

  const xml = panel === 'xml'

  return (
    <div>
      <PageHeader
        title="Documentos"
        subtitle="Gerencie, valide e acompanhe todos os documentos financeiros da empresa."
        actions={
          <>
            <Button variant="secondary" onClick={() => setPanel('upload')}>
              <CloudUpload size={16} />
              Importar arquivos
            </Button>
            <Button onClick={() => setPanel('add')}>Adicionar documento</Button>
          </>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Todos os documentos" value={scoped.length} hint={`${money(total)} em documentos`} tone="brand" active={filtro === 'todos'} onClick={() => setFiltro('todos')} />
        <SummaryCard label="Pendentes de revisão" value={count('pendente')} hint="Aguardando conferência" tone="warn" active={filtro === 'pendente'} onClick={() => setFiltro('pendente')} />
        <SummaryCard label="Com inconsistências" value={count('inconsistente')} hint="Exigem correção" tone="danger" active={filtro === 'inconsistente'} onClick={() => setFiltro('inconsistente')} />
        <SummaryCard label="Processados" value={count('processado')} hint="Leitura concluída" tone="brand" active={filtro === 'processado'} onClick={() => setFiltro('processado')} />
        <SummaryCard label="Conciliados" value={count('conciliado')} hint="Já vinculados ao banco" tone="ok" active={filtro === 'conciliado'} onClick={() => setFiltro('conciliado')} />
      </div>
      <Table
        columns={['Documento', 'Fornecedor', 'Data', 'Valor', 'Origem', 'Status']}
        empty={!rows.length ? <Empty>Nenhum documento encontrado com os filtros atuais.</Empty> : null}
        footer={<span>Exibindo {rows.length} de {scoped.length} documentos</span>}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-[220px] flex-1">
              <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
              <Input className="pl-9" placeholder="Buscar documento ou fornecedor" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {DOC_ORIGINS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOrigem(item.id)}
                  className={cn(
                    'inline-flex h-[29px] items-center rounded-full border px-3 text-[12.5px] font-medium',
                    origem === item.id ? 'border-primaria bg-primaria text-white' : 'border-borda-forte bg-superficie text-texto-secundario hover:text-texto',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {rows.map((d) => (
          <tr key={d.id}>
            <Td>
              <Link to={`/documentos/${d.id}`} className="font-semibold text-texto">
                {d.number}
              </Link>
            </Td>
            <Td>{d.supplier}</Td>
            <Td nowrap>{date(d.date)}</Td>
            <Td className="num font-semibold">{money(d.amount)}</Td>
            <Td>{d.origin}</Td>
            <Td>
              <Badge tone={d.status === 'inconsistente' ? 'danger' : d.status === 'conciliado' ? 'success' : d.status === 'processado' ? 'info' : 'warning'}>
                {docStatusLabel(d.status)}
              </Badge>
            </Td>
          </tr>
        ))}
      </Table>

      <Modal
        title="Adicionar documento"
        subtitle="Escolha como o documento entra na plataforma. A leitura é definida automaticamente."
        open={panel === 'add'}
        onClose={closePanel}
      >
        <div className="flex flex-col gap-2.5">
          {[
            { key: 'upload' as const, icon: CloudUpload, t: 'Importar arquivo', d: 'Envie PDF, JPG, PNG ou JPEG. Os dados são extraídos automaticamente.' },
            { key: 'manual' as const, icon: PenLine, t: 'Preencher manualmente', d: 'Cadastre o documento diretamente no sistema.' },
            { key: 'xml' as const, icon: FileCode, t: 'Importar XML', d: 'Importe o XML de um documento fiscal eletrônico.' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPanel(opt.key)}
              className="flex items-start gap-3.5 rounded-[10px] border border-borda-forte bg-superficie p-4 text-left hover:border-primaria hover:bg-destaque"
            >
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-destaque text-primaria">
                <opt.icon size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold">{opt.t}</span>
                <span className="t-apoio mt-0.5 block text-texto-secundario">{opt.d}</span>
              </span>
              <ChevronRight size={14} className="mt-3 text-faint" />
            </button>
          ))}
          <Link
            to="/configuracoes/erp"
            className="flex items-start gap-3.5 rounded-[10px] border border-borda-forte bg-superficie p-4 text-left hover:border-primaria hover:bg-destaque"
          >
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-destaque text-primaria">
              <Plug size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">Sincronizar ERP</span>
              <span className="t-apoio mt-0.5 block text-texto-secundario">Importe documentos diretamente do ERP conectado.</span>
            </span>
            <ChevronRight size={14} className="mt-3 text-faint" />
          </Link>
        </div>
      </Modal>

      <Modal
        title={xml ? 'Importar XML' : 'Importar arquivo'}
        subtitle={xml
          ? 'Importe o XML de um documento fiscal eletrônico.'
          : 'Envie PDF, JPG, PNG ou JPEG. O tipo é identificado e os dados extraídos automaticamente.'}
        open={panel === 'upload' || panel === 'xml'}
        onClose={closePanel}
        footer={
          <>
            <Button variant="secondary" onClick={closePanel}>Cancelar</Button>
            <Button
              disabled={sending || !fileName}
              onClick={() => {
                setSending(true)
                setTimeout(() => importDoc(xml ? 'XML' : 'Arquivo', fileName), 400)
              }}
            >
              {sending ? 'Enviando' : 'Enviar'}
            </Button>
          </>
        }
      >
        <Dropzone
          accept={xml ? '.xml' : '.pdf,.jpg,.jpeg,.png'}
          hint={xml ? 'Formato aceito: XML · até 5 MB' : 'Formatos aceitos: PDF, JPG, PNG, JPEG · até 20 MB'}
          fileName={fileName}
          hover={hover}
          error={fileError}
          onHover={setHover}
          onFile={(file) => acceptFile(file, xml)}
        />
        <button
          type="button"
          className="t-label mt-4 block"
          onClick={() => importDoc(xml ? 'XML' : 'Arquivo', xml ? 'nfe-demo.xml' : 'nfe-demo.pdf')}
        >
          Usar documento de demonstração
        </button>
      </Modal>

      <Modal
        title="Novo documento"
        subtitle="Cadastre o documento quando não houver arquivo em mãos."
        open={panel === 'manual'}
        onClose={closePanel}
        footer={
          <>
            <Button variant="secondary" onClick={closePanel}>Cancelar</Button>
            <Button onClick={saveManual}>Salvar</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fornecedor" error={manualError && !manual.supplier ? manualError : undefined}>
            <Input value={manual.supplier} onChange={(e) => { setManual({ ...manual, supplier: e.target.value }); setManualError('') }} />
          </Field>
          <Field label="CNPJ">
            <Select value={manual.companyId} onChange={(e) => setManual({ ...manual, companyId: e.target.value })}>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.fantasy} · {c.cnpj}</option>)}
            </Select>
          </Field>
          <Field label="Número">
            <Input value={manual.number} onChange={(e) => { setManual({ ...manual, number: e.target.value }); setManualError('') }} />
          </Field>
          <Field label="Emissão">
            <Input type="date" value={manual.date} onChange={(e) => { setManual({ ...manual, date: e.target.value }); setManualError('') }} />
          </Field>
          <Field label="Competência">
            <Input type="month" value={manual.competence} onChange={(e) => setManual({ ...manual, competence: e.target.value })} />
          </Field>
          <Field label="Valor">
            <Input type="number" value={manual.amount} onChange={(e) => { setManual({ ...manual, amount: e.target.value }); setManualError('') }} />
          </Field>
        </div>
        {manualError ? <p className="t-body mt-3 text-erro">{manualError}</p> : null}
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function DocumentoDetalhePage() {
  const { id } = useParams()
  const { documents } = useApp()
  const [hist, setHist] = useState(false)
  const doc = documents.find((d) => d.id === id)
  if (!doc) return <Empty>Nenhum documento neste recorte.</Empty>
  return (
    <div>
      <PageHeader title="Detalhe do documento" />
      {doc.status === 'inconsistente' ? <Banner tone="alert" className="mb-4">Valor do documento e do banco não conferem.</Banner> : null}
      <Card>
        <Kv items={[
          { label: 'Número', value: doc.number },
          { label: 'Fornecedor', value: doc.supplier },
          { label: 'Data', value: date(doc.date) },
          { label: 'Valor', value: money(doc.amount) },
          { label: 'Origem', value: doc.origin },
          { label: 'Status', value: doc.status },
          { label: 'Inconsistência', value: doc.note ?? '—' },
        ]} />
        <div className="mt-6 flex gap-2">
          {doc.txId ? <Link to={`/conciliacao/${doc.txId}`}><Button>Abrir conciliação</Button></Link> : null}
          <Button variant="secondary" onClick={() => setHist(true)}>Histórico</Button>
        </div>
      </Card>
      <Drawer title="Histórico do documento" open={hist} onClose={() => setHist(false)}>
        <p className="t-body">Importado em {date(doc.date)} · {doc.origin}</p>
      </Drawer>
    </div>
  )
}

export function DocumentoFormPage({ mode }: { mode: 'manual' | 'xml' }) {
  const { addDocument, scope } = useApp()
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [hover, setHover] = useState(false)
  const [fileName, setFileName] = useState('')
  const [form, setForm] = useState({
    number: '',
    supplier: '',
    amount: '',
    date: '',
    competence: '',
    companyId: scope === 'grupo' ? 'c1' : scope,
  })

  function save() {
    if (mode === 'xml' && !fileName) {
      setError('Este formato de arquivo não é aceito.')
      return
    }
    if (mode === 'manual' && (!form.supplier.trim() || !form.number.trim() || !form.amount || !form.date)) {
      setError('Preencha os campos obrigatórios.')
      return
    }
    const id = 'd' + Date.now()
    addDocument({
      id,
      number: mode === 'xml' ? fileName.replace(/\.[^.]+$/, '') : form.number.trim(),
      supplier: mode === 'xml' ? 'XML importado' : form.supplier.trim(),
      date: form.date || '2026-10-02',
      amount: -Math.abs(Number(form.amount) || 100),
      origin: mode === 'xml' ? 'XML' : 'Manual',
      status: 'pendente',
      companyId: form.companyId,
    })
    setToast(mode === 'xml' ? 'XML recebido. A leitura começa em seguida.' : 'Documento salvo.')
    setTimeout(() => navigate(`/documentos/${id}`), 600)
  }

  return (
    <div>
      <PageHeader title={mode === 'xml' ? 'Importar XML' : 'Novo documento'} />
      <Card className="max-w-xl space-y-4">
        {mode === 'xml' ? (
          <Dropzone
            accept=".xml"
            hint="Formato aceito: XML · até 5 MB"
            fileName={fileName}
            hover={hover}
            error={error}
            onHover={setHover}
            onFile={(file) => {
              if (!/\.xml$/i.test(file.name)) {
                setError('Este formato de arquivo não é aceito.')
                setFileName('')
                return
              }
              setError('')
              setFileName(file.name)
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fornecedor"><Input value={form.supplier} onChange={(e) => { setForm({ ...form, supplier: e.target.value }); setError('') }} /></Field>
            <Field label="CNPJ"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>{companies.map((c) => <option key={c.id} value={c.id}>{c.fantasy} · {c.cnpj}</option>)}</Select></Field>
            <Field label="Número"><Input value={form.number} onChange={(e) => { setForm({ ...form, number: e.target.value }); setError('') }} /></Field>
            <Field label="Emissão"><Input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); setError('') }} /></Field>
            <Field label="Competência"><Input type="month" value={form.competence} onChange={(e) => setForm({ ...form, competence: e.target.value })} /></Field>
            <Field label="Valor"><Input type="number" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError('') }} /></Field>
          </div>
        )}
        {error && mode === 'manual' ? <p className="t-body text-erro">{error}</p> : null}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/documentos')}>Cancelar</Button>
          <Button onClick={save}>{mode === 'xml' ? 'Enviar XML' : 'Salvar'}</Button>
        </div>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function ExtratosPage() {
  const { scope, txFilter, setTxFilter, audit } = useApp()
  const tx = useScopedTx()
  const q = txFilter
  const search = q.search.trim().toLowerCase()
  const contas = accounts.filter(
    (a) => (scope === 'grupo' || a.companyId === scope) && (!q.cnpj || a.companyId === q.cnpj) && (!q.banco || a.bank === q.banco),
  )
  const categorias = chartOfAccounts.filter((c) => c.parent && !chartOfAccounts.some((x) => x.parent === c.code))
  const origens = [...new Set(accounts.map((a) => a.provider))]
  const headActive = [q.periodo, q.cnpj, q.banco, q.conta, q.categoria, q.status, q.origem, q.tipo].some(Boolean)

  const rows = tx.filter((t) => {
    const acc = accounts.find((a) => a.id === t.accountId)
    if (q.periodo && t.competence !== q.periodo) return false
    if (q.cnpj && t.companyId !== q.cnpj) return false
    if (q.banco && acc?.bank !== q.banco) return false
    if (q.conta && t.accountId !== q.conta) return false
    if (q.categoria && t.category !== q.categoria) return false
    if (q.status && t.status !== q.status) return false
    if (q.origem && acc?.provider !== q.origem) return false
    if (q.tipo === 'entrada' && t.amount < 0) return false
    if (q.tipo === 'saida' && t.amount >= 0) return false
    if (search) {
      const hay = `${t.description} ${t.counterparty} ${t.document}`.toLowerCase()
      if (!hay.includes(search)) return false
    }
    return true
  })

  function clearHeadFilters() {
    setTxFilter({ periodo: '', cnpj: '', banco: '', conta: '', categoria: '', status: '', origem: '', tipo: '' })
  }

  return (
    <div>
      <PageHeader title="Extratos" subtitle="Transações bancárias normalizadas, sem misturar documentos fiscais.">
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borda px-4 py-3">
            <p className="t-label text-texto-secundario">Filtros</p>
            {headActive ? (
              <button type="button" className="t-label" onClick={clearHeadFilters}>
                Limpar filtros
              </button>
            ) : null}
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
            <Select value={q.periodo} onChange={(e) => setTxFilter({ periodo: e.target.value })} aria-label="Período">
              <option value="">Período</option>
              {MONTHS.map((m) => <option key={m} value={m}>{monthLong(m)}</option>)}
            </Select>
            <Select value={q.cnpj} onChange={(e) => setTxFilter({ cnpj: e.target.value, conta: '' })} aria-label="CNPJ">
              <option value="">CNPJ</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.fantasy}</option>)}
            </Select>
            <Select value={q.banco} onChange={(e) => setTxFilter({ banco: e.target.value, conta: '' })} aria-label="Banco">
              <option value="">Banco</option>
              {[...new Set(accounts.map((a) => a.bank))].map((b) => <option key={b}>{b}</option>)}
            </Select>
            <Select value={q.conta} onChange={(e) => setTxFilter({ conta: e.target.value })} aria-label="Conta">
              <option value="">Conta</option>
              {contas.map((a) => <option key={a.id} value={a.id}>{a.bank} {a.number}</option>)}
            </Select>
            <Select value={q.categoria} onChange={(e) => setTxFilter({ categoria: e.target.value })} aria-label="Categoria">
              <option value="">Categoria</option>
              {categorias.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
            <Select value={q.status} onChange={(e) => setTxFilter({ status: e.target.value })} aria-label="Status">
              <option value="">Status</option>
              {Object.entries(classLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select value={q.origem} onChange={(e) => setTxFilter({ origem: e.target.value })} aria-label="Origem">
              <option value="">Origem</option>
              {origens.map((o) => <option key={o}>{o}</option>)}
            </Select>
            <Select value={q.tipo} onChange={(e) => setTxFilter({ tipo: e.target.value })} aria-label="Tipo">
              <option value="">Tipo</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </Select>
          </div>
        </Card>
      </PageHeader>
      <Table
        columns={['Data', 'Descrição', 'Contraparte', 'Valor', 'Tipo', 'Status', 'Log']}
        empty={!rows.length ? <Empty>{tx.length ? 'Nenhuma transação neste filtro.' : 'O extrato ainda não foi importado.'}</Empty> : null}
        footer={<span>Exibindo {rows.length} de {tx.length} lançamentos</span>}
      >
        {rows.map((t) => {
          const last = txHistory(t, audit)[0]
          return (
            <tr key={t.id}>
              <Td nowrap>{date(t.date)}</Td>
              <Td><Link to={`/extratos/${t.id}`}>{t.description}</Link></Td>
              <Td>{t.counterparty || '—'}</Td>
              <Td className="num">{money(t.amount)}</Td>
              <Td>{t.amount >= 0 ? 'Entrada' : 'Saída'}</Td>
              <Td><ReconStatusBadge recon={t.recon} /></Td>
              <Td>
                {last ? (
                  <Link to={`/extratos/${t.id}`} className="block">
                    <span className="block font-medium text-texto">{last.action}</span>
                    <span className="t-apoio text-faint">{dateTime(last.at)} · {last.user}</span>
                  </Link>
                ) : '—'}
              </Td>
            </tr>
          )
        })}
      </Table>
    </div>
  )
}

export function ExtratoDetalhePage() {
  const { id } = useParams()
  const tx = useScopedTx()
  const { transactions, audit } = useApp()
  const [hist, setHist] = useState(false)
  const t = tx.find((x) => x.id === id) ?? transactions.find((x) => x.id === id)
  if (!t) return <Empty>Nenhuma transação neste filtro.</Empty>
  const acc = accounts.find((a) => a.id === t.accountId)
  const dup = t.duplicateOf ? transactions.find((x) => x.id === t.duplicateOf) : null
  const log = txHistory(t, audit)

  function LogList() {
    if (!log.length) return <Empty>Nenhuma alteração depois da importação.</Empty>
    return (
      <ol className="space-y-4">
        {log.map((row, i) => (
          <li key={row.at + row.action + i} className="border-b border-borda pb-4 last:border-0 last:pb-0">
            <p className="text-[14px] font-semibold">{row.action}</p>
            <p className="t-apoio mt-1 text-texto-secundario">{dateTime(row.at)} · {row.user}</p>
            <p className="t-body mt-2">
              <span className="text-faint">Antes </span>{row.before}
              <span className="text-faint"> → Depois </span>{row.after}
            </p>
            {row.reason ? <p className="t-apoio mt-1 text-texto-secundario">{row.reason}</p> : null}
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div>
      <PageHeader title={t.description} actions={<Button variant="ghost" onClick={() => setHist(true)}>Ver histórico</Button>} />
      {t.recon === 'duplicidade' && dup ? <Banner tone="alert" className="mb-4">Este lançamento parece repetir {dup.document} de {date(dup.date)}.</Banner> : null}
      {t.recon === 'interna' ? (
        <Banner tone="info" className="mb-4">
          <span className="inline-flex items-center gap-1.5">
            Movimentação interna
            <Tip text={reconTips.interna ?? ''} />
          </span>
        </Banner>
      ) : null}
      <Card>
        <Kv items={[
          { label: 'Banco', value: acc?.bank },
          { label: 'Conta', value: acc?.number },
          { label: 'Data', value: date(t.date) },
          { label: 'Valor', value: money(t.amount) },
          { label: 'Descrição', value: t.description },
          { label: 'Contraparte', value: t.counterparty || '—' },
          { label: 'Documento', value: t.document || '—' },
          { label: 'Origem', value: acc?.provider ?? '—' },
          { label: 'Categoria', value: categoryLabel(t.category) },
          { label: 'Centro de custo', value: t.costCenter ?? '—' },
        ]} />
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/ia/revisao/${t.id}`}><Button>Revisar classificação</Button></Link>
          <Link to={`/conciliacao/${t.id}`}><Button variant="secondary">Conciliação</Button></Link>
        </div>
      </Card>
      <Drawer title="Histórico da transação" open={hist} onClose={() => setHist(false)}>
        <LogList />
      </Drawer>
    </div>
  )
}

function ReconSectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-borda px-4 py-3.5">
      <h2 className="text-[15px] font-semibold text-texto">{title}</h2>
      <p className="t-apoio mt-0.5 text-texto-secundario">{subtitle}</p>
    </div>
  )
}

const RECON_EDITAVEL: Transaction['recon'][] = ['conciliado', 'pendente', 'sugestao', 'divergencia', 'duplicidade']

const CATEGORIAS_EDITAVEIS = chartOfAccounts.filter(
  (c) => !chartOfAccounts.some((ch) => ch.parent === c.code),
)

function ConciliacaoIaPorCategoriaTable({ saidas, rows }: { saidas: Transaction[]; rows: IaCategoriaRow[] }) {
  const { setRecon, classify } = useApp()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const porGrupo = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of saidas) {
      const g = gastoChartGroup(t.category)
      const list = map.get(g) ?? []
      list.push(t)
      map.set(g, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.date < b.date ? 1 : -1))
    }
    return map
  }, [saidas])

  return (
    <>
      <Table
        columns={['Categoria', 'Lançamentos', 'Valor', 'Participação', 'Conciliados', 'Pendentes', 'Parte IA', 'Confiança média', '']}
        empty={!rows.length ? <Empty>Nenhuma saída no período.</Empty> : undefined}
      >
        {rows.flatMap((row) => {
          const open = expanded === row.id
          const items = porGrupo.get(row.id) ?? []
          return [
            <tr key={row.id} className={cn(open && 'bg-superficie-2')}>
              <Td>
                <Link to={conciliacaoCategoriaHref(row.id)} className="font-medium text-primaria hover:underline">
                  {row.label}
                </Link>
              </Td>
              <Td className="num">{row.count}</Td>
              <Td className="num">{money(-row.amount)}</Td>
              <Td className="num">{percent(row.pct, 0)}</Td>
              <Td className="num">{row.conc}</Td>
              <Td className="num">{row.pend > 0 ? <span className="font-medium text-alerta-texto">{row.pend}</span> : row.pend}</Td>
              <Td>
                {row.ia}/{row.count}
                <span className="t-apoio text-faint"> ({row.iaPct}%)</span>
              </Td>
              <Td className="num">{row.conf}%</Td>
              <Td className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-[13px]"
                  onClick={() => setExpanded(open ? null : row.id)}
                >
                  {open ? 'Fechar' : 'Editar'}
                </Button>
              </Td>
            </tr>,
            open ? (
              <tr key={`${row.id}-edit`}>
                <td colSpan={9} className="border-b border-borda bg-superficie-2 px-4 py-4">
                  <p className="t-label mb-3 text-texto-secundario">Lançamentos · {row.label}</p>
                  <div className="overflow-x-auto rounded-[10px] border border-borda bg-superficie">
                    <table className="w-full min-w-[640px] border-collapse text-left">
                      <thead>
                        <tr>
                          {['Data', 'Descrição', 'Valor', 'Conciliação', 'Categoria'].map((h) => (
                            <th
                              key={h}
                              className="border-b border-borda bg-superficie-2 px-3 py-2 text-[11px] font-semibold tracking-[0.05em] text-faint uppercase"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((t) => (
                          <tr key={t.id}>
                            <td className="t-body whitespace-nowrap border-b border-borda px-3 py-2.5">{date(t.date)}</td>
                            <td className="t-body border-b border-borda px-3 py-2.5">
                              <Link to={`/extratos/${t.id}`} className="text-primaria hover:underline">{t.description}</Link>
                            </td>
                            <td className="t-body num border-b border-borda px-3 py-2.5">{money(t.amount)}</td>
                            <td className="border-b border-borda px-3 py-2.5">
                              <Select
                                className="min-w-[140px] text-[13px]"
                                value={t.recon}
                                aria-label={`Conciliação de ${t.description}`}
                                onChange={(e) => {
                                  const status = e.target.value as Transaction['recon']
                                  setRecon(t.id, status, 'Ajuste na conciliação por categoria')
                                  setToast('Conciliação atualizada.')
                                }}
                              >
                                {RECON_EDITAVEL.map((r) => (
                                  <option key={r} value={r}>{reconLabels[r]}</option>
                                ))}
                              </Select>
                            </td>
                            <td className="border-b border-borda px-3 py-2.5">
                              <Select
                                className="min-w-[200px] text-[13px]"
                                value={t.category ?? ''}
                                aria-label={`Categoria de ${t.description}`}
                                onChange={(e) => {
                                  const code = e.target.value || null
                                  classify(t.id, code, t.costCenter, 'Ajuste na conciliação por categoria', code ? 'alterada' : 'rejeitada')
                                  setToast('Categoria atualizada.')
                                }}
                              >
                                <option value="">Sem categoria</option>
                                {CATEGORIAS_EDITAVEIS.map((c) => (
                                  <option key={c.code} value={c.code}>{categoryLabel(c.code)}</option>
                                ))}
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            ) : null,
          ].filter(Boolean)
        })}
      </Table>
      <Toast message={toast} />
    </>
  )
}

export function ConciliacaoPage() {
  const tx = useScopedTx()
  const cards = [
    { label: 'Conciliados', n: tx.filter((t) => t.recon === 'conciliado').length, to: '/conciliacao/pendencias?estado=conciliado' },
    { label: 'Pendentes', n: tx.filter((t) => t.recon === 'pendente').length, to: '/conciliacao/pendencias?estado=pendente' },
    { label: 'Divergentes', n: tx.filter((t) => t.recon === 'divergencia').length, to: '/conciliacao/pendencias?estado=divergencia' },
    { label: 'Sugestões', n: tx.filter((t) => t.recon === 'sugestao').length, to: '/conciliacao/pendencias?estado=sugestao' },
    { label: 'Duplicidades', n: tx.filter((t) => t.recon === 'duplicidade').length, to: '/conciliacao/pendencias?estado=duplicidade' },
  ]

  const saidas = useMemo(() => filterSaidas(tx), [tx])
  const gastosPorCategoria = useMemo(() => buildGastoCategoriaRows(saidas), [saidas])
  const iaPorCategoria = useMemo(() => buildIaCategoriaRows(saidas), [saidas])

  const saidaMercadorias = useMemo(() => {
    const map = new Map<string, { h: ReturnType<typeof saidaMercadoriasHierarchy>; items: Transaction[] }>()
    for (const t of saidas.filter((x) => x.category?.startsWith('C.1'))) {
      const h = saidaMercadoriasHierarchy(t.category)
      const key = `${h.categoria}|${h.subcategoria}|${h.subsub}`
      const row = map.get(key) ?? { h, items: [] }
      row.items.push(t)
      map.set(key, row)
    }
    const order = ['Cerveja', 'Vinho', 'Água', 'Refrigerante', 'Suco', 'Leite', '—']
    return [...map.values()].sort((a, b) => {
      if (a.h.subcategoria !== b.h.subcategoria) return a.h.subcategoria.localeCompare(b.h.subcategoria, 'pt-BR')
      const ia = order.indexOf(a.h.subsub)
      const ib = order.indexOf(b.h.subsub)
      if (ia >= 0 && ib >= 0) return ia - ib
      return a.h.subsub.localeCompare(b.h.subsub, 'pt-BR')
    })
  }, [saidas])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conciliação"
        subtitle="Confirme correspondências no extrato; a IA agrupa saídas por categoria do plano de contas."
      />
      <div className="grid gap-4 md:grid-cols-5">
        {cards.map((c) => <Link key={c.label} to={c.to}><Kpi label={c.label} value={String(c.n)} /></Link>)}
      </div>

      <GastosPorCategoriaCard
        tip="Saídas do escopo no período, agrupadas por categoria do plano de contas."
        rows={gastosPorCategoria}
        categoryHref={conciliacaoCategoriaHref}
      />

      <Card className="overflow-hidden p-0">
        <ReconSectionTitle
          title="Conciliação com IA · por categoria"
          subtitle="Expanda uma categoria para editar conciliação e classificação de cada lançamento."
        />
        <ConciliacaoIaPorCategoriaTable saidas={saidas} rows={iaPorCategoria} />
      </Card>

      <Card className="overflow-hidden p-0">
        <ReconSectionTitle
          title="Conciliação de saída"
          subtitle="Ex.: categoria Alimentos → subcategoria Bebidas → Suco, Vinho, Água, Leite…"
        />
        <Table
          columns={['Categoria', 'Subcategoria', 'Sub-subcategoria', 'Lançamentos', 'Conciliados', 'Pendentes', 'Valor']}
          empty={!saidaMercadorias.length ? <Empty>Nenhuma saída de mercadorias neste recorte.</Empty> : undefined}
        >
          {saidaMercadorias.map(({ h, items }) => {
            const conc = items.filter((t) => t.recon === 'conciliado').length
            const pend = items.length - conc
            const total = items.reduce((s, t) => s + t.amount, 0)
            const sample = items.find((t) => t.recon !== 'conciliado') ?? items[0]
            return (
              <tr key={`${h.categoria}-${h.subcategoria}-${h.subsub}`}>
                <Td>{h.categoria}</Td>
                <Td>{h.subcategoria}</Td>
                <Td>{h.subsub}</Td>
                <Td className="num">{items.length}</Td>
                <Td className="num">{conc}</Td>
                <Td className="num">
                  {pend ? (
                    sample ? (
                      <Link to={`/conciliacao/${sample.id}`} className="font-medium text-alerta-texto">{pend}</Link>
                    ) : (
                      pend
                    )
                  ) : (
                    0
                  )}
                </Td>
                <Td className="num">{money(total)}</Td>
              </tr>
            )
          })}
        </Table>
      </Card>
    </div>
  )
}

export function ConciliacaoCategoriaDrillPage() {
  const { grupo, sub, folha } = useParams()
  const tx = useScopedTx()
  const { documents } = useApp()
  const groupId = grupo ?? ''

  const saidasGrupo = useMemo(
    () => filterSaidas(tx).filter((t) => txInGastoGroup(t, groupId)),
    [tx, groupId],
  )

  const subDef = sub ? findSub(groupId, sub) : undefined
  const leafDef = sub && folha ? findLeaf(groupId, sub, folha) : undefined

  if (!isGastoGroupId(groupId)) return <Empty>Categoria não encontrada.</Empty>
  if (sub && !subDef) return <Empty>Subcategoria não encontrada.</Empty>
  if (folha && sub && !leafDef) return <Empty>Classificação não encontrada.</Empty>

  const meta = GASTO_GROUP_META[groupId]

  function Crumbs() {
    return (
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-[13px] text-texto-secundario" aria-label="Navegação">
        <Link to="/conciliacao" className="font-medium text-primaria hover:underline">Conciliação</Link>
        <ChevronRight size={14} className="text-faint" aria-hidden />
        {sub && subDef ? (
          <Link to={conciliacaoCategoriaHref(groupId)} className="font-medium text-primaria hover:underline">{meta.label}</Link>
        ) : (
          <span className="font-medium text-texto">{meta.label}</span>
        )}
        {sub && subDef ? (
          <>
            <ChevronRight size={14} className="text-faint" aria-hidden />
            {folha && leafDef ? (
              <Link to={conciliacaoSubHref(groupId, sub)} className="font-medium text-primaria hover:underline">{subDef.label}</Link>
            ) : (
              <span className="font-medium text-texto">{subDef.label}</span>
            )}
          </>
        ) : null}
        {folha && leafDef ? (
          <>
            <ChevronRight size={14} className="text-faint" aria-hidden />
            <span className="font-medium text-texto">{leafDef.label}</span>
          </>
        ) : null}
      </nav>
    )
  }

  if (folha && leafDef && subDef) {
    const items = saidasGrupo.filter((t) => leafDef.match(t.category))
    const stats = summarizeTransactions(items)
    return (
      <div>
        <PageHeader title={leafDef.label} subtitle={`${subDef.label} · ${meta.label}`} />
        <Crumbs />
        <p className="t-apoio mb-4 text-texto-secundario">
          {stats.count} lançamentos · {money(-stats.amount)} · {stats.pend} pendente(s) de conciliação
        </p>
        <Table
          columns={['Data', 'Descrição', 'Valor', 'Conciliação', 'Nota fiscal']}
          empty={!items.length ? <Empty>Nenhum lançamento nesta classificação.</Empty> : undefined}
        >
          {items.map((t) => {
            const doc = documents.find((d) => d.txId === t.id)
            return (
              <tr key={t.id}>
                <Td nowrap>{date(t.date)}</Td>
                <Td><Link to={`/extratos/${t.id}`}>{t.description}</Link></Td>
                <Td className="num">{money(t.amount)}</Td>
                <Td><ReconStatusBadge recon={t.recon} /></Td>
                <Td>
                  {doc ? (
                    <Link to={`/documentos/${doc.id}`}>{doc.number}</Link>
                  ) : t.document ? (
                    <Link to={`/documentos?busca=${encodeURIComponent(t.document)}`}>{t.document}</Link>
                  ) : (
                    <Link to={`/conciliacao/${t.id}`} className="text-primaria">Conciliar</Link>
                  )}
                </Td>
              </tr>
            )
          })}
        </Table>
      </div>
    )
  }

  if (sub && subDef) {
    const leaves = getLeavesForSub(groupId, sub)
    const rows = leaves
      .map((leaf) => {
        const items = saidasGrupo.filter((t) => leaf.match(t.category))
        return { leaf, ...summarizeTransactions(items) }
      })
      .filter((r) => r.count > 0)
      .sort((a, b) => b.amount - a.amount)

    return (
      <div>
        <PageHeader title={subDef.label} subtitle={meta.label} />
        <Crumbs />
        <Table
          columns={['Classificação', 'Lançamentos', 'Valor', 'Conciliados', 'Pendentes']}
          empty={!rows.length ? <Empty>Nenhum lançamento nesta subcategoria.</Empty> : undefined}
        >
          {rows.map(({ leaf, count, amount, conc, pend }) => (
            <tr key={leaf.slug}>
              <Td>
                <Link to={conciliacaoFolhaHref(groupId, sub, leaf.slug)} className="font-medium text-primaria hover:underline">
                  {leaf.label}
                </Link>
              </Td>
              <Td className="num">{count}</Td>
              <Td className="num">{money(-amount)}</Td>
              <Td className="num">{conc}</Td>
              <Td className="num">{pend > 0 ? <span className="font-medium text-alerta-texto">{pend}</span> : pend}</Td>
            </tr>
          ))}
        </Table>
      </div>
    )
  }

  const subs = getSubsForGroup(groupId)
  const rows = subs
    .map((s) => {
      const items = saidasGrupo.filter((t) => s.match(t.category))
      return { sub: s, ...summarizeTransactions(items) }
    })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div>
      <PageHeader title={meta.label} subtitle="Escolha uma subcategoria para ver classificações e notas fiscais." />
      <Crumbs />
      <Table
        columns={['Subcategoria', 'Lançamentos', 'Valor', 'Conciliados', 'Pendentes']}
        empty={!rows.length ? <Empty>Nenhuma saída nesta categoria.</Empty> : undefined}
      >
        {rows.map(({ sub: s, count, amount, conc, pend }) => (
          <tr key={s.slug}>
            <Td>
              <Link to={conciliacaoSubHref(groupId, s.slug)} className="font-medium text-primaria hover:underline">
                {s.label}
              </Link>
            </Td>
            <Td className="num">{count}</Td>
            <Td className="num">{money(-amount)}</Td>
            <Td className="num">{conc}</Td>
            <Td className="num">{pend > 0 ? <span className="font-medium text-alerta-texto">{pend}</span> : pend}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function ConciliacaoListaPage() {
  const tx = useScopedTx()
  const [params] = useSearchParams()
  const estado = params.get('estado') ?? 'pendente'
  const rows = tx.filter((t) => t.recon === estado)
  return (
    <div>
      <PageHeader title="Pendências de conciliação" />
      <Table columns={['Lançamento', 'Transação bancária', 'Valor', 'Status']} empty={!rows.length ? <Empty>Nenhuma pendência neste período.</Empty> : null}>
        {rows.map((t) => {
          const exp = expectedEntries.find((e) => e.txId === t.id)
          return (
            <tr key={t.id}>
              <Td>{exp?.description ?? t.description}</Td>
              <Td><Link to={`/conciliacao/${t.id}`}>{t.counterparty || t.description}</Link></Td>
              <Td className="num">{money(t.amount)}</Td>
              <Td><ReconStatusBadge recon={t.recon} /></Td>
            </tr>
          )
        })}
      </Table>
    </div>
  )
}

export function ConciliacaoDetalhePage() {
  const { id } = useParams()
  const { setRecon, transactions } = useApp()
  const [manual, setManual] = useState(false)
  const [reason, setReason] = useState('')
  const [hist, setHist] = useState(false)
  const t = transactions.find((x) => x.id === id)
  const exp = expectedEntries.find((e) => e.txId === id)
  if (!t) return <Empty>Nenhuma pendência neste período.</Empty>
  return (
    <div>
      <PageHeader title="Par de conciliação" />
      {t.recon === 'sugestao' ? <Banner className="mb-4">Sugestão de correspondência. Confira valor, data e contraparte antes de aceitar.</Banner> : null}
      {t.recon === 'divergencia' ? <Banner tone="alert" className="mb-4">{exp?.reason ?? 'Valor, data ou contraparte não conferem.'}</Banner> : null}
      {t.recon === 'duplicidade' ? <Banner tone="alert" className="mb-4">Este lançamento já tem um par com o mesmo documento e valor.</Banner> : null}
      <Card className="space-y-4">
        <Kv items={[
          { label: 'Transação', value: t.description },
          { label: 'Contraparte', value: t.counterparty || '—' },
          { label: 'Valor', value: money(t.amount) },
          { label: 'Lançamento', value: exp ? `${exp.description} · ${money(exp.amount)}` : 'Sem lançamento vinculado' },
        ]} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setRecon(t.id, 'conciliado')}>Aceitar</Button>
          <Button variant="secondary" onClick={() => setRecon(t.id, 'pendente', 'Sugestão rejeitada')}>Rejeitar</Button>
          <Button variant="secondary" onClick={() => setManual(true)}>Conciliar manualmente</Button>
          <Button variant="ghost" onClick={() => setHist(true)}>Histórico</Button>
        </div>
      </Card>
      <Modal title="Conciliação manual" open={manual} onClose={() => setManual(false)} footer={<><Button variant="secondary" onClick={() => setManual(false)}>Cancelar</Button><Button onClick={() => { if (!reason.trim()) return; setRecon(t.id, 'conciliado', reason); setManual(false) }}>Confirmar</Button></>}>
        <Field label="Motivo" error={!reason && manual ? 'Informe o motivo da alteração.' : undefined}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </Modal>
      <Drawer title="Histórico de conciliação" open={hist} onClose={() => setHist(false)}>
        <p className="t-body">Status atual: {reconLabels[t.recon]}</p>
      </Drawer>
    </div>
  )
}

export function IaHomePage() {
  const tx = useScopedTx()
  const { config } = useApp()
  const cards = [
    { label: 'Classificadas automaticamente', n: tx.filter((t) => classStatus(t, config) === 'automatica').length, to: '/ia/fila' },
    { label: 'Aguardando revisão', n: tx.filter((t) => classStatus(t, config) === 'sugerida').length, to: '/ia/fila' },
    { label: 'Baixa confiança', n: tx.filter((t) => classStatus(t, config) === 'revisao' || !t.category).length, to: '/ia/fila' },
    { label: 'Reclassificadas', n: tx.filter((t) => t.mechanism === 'manual').length, to: '/ia/aprendizado' },
  ]
  return (
    <div>
      <PageHeader title="Classificação" />
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => <Link key={c.label} to={c.to}><Kpi label={c.label} value={String(c.n)} /></Link>)}
      </div>
      <div className="mt-6 flex gap-4">
        <Link className="t-label" to="/ia/aprendizado">Histórico de aprendizado</Link>
        <Link className="t-label" to="/ia/insights">Insights</Link>
      </div>
    </div>
  )
}

export function IaFilaPage() {
  const tx = useScopedTx()
  const { config } = useApp()
  const rows = tx.filter((t) => {
    const s = classStatus(t, config)
    return s === 'sugerida' || s === 'revisao' || s === 'nao_classificada'
  })
  return (
    <div>
      <PageHeader title="Fila de revisão" />
      <Table columns={['Contraparte', 'Valor', 'Categoria', 'Confiança']} empty={!rows.length ? <Empty>Nenhuma classificação aguardando revisão.</Empty> : null}>
        {rows.map((t) => (
          <tr key={t.id}>
            <Td><Link to={`/ia/revisao/${t.id}`}>{t.counterparty || t.description}</Link></Td>
            <Td className="num">{money(t.amount)}</Td>
            <Td>{categoryLabel(t.category)}</Td>
            <Td>{t.confidence}%</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function IaRevisaoPage() {
  const { id } = useParams()
  const { classify, transactions } = useApp()
  const navigate = useNavigate()
  const t = transactions.find((x) => x.id === id)
  const [open, setOpen] = useState<'reclass' | 'motivo' | null>(null)
  const [cat, setCat] = useState(t?.category ?? '')
  const [cc, setCc] = useState(t?.costCenter ?? '')
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState<'aceita' | 'alterada' | 'rejeitada'>('alterada')
  if (!t) return <Empty>Nenhuma classificação aguardando revisão.</Empty>

  function ask(decision: 'aceita' | 'alterada' | 'rejeitada') {
    setPending(decision)
    setOpen('motivo')
  }

  return (
    <div>
      <PageHeader title="Revisão de classificação" />
      <Card className="space-y-4">
        <Kv items={[
          { label: 'Contraparte', value: t.counterparty || t.description },
          { label: 'Valor', value: money(t.amount) },
          { label: 'Categoria', value: categoryLabel(t.category) },
          { label: 'Centro de custo', value: t.costCenter ?? '—' },
          { label: 'Confiança', value: `${t.confidence}% · ${mechanismLabels[t.mechanism]}` },
        ]} />
        <div className="flex gap-2">
          <Button onClick={() => ask('aceita')}>Aceitar</Button>
          <Button variant="secondary" onClick={() => setOpen('reclass')}>Reclassificar</Button>
          <Button variant="ghost" onClick={() => ask('rejeitada')}>Rejeitar</Button>
        </div>
      </Card>
      <Modal title="Reclassificar" open={open === 'reclass'} onClose={() => setOpen(null)} footer={<><Button variant="secondary" onClick={() => setOpen(null)}>Cancelar</Button><Button onClick={() => { setOpen('motivo'); setPending('alterada') }}>Continuar</Button></>}>
        <div className="space-y-4">
          <Field label="Categoria"><Select value={cat} onChange={(e) => setCat(e.target.value)}>{chartOfAccounts.filter((c) => c.parent).map((c) => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}</Select></Field>
          <Field label="Centro de custo"><Select value={cc} onChange={(e) => setCc(e.target.value)}><option value="">—</option>{costCenters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        </div>
      </Modal>
      <Modal title="Motivo da alteração" open={open === 'motivo'} onClose={() => setOpen(null)} footer={<><Button variant="secondary" onClick={() => setOpen(null)}>Cancelar</Button><Button onClick={() => { if (!reason.trim()) return; classify(t.id, cat, cc, reason, pending); navigate('/ia/fila') }}>Confirmar</Button></>}>
        <Field label="Motivo" error={!reason ? 'Informe o motivo da alteração.' : undefined}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <p className="t-apoio mt-2">O motivo entrou na auditoria.</p>
      </Modal>
    </div>
  )
}

export function IaAprendizadoPage() {
  const { audit } = useApp()
  const rows = audit.filter((a) => a.action.includes('Classificação') || a.action.includes('Reclassificação'))
  return (
    <div>
      <PageHeader title="Histórico de aprendizado" />
      <Table columns={['Quando', 'Quem', 'O que mudou']} empty={!rows.length ? <Empty>Nenhum ajuste registrado.</Empty> : null}>
        {rows.map((a, i) => (
          <tr key={i}><Td nowrap>{a.at.replace('T', ' ')}</Td><Td>{a.user}</Td><Td>{a.before} → {a.after}</Td></tr>
        ))}
      </Table>
    </div>
  )
}

export function IaInsightsPage() {
  const { schedule, scope } = useApp()
  const list = useMemo(() => buildInsights(scope, schedule), [scope, schedule])
  const [params, setParams] = useSearchParams()
  const selected = params.get('item')
  const open = list.some((i) => i.text === selected) ? selected : null

  function close() {
    const next = new URLSearchParams(params)
    next.delete('item')
    setParams(next, { replace: true })
  }

  return (
    <div>
      <PageHeader title="Insights" />
      <div className="space-y-3">
        {list.map((i) => (
          <Card key={i.text}>
            <Link className="t-body block text-left" to={`/ia/insights?item=${encodeURIComponent(i.text)}`}>{i.text}</Link>
          </Card>
        ))}
      </div>
      <Drawer title="Detalhe do insight" open={!!open} onClose={close}>
        <p className="t-body">{open}</p>
        <Link className="t-label mt-4 block" to="/alertas">Abrir alerta</Link>
        <Link className="t-label mt-2 block" to="/analytics">Abrir analytics</Link>
      </Drawer>
    </div>
  )
}
