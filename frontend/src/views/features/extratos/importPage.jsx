import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banner, Button, Card, Empty, Field, Input, PageHeader, Select, Table, Td, Toast } from '@/views/ui'
import { Dropzone } from '@/views/features/documentos/components/Dropzone'
import { companies } from '@/models/fixtures'
import { formatFromName, markDuplicates, parseByFormat, validateImportFile } from '@/models/domain/statementImport'
import { money } from '@/lib/format'
import { useAppViewModel } from '@/viewmodels/AppViewModel'


const ACCEPT = '.ofx,.qfx,.csv,.pdf,.txt,.xml,application/ofx,text/csv,application/pdf,text/plain,application/xml,text/xml'

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
    reader.readAsText(file)
  })
}

export function ImportarExtratoPage() {
  const { accounts, scope, transactions, addTransactions, session } = useAppViewModel()
  const navigate = useNavigate()
  const scopedAccounts = accounts.filter((a) => scope === 'grupo' || a.companyId === scope)
  const [accountId, setAccountId] = useState(scopedAccounts[0]?.id ?? '')
  const [hover, setHover] = useState(false)
  const [fileName, setFileName] = useState('')
  const [format, setFormat] = useState(null)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [rows, setRows] = useState([])
  const [toast, setToast] = useState(null)
  const [manual, setManual] = useState({ date: '', description: '', amount: '', counterparty: '', document: '' })

  const account = accounts.find((a) => a.id === accountId)
  const invalid = rows.some((r) => r.missing.length > 0)

  const summary = useMemo(() => ({
    count: rows.length,
    entradas: rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0),
    saidas: rows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0),
    dups: rows.filter((r) => r.possibleDuplicate).length,
  }), [rows])

  async function onFile(file) {
    const problem = validateImportFile(file)
    if (problem) {
      setError(problem)
      setFileName('')
      setRows([])
      return
    }
    const fmt = formatFromName(file.name)
    if (!fmt) return
    setError('')
    setFileName(file.name)
    setFormat(fmt)
    try {
      const text = await readFile(file)
      const parsed = parseByFormat(fmt, text)
      const marked = markDuplicates(parsed.rows, transactions.filter((t) => t.accountId === accountId))
      setRows(marked)
      setWarning(parsed.warning ?? '')
    } catch {
      setError('Não foi possível ler o conteúdo do arquivo.')
      setRows([])
    }
  }

  function updateRow(id, patch) {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r
      const next = { ...r, ...patch }
      const missing = []
      if (!next.date) missing.push('data')
      if (!next.description.trim()) missing.push('descrição')
      if (!Number.isFinite(next.amount) || next.amount === 0) missing.push('valor')
      return { ...next, missing }
    }))
  }

  function addManualRow() {
    const amount = Number(manual.amount.replace(',', '.'))
    if (!manual.date || !manual.description.trim() || !Number.isFinite(amount) || amount === 0) {
      setError('Preencha data, descrição e valor para a linha manual.')
      return
    }
    const row = {
      id: `m-${Date.now()}`,
      date: manual.date,
      description: manual.description.trim(),
      counterparty: manual.counterparty.trim(),
      document: manual.document.trim(),
      amount,
      fitId: '',
      confidence: 100,
      missing: [],
    }
    setRows((prev) => markDuplicates([...prev, row], transactions.filter((t) => t.accountId === accountId)))
    setManual({ date: '', description: '', amount: '', counterparty: '', document: '' })
    setError('')
  }

  function confirm() {
    if (!account) {
      setError('Selecione a conta de referência.')
      return
    }
    if (!rows.length) {
      setError('Não há movimentações para importar.')
      return
    }
    if (invalid) {
      setError('Corrija os campos obrigatórios antes de confirmar.')
      return
    }
    const now = Date.now()
    const txs = rows.map((r, i) => ({
      id: `imp-${now}-${i}`,
      sourceId: r.fitId || `IMP-${now}-${i}`,
      accountId: account.id,
      companyId: account.companyId,
      date: r.date,
      competence: r.date.slice(0, 7),
      description: r.description,
      counterparty: r.counterparty,
      document: r.document,
      amount: r.amount,
      category: null,
      costCenter: null,
      confidence: r.confidence,
      mechanism: 'manual',
      recon: r.possibleDuplicate ? 'duplicidade' : 'pendente',
      intercompany: false,
      source: 'import',
      importId: `imp-${now}`,
      fitId: r.fitId || undefined,
      ocrConfidence: format === 'pdf' ? r.confidence : undefined,
    }))
    addTransactions(txs, {
      id: `imp-${now}`,
      fileName: fileName || 'entrada-manual',
      format: format ?? 'txt',
      accountId: account.id,
      at: new Date().toISOString().slice(0, 19),
      user: session?.name ?? 'Sistema',
      count: txs.length,
      errors: warning ? [warning] : [],
      status: warning ? 'parcial' : 'concluida',
    })
    setToast('Importação registrada. As movimentações entram como pendentes de conciliação.')
    setTimeout(() => navigate('/extratos'), 600)
  }

  return (
    <div>
      <PageHeader
        kicker="Extratos"
        title="Importar extrato"
        subtitle="OFX, CSV, PDF, TXT e XML no mesmo modelo. Extensão válida não garante extrato válido. PDF usa extração de texto no navegador, não OCR de produção."
        actions={<Link to="/extratos"><Button variant="secondary">Voltar aos extratos</Button></Link>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Conta de referência">
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {scopedAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.bank} {a.number} · {companies.find((c) => c.id === a.companyId)?.fantasy}</option>
              ))}
            </Select>
          </Field>
          <Dropzone
            accept={ACCEPT}
            hint="OFX, CSV, PDF, TXT ou XML · até 8 MB"
            fileName={fileName}
            hover={hover}
            error={error}
            onFile={onFile}
            onHover={setHover}
          />
          {warning ? <Banner tone="alert">{warning}</Banner> : null}
          {format ? <p className="t-apoio">Formato identificado: {format.toUpperCase()}</p> : null}
        </Card>
        <Card className="space-y-4">
          <h2 className="t-h3">Linha manual</h2>
          <p className="t-apoio">Disponível mesmo quando o arquivo não puder ser lido.</p>
          <Field label="Data"><Input type="date" value={manual.date} onChange={(e) => setManual({ ...manual, date: e.target.value })} /></Field>
          <Field label="Descrição"><Input value={manual.description} onChange={(e) => setManual({ ...manual, description: e.target.value })} /></Field>
          <Field label="Valor (negativo = saída)"><Input value={manual.amount} onChange={(e) => setManual({ ...manual, amount: e.target.value })} /></Field>
          <Field label="Contraparte"><Input value={manual.counterparty} onChange={(e) => setManual({ ...manual, counterparty: e.target.value })} /></Field>
          <Field label="Documento"><Input value={manual.document} onChange={(e) => setManual({ ...manual, document: e.target.value })} /></Field>
          <Button variant="secondary" onClick={addManualRow}>Adicionar à prévia</Button>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="t-h2 mb-3">Prévia ({summary.count})</h2>
        {summary.count ? (
          <p className="t-apoio mb-3">
            Entradas {money(summary.entradas)} · saídas {money(summary.saidas)}
            {summary.dups ? ` · ${summary.dups} possível(is) duplicidade(s)` : ''}
          </p>
        ) : null}
        <Table
          columns={['Data', 'Descrição', 'Contraparte', 'Documento', 'Valor', 'Confiança', '']}
          empty={!rows.length ? <Empty>Envie um arquivo ou inclua uma linha manual.</Empty> : null}
        >
          {rows.map((r) => (
            <tr key={r.id}>
              <Td><Input type="date" value={r.date} onChange={(e) => updateRow(r.id, { date: e.target.value })} /></Td>
              <Td><Input value={r.description} onChange={(e) => updateRow(r.id, { description: e.target.value })} /></Td>
              <Td><Input value={r.counterparty} onChange={(e) => updateRow(r.id, { counterparty: e.target.value })} /></Td>
              <Td><Input value={r.document} onChange={(e) => updateRow(r.id, { document: e.target.value })} /></Td>
              <Td><Input value={String(r.amount)} onChange={(e) => updateRow(r.id, { amount: Number(e.target.value) })} /></Td>
              <Td>
                {r.confidence}%
                {r.missing.length ? <span className="block t-apoio text-erro">Falta: {r.missing.join(', ')}</span> : null}
                {r.possibleDuplicate ? <span className="block t-apoio text-alerta-texto">Possível duplicidade</span> : null}
              </Td>
              <Td><Button variant="ghost" onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}>Remover</Button></Td>
            </tr>
          ))}
        </Table>
        <div className="mt-4 flex gap-2">
          <Button onClick={confirm} disabled={!rows.length}>Confirmar importação</Button>
          <Button variant="secondary" onClick={() => { setRows([]); setFileName(''); setWarning(''); setFormat(null) }}>Limpar prévia</Button>
        </div>
        {error ? <p className="t-body mt-3 text-erro">{error}</p> : null}
      </div>
      <Toast message={toast} />
    </div>
  )
}
