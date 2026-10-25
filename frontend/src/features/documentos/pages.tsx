import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, CloudUpload, FileCode, PenLine, Search } from 'lucide-react'
import { Banner, Badge, Button, Card, Drawer, Empty, Field, Input, Modal, PageHeader, Select, SummaryCard, Table, Td, Toast, Kv } from '@/components/ui'
import { companies } from '@/data/fixtures'
import { date, money } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useApp } from '@/state/AppContext'
import type { Document } from '@/domain/types'
import { Dropzone } from '@/features/documentos/components/Dropzone'


const DOC_ORIGINS: Array<{ id: 'todos' | Document['origin']; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'Arquivo', label: 'Arquivo' },
  { id: 'XML', label: 'XML' },
  { id: 'Manual', label: 'Manual' },
  { id: 'OCR', label: 'OCR' },
]

function docStatusLabel(s: Document['status']) {
  if (s === 'inconsistente') return 'Com inconsistência'
  if (s === 'processado') return 'Processado'
  if (s === 'conciliado') return 'Conciliado'
  return 'Pendente'
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
        kicker="Operação"
        title="Documentos"
        subtitle="Gerencie, valide e acompanhe os documentos financeiros da empresa."
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
            to="/extratos/importar"
            className="flex items-start gap-3.5 rounded-[10px] border border-borda-forte bg-superficie p-4 text-left hover:border-primaria hover:bg-destaque"
          >
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-destaque text-primaria">
              <CloudUpload size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">Importar extrato bancário</span>
              <span className="t-apoio mt-0.5 block text-texto-secundario">OFX, CSV, PDF, TXT ou XML, com revisão antes de registrar.</span>
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
      <PageHeader kicker="Documentos" title="Detalhe do documento" />
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
      <PageHeader kicker="Documentos" title={mode === 'xml' ? 'Importar XML' : 'Novo documento'} />
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
