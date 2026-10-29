import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, Card, Drawer, Empty, Field, Kpi, Modal, PageHeader, Select, Table, Td, Textarea, Kv } from '@/views/ui'
import { chartOfAccounts, costCenters, mechanismLabels } from '@/models/fixtures'
import { buildInsights, categoryLabel, classStatus } from '@/models/domain/finance'
import { money } from '@/lib/format'
import { useAppViewModel, useScopedTx } from '@/viewmodels/AppViewModel'

export function IaHomePage() {
  const tx = useScopedTx()
  const { config } = useAppViewModel()
  const cards = [
    { label: 'Classificadas automaticamente', n: tx.filter((t) => classStatus(t, config) === 'automatica').length, to: '/ia/fila' },
    { label: 'Aguardando revisão', n: tx.filter((t) => classStatus(t, config) === 'sugerida').length, to: '/ia/fila' },
    { label: 'Baixa confiança', n: tx.filter((t) => classStatus(t, config) === 'revisao' || !t.category).length, to: '/ia/fila' },
    { label: 'Reclassificadas', n: tx.filter((t) => t.mechanism === 'manual').length, to: '/ia/aprendizado' },
  ]
  return (
    <div>
      <PageHeader kicker="Operação" title="Classificação" subtitle="Revisão humana das categorias sugeridas pelas regras e pelo histórico." />
      <div className="grid gap-3 md:grid-cols-4">
        {cards.map((c) => <Kpi key={c.label} label={c.label} value={String(c.n)} to={c.to} />)}
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
  const { config } = useAppViewModel()
  const rows = tx.filter((t) => {
    const s = classStatus(t, config)
    return s === 'sugerida' || s === 'revisao' || s === 'nao_classificada'
  })
  return (
    <div>
      <PageHeader kicker="Operação" title="Fila de revisão" subtitle="Itens que ainda precisam de confirmação humana." />
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
  const { classify, transactions } = useAppViewModel()
  const navigate = useNavigate()
  const t = transactions.find((x) => x.id === id)
  const [open, setOpen] = useState(null)
  const [cat, setCat] = useState(t?.category ?? '')
  const [cc, setCc] = useState(t?.costCenter ?? '')
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState('alterada')
  if (!t) return <Empty>Nenhuma classificação aguardando revisão.</Empty>

  function ask(decision) {
    setPending(decision)
    setOpen('motivo')
  }

  return (
    <div>
      <PageHeader kicker="Operação" title="Revisão de classificação" />
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
  const { audit } = useAppViewModel()
  const rows = audit.filter((a) => a.action.includes('Classificação') || a.action.includes('Reclassificação'))
  return (
    <div>
      <PageHeader kicker="Operação" title="Histórico de aprendizado" subtitle="Ajustes confirmados que passam a orientar sugestões futuras." />
      <Table columns={['Quando', 'Quem', 'O que mudou']} empty={!rows.length ? <Empty>Nenhum ajuste registrado.</Empty> : null}>
        {rows.map((a, i) => (
          <tr key={i}><Td nowrap>{a.at.replace('T', ' ')}</Td><Td>{a.user}</Td><Td>{a.before} → {a.after}</Td></tr>
        ))}
      </Table>
    </div>
  )
}

export function IaInsightsPage() {
  const { schedule, scope } = useAppViewModel()
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
      <PageHeader kicker="Operação" title="Insights" subtitle="Leituras a partir das movimentações classificadas. Não são recomendações de investimento." />
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

