import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Empty, Field, Input, PageHeader, Select, Table, Td, Kv, Toast } from '@/views/ui'
import { companies } from '@/models/fixtures'
import { date, money } from '@/lib/format'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

import { billsOf } from '@/views/features/contas/billsOf'

export function ContasPagarPage() {
  const { schedule, scope } = useAppViewModel()
  const rows = billsOf('pagar', schedule, scope)
  return (
    <div>
      <PageHeader kicker="Operação" title="Contas a pagar" actions={<div className="flex gap-2"><Link to="/contas-a-pagar/nova"><Button>Nova conta a pagar</Button></Link><Link to="/agenda"><Button variant="secondary">Agenda</Button></Link></div>} />
      <Table columns={['Fornecedor', 'Vencimento', 'Valor', 'CNPJ', 'Status']} empty={!rows.length ? <Empty>Nenhuma conta a pagar neste recorte.</Empty> : null} footer={<span>Exibindo {rows.length} títulos</span>}>
        {rows.map((s) => (
          <tr key={s.id}>
            <Td><Link to={`/contas-a-pagar/${s.id}`}>{s.counterparty}</Link></Td>
            <Td nowrap>{date(s.date)}</Td>
            <Td className="num">{money(Math.abs(s.amount))}</Td>
            <Td>{companies.find((c) => c.id === s.companyId)?.code}</Td>
            <Td><Badge tone={s.status === 'vencido' ? 'danger' : 'warning'}>{s.status === 'aberto' ? 'Em aberto' : s.status === 'pago' ? 'Paga' : 'Vencida'}</Badge></Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function ContasReceberPage() {
  const { schedule, scope } = useAppViewModel()
  const rows = billsOf('receber', schedule, scope)
  return (
    <div>
      <PageHeader kicker="Operação" title="Contas a receber" actions={<Link to="/contas-a-receber/nova"><Button>Nova conta a receber</Button></Link>} />
      <Table columns={['Cliente', 'Vencimento', 'Valor', 'CNPJ', 'Status']} empty={!rows.length ? <Empty>Nenhuma conta a receber neste recorte.</Empty> : null} footer={<span>Exibindo {rows.length} títulos</span>}>
        {rows.map((s) => (
          <tr key={s.id}>
            <Td><Link to={`/contas-a-receber/${s.id}`}>{s.counterparty}</Link></Td>
            <Td nowrap>{date(s.date)}</Td>
            <Td className="num">{money(s.amount)}</Td>
            <Td>{companies.find((c) => c.id === s.companyId)?.code}</Td>
            <Td><Badge>Em aberto</Badge></Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function ContaDetalhePage({ kind }) {
  const { id } = useParams()
  const { schedule } = useAppViewModel()
  const item = schedule.find((s) => s.id === id)
  if (!item) return <Empty>Nenhuma conta neste recorte.</Empty>
  return (
    <div>
      <PageHeader kicker="Operação" title={kind === 'pagar' ? 'Conta a pagar' : 'Conta a receber'} actions={kind === 'pagar' ? <Link to={`/contas-a-pagar/${id}/editar`}><Button>Editar</Button></Link> : null} />
      <Card>
        <Kv items={[
          { label: kind === 'pagar' ? 'Fornecedor' : 'Cliente', value: item.counterparty },
          { label: 'Valor', value: money(Math.abs(item.amount)) },
          { label: 'Vencimento', value: date(item.date) },
          { label: 'Competência', value: item.competence },
          { label: 'Status', value: 'Em aberto' },
          { label: 'CNPJ', value: companies.find((c) => c.id === item.companyId)?.cnpj },
          { label: 'Lançamento vinculado', value: item.description },
        ]} />
      </Card>
    </div>
  )
}

export function ContaFormPage({ kind, mode }) {
  const { addBill, updateBill, schedule } = useAppViewModel()
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = schedule.find((s) => s.id === id)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    counterparty: existing?.counterparty ?? '',
    amount: existing ? String(Math.abs(existing.amount)) : '',
    date: existing?.date ?? '',
    competence: existing?.competence ?? '',
    companyId: existing?.companyId ?? 'c1',
  })
  return (
    <div>
      <PageHeader kicker="Operação" title={mode === 'editar' ? 'Editar conta a pagar' : kind === 'pagar' ? 'Nova conta a pagar' : 'Nova conta a receber'} />
      <Card className="max-w-xl space-y-4">
        <Field label={kind === 'pagar' ? 'Fornecedor' : 'Cliente'}><Input value={form.counterparty} onChange={(e) => setForm({ ...form, counterparty: e.target.value })} /></Field>
        <Field label="Valor"><Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Vencimento"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Competência"><Input type="month" value={form.competence} onChange={(e) => setForm({ ...form, competence: e.target.value })} /></Field>
        <Field label="CNPJ"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>{companies.map((c) => <option key={c.id} value={c.id}>{c.fantasy}</option>)}</Select></Field>
        {error ? <p className="t-body text-erro">{error}</p> : null}
        <Button onClick={() => {
          if (!form.counterparty || !form.amount || !form.date) { setError('Informe o valor.'); return }
          const item = {
            id: existing?.id ?? 's' + Date.now(),
            companyId: form.companyId,
            date: form.date,
            competence: form.competence || form.date.slice(0, 7),
            kind,
            description: form.counterparty,
            counterparty: form.counterparty,
            amount: (kind === 'pagar' ? -1 : 1) * Number(form.amount),
            category: kind === 'pagar' ? 'O.5' : 'R.1.1',
            status: 'aberto',
          }
          if (existing) updateBill(item)
          else addBill(item)
          setToast('Conta salva.')
          setTimeout(() => navigate(kind === 'pagar' ? '/contas-a-pagar' : '/contas-a-receber'), 500)
        }}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function AgendaPage() {
  const { schedule, scope } = useAppViewModel()
  const rows = schedule.filter((s) => scope === 'grupo' || s.companyId === scope)
  return (
    <div>
      <PageHeader kicker="Operação" title="Agenda financeira" subtitle="Vencimentos de contas a pagar e a receber no recorte atual." />
      <Table columns={['Data', 'Tipo', 'Descrição', 'Valor']} empty={!rows.length ? <Empty>Nenhum vencimento neste recorte.</Empty> : null}>
        {rows.map((s) => (
          <tr key={s.id}>
            <Td nowrap>{date(s.date)}</Td>
            <Td>{s.kind === 'pagar' ? 'Pagar' : 'Receber'}</Td>
            <Td><Link to={s.kind === 'pagar' ? `/contas-a-pagar/${s.id}` : `/contas-a-receber/${s.id}`}>{s.description}</Link></Td>
            <Td className="num">{money(s.amount)}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
