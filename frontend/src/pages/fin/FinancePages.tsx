import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BarCard, LineCard } from '@/components/charts'
import { Banner, Badge, Button, Card, Drawer, Empty, Field, Input, Kpi, Modal, PageHeader, Select, Table, Td, Tabs, Kv, Toast } from '@/components/ui'
import { MONTHS, chartOfAccounts, classificationRules, companies, costCenters } from '@/data/fixtures'
import { addDays, balance, buildAlerts, cashProjected, cashRealized, categoryLabel, lastMonth, statementFor } from '@/domain/finance'
import { date, money, month, percent } from '@/lib/format'
import { useApp } from '@/state/AppContext'
import type { ScheduleItem } from '@/domain/types'

export function PlanoPage() {
  const [open, setOpen] = useState<'nova' | 'editar' | 'sub' | 'import' | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const roots = chartOfAccounts.filter((c) => !c.parent)
  return (
    <div>
      <PageHeader title="Plano de contas" actions={<div className="flex gap-2"><Button onClick={() => setOpen('nova')}>Nova categoria</Button><Button variant="secondary" onClick={() => setOpen('import')}>Importar</Button></div>} />
      {roots.map((root) => (
        <Card key={root.code} className="mb-4">
          <h2 className="t-h2 mb-3">{root.name}</h2>
          {chartOfAccounts.filter((c) => c.parent === root.code).map((c) => (
            <div key={c.code} className="border-b border-borda py-2">
              <button type="button" className="t-body" onClick={() => setOpen('editar')}>{c.name}</button>
              <div className="ml-4">
                {chartOfAccounts.filter((s) => s.parent === c.code).map((s) => (
                  <p key={s.code} className="t-apoio py-1">{s.name}</p>
                ))}
              </div>
            </div>
          ))}
        </Card>
      ))}
      <Modal title="Nova categoria" open={open === 'nova'} onClose={() => setOpen(null)} footer={<><Button variant="secondary" onClick={() => setOpen(null)}>Cancelar</Button><Button onClick={() => { setToast('Categoria salva.'); setOpen(null) }}>Salvar</Button></>}>
        <div className="space-y-4"><Field label="Nome"><Input /></Field><Field label="Grupo"><Select><option>Receita</option><option>Custo</option><option>Despesa operacional</option><option>Despesa financeira</option></Select></Field></div>
      </Modal>
      <Modal title="Editar categoria" open={open === 'editar'} onClose={() => setOpen(null)} footer={<Button onClick={() => setOpen(null)}>Salvar</Button>}>
        <Field label="Nome"><Input defaultValue="Vendas" /></Field>
        <Button variant="ghost" className="mt-3" onClick={() => setOpen('sub')}>Nova subcategoria</Button>
      </Modal>
      <Modal title="Nova subcategoria" open={open === 'sub'} onClose={() => setOpen(null)} footer={<Button onClick={() => setOpen(null)}>Salvar</Button>}>
        <Field label="Nome"><Input /></Field>
      </Modal>
      <Modal title="Importar plano de contas" open={open === 'import'} onClose={() => setOpen(null)} footer={<Button onClick={() => { setToast('Plano importado.'); setOpen(null) }}>Importar</Button>}>
        <Field label="Arquivo"><Input type="file" /></Field>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function CentrosPage() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <PageHeader title="Centros de custo" actions={<Button onClick={() => setOpen(true)}>Novo centro de custo</Button>} />
      <Table columns={['Nome', 'Tipo', 'Empresa']}>
        {costCenters.map((c) => <tr key={c.id}><Td>{c.name}</Td><Td>{c.type}</Td><Td>{companies.find((x) => x.id === c.companyId)?.fantasy ?? 'Grupo'}</Td></tr>)}
      </Table>
      <Modal title="Novo centro de custo" open={open} onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>Salvar</Button>}>
        <Field label="Nome"><Input /></Field>
      </Modal>
    </div>
  )
}

export function RegrasClassPage() {
  return (
    <div>
      <PageHeader title="Regras de classificação" />
      <Table columns={['Campo', 'Operador', 'Valor', 'Categoria', 'Acertos']}>
        {classificationRules.map((r) => <tr key={r.id}><Td>{r.field}</Td><Td>{r.operator}</Td><Td>{r.value}</Td><Td>{categoryLabel(r.category)}</Td><Td>{r.hits}</Td></tr>)}
      </Table>
    </div>
  )
}

function billsOf(kind: 'pagar' | 'receber', items: ScheduleItem[], scope: string) {
  return items.filter((s) => s.kind === kind && (scope === 'grupo' || s.companyId === scope))
}

export function ContasPagarPage() {
  const { schedule, scope } = useApp()
  const rows = billsOf('pagar', schedule, scope)
  return (
    <div>
      <PageHeader title="Contas a pagar" actions={<div className="flex gap-2"><Link to="/contas-a-pagar/nova"><Button>Nova conta a pagar</Button></Link><Link to="/agenda"><Button variant="secondary">Agenda</Button></Link></div>} />
      <Table columns={['Fornecedor', 'Vencimento', 'Valor', 'CNPJ', 'Status']} empty={!rows.length ? <Empty>Nenhuma conta a pagar neste recorte.</Empty> : null}>
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
  const { schedule, scope } = useApp()
  const rows = billsOf('receber', schedule, scope)
  return (
    <div>
      <PageHeader title="Contas a receber" actions={<Link to="/contas-a-receber/nova"><Button>Nova conta a receber</Button></Link>} />
      <Table columns={['Cliente', 'Vencimento', 'Valor', 'CNPJ', 'Status']} empty={!rows.length ? <Empty>Nenhuma conta a receber neste recorte.</Empty> : null}>
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

export function ContaDetalhePage({ kind }: { kind: 'pagar' | 'receber' }) {
  const { id } = useParams()
  const { schedule } = useApp()
  const item = schedule.find((s) => s.id === id)
  if (!item) return <Empty>Nenhuma conta neste recorte.</Empty>
  return (
    <div>
      <PageHeader title={kind === 'pagar' ? 'Conta a pagar' : 'Conta a receber'} actions={kind === 'pagar' ? <Link to={`/contas-a-pagar/${id}/editar`}><Button>Editar</Button></Link> : null} />
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

export function ContaFormPage({ kind, mode }: { kind: 'pagar' | 'receber'; mode: 'criar' | 'editar' }) {
  const { addBill, updateBill, schedule } = useApp()
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = schedule.find((s) => s.id === id)
  const [toast, setToast] = useState<string | null>(null)
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
      <PageHeader title={mode === 'editar' ? 'Editar conta a pagar' : kind === 'pagar' ? 'Nova conta a pagar' : 'Nova conta a receber'} />
      <Card className="max-w-xl space-y-4">
        <Field label={kind === 'pagar' ? 'Fornecedor' : 'Cliente'}><Input value={form.counterparty} onChange={(e) => setForm({ ...form, counterparty: e.target.value })} /></Field>
        <Field label="Valor"><Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Vencimento"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Competência"><Input type="month" value={form.competence} onChange={(e) => setForm({ ...form, competence: e.target.value })} /></Field>
        <Field label="CNPJ"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>{companies.map((c) => <option key={c.id} value={c.id}>{c.fantasy}</option>)}</Select></Field>
        {error ? <p className="t-body text-erro">{error}</p> : null}
        <Button onClick={() => {
          if (!form.counterparty || !form.amount || !form.date) { setError('Informe o valor.'); return }
          const item: ScheduleItem = {
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
  const { schedule, scope } = useApp()
  const rows = schedule.filter((s) => scope === 'grupo' || s.companyId === scope)
  return (
    <div>
      <PageHeader title="Agenda financeira" />
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

export function FluxoPage() {
  const { scope, schedule } = useApp()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') ?? 'realizado'
  const [day, setDay] = useState<string | null>(null)
  const realized = cashRealized(scope)
  const projected = cashProjected(scope, schedule)
  const last = realized[realized.length - 1]
  const first = realized[0]
  const projDay = projected.find((d) => d.date === day)
  const realDay = realized.find((d) => d.date === day)

  return (
    <div>
      <PageHeader title="Fluxo de caixa">
        <p className="t-body text-texto-secundario">Realizado mostra o dinheiro que já entrou ou saiu. Projetado mostra o saldo daqui para a frente.</p>
      </PageHeader>
      <Tabs value={aba} onChange={(v) => setParams({ aba: v })} items={[{ id: 'realizado', label: 'Realizado' }, { id: 'projetado', label: 'Projetado' }]} />
      <div className="mt-4 flex gap-3">
        <Link className="t-label" to="/calendario">Calendário</Link>
      </div>
      {aba === 'realizado' ? (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <Kpi label="Saldo inicial" value={money(first?.saldoInicial ?? 0)} />
            <Kpi label="Entradas" value={money(realized.reduce((s, d) => s + d.entradas, 0))} />
            <Kpi label="Saídas" value={money(realized.reduce((s, d) => s + d.saidas, 0))} />
            <Kpi label="Saldo final" value={money(last?.saldoFinal ?? balance(scope))} />
          </div>
          <div className="mt-4">
            <LineCard title="Caixa realizado" data={realized.map((d) => ({ label: d.date.slice(8), saldo: d.saldoFinal ?? 0 }))} series={[{ key: 'saldo', name: 'Saldo', color: '#0B5D4E' }]} />
          </div>
        </>
      ) : (
        <>
          <Banner className="mt-4">Projeção a partir das contas a pagar e a receber em aberto. Não mistura competência da DRE.</Banner>
          <div className="mt-4">
            <LineCard title="Caixa projetado" data={projected.map((d) => ({ label: d.date.slice(5), saldo: d.saldo ?? 0 }))} series={[{ key: 'saldo', name: 'Saldo', color: '#1F6F8B' }]} />
          </div>
        </>
      )}
      <Drawer title="Movimento do dia" open={!!day} onClose={() => setDay(null)}>
        <p className="t-body">{day}</p>
        <p className="t-apoio mt-2">{money((projDay ?? realDay)?.entradas ?? 0)} entrada · {money((projDay ?? realDay)?.saidas ?? 0)} saída</p>
      </Drawer>
    </div>
  )
}

export function CalendarioPage() {
  const { schedule, scope } = useApp()
  const [day, setDay] = useState<string | null>(null)
  const days = Array.from({ length: 31 }, (_, i) => addDays('2026-10-01', i)).filter((d) => d.startsWith('2026-10'))
  const items = schedule.filter((s) => (scope === 'grupo' || s.companyId === scope) && s.date === day)
  return (
    <div>
      <PageHeader title="Calendário financeiro" />
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <button key={d} type="button" className="rounded-[8px] border border-borda bg-superficie p-2 text-left t-apoio" onClick={() => setDay(d)}>
            {d.slice(8)}
          </button>
        ))}
      </div>
      <Drawer title="Movimento do dia" open={!!day} onClose={() => setDay(null)}>
        {items.length ? items.map((s) => <p key={s.id} className="t-body mb-2">{s.description} · {money(s.amount)}</p>) : <Empty>Nenhum movimento neste dia.</Empty>}
      </Drawer>
    </div>
  )
}

const DRE_LINES: { key: keyof ReturnType<typeof statementFor>; label: string; result?: boolean }[] = [
  { key: 'receitaBruta', label: 'Receita bruta' },
  { key: 'deducoes', label: '(−) Deduções' },
  { key: 'receitaLiquida', label: '= Receita líquida', result: true },
  { key: 'custos', label: '(−) Custos' },
  { key: 'lucroBruto', label: '= Lucro bruto', result: true },
  { key: 'despesasOperacionais', label: '(−) Despesas operacionais' },
  { key: 'resultadoOperacional', label: '= Resultado operacional', result: true },
  { key: 'financeiras', label: '(−) Despesas financeiras' },
  { key: 'resultadoAntesTributos', label: '= Resultado antes dos tributos', result: true },
  { key: 'tributos', label: '(−) Tributos sobre o lucro' },
  { key: 'resultadoLiquido', label: '= Resultado líquido', result: true },
]

export function DrePage() {
  const { scope, period } = useApp()
  const st = statementFor(period, scope)
  const [line, setLine] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="DRE gerencial">
        <Banner>Visão gerencial do período. Não substitui a DRE contábil.</Banner>
        {scope === 'grupo' ? <p className="t-apoio mt-2">Consolidada do grupo. Transferências entre CNPJs foram eliminadas.</p> : <p className="t-apoio mt-2">DRE desta empresa no período.</p>}
      </PageHeader>
      <Card>
        {DRE_LINES.map((l) => (
          <button key={l.key} type="button" onClick={() => setLine(l.label)} className={`flex w-full justify-between border-b border-borda px-2 py-3 ${l.result ? 't-h3' : 't-body'}`}>
            <span>{l.label}</span>
            <span className="num">{money(Number(st[l.key]))}</span>
          </button>
        ))}
      </Card>
      <div className="mt-4"><Link className="t-label" to="/dre/comparativa">Comparar períodos</Link></div>
      <Drawer title="Detalhe da linha" open={!!line} onClose={() => setLine(null)}>
        <p className="t-body">{line}</p>
        <Link className="t-label mt-4 block" to="/extratos">Ver lançamentos</Link>
      </Drawer>
    </div>
  )
}

export function DreComparativaPage() {
  const { scope } = useApp()
  const a = statementFor('2026-08', scope)
  const b = statementFor('2026-09', scope)
  return (
    <div>
      <PageHeader title="DRE comparativa" />
      <Table columns={['Linha', 'ago/26', 'set/26', 'Variação']}>
        {DRE_LINES.map((l) => {
          const va = Number(a[l.key])
          const vb = Number(b[l.key])
          return <tr key={l.key}><Td>{l.label}</Td><Td className="num">{money(va)}</Td><Td className="num">{money(vb)}</Td><Td className="num">{percent(((vb - va) / (va || 1)) * 100)}</Td></tr>
        })}
      </Table>
    </div>
  )
}

export function AnalyticsPage() {
  const { scope } = useApp()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') ?? 'evolucao'
  const series = MONTHS.map((m) => {
    const s = statementFor(m, scope)
    return { label: month(m), receita: s.receitaBruta, despesa: s.despesasTotais, resultado: s.resultadoLiquido, margem: s.margemLiquida * 100, cmv: s.cmvReceita * 100, mao: s.maoDeObraReceita * 100, opex: s.opexReceita * 100 }
  })
  return (
    <div>
      <PageHeader title="Analytics" />
      <Tabs value={aba} onChange={(v) => setParams({ aba: v })} items={[{ id: 'evolucao', label: 'Evolução' }, { id: 'empresas', label: 'Empresas' }, { id: 'indicadores', label: 'Indicadores' }, { id: 'periodos', label: 'Períodos' }]} />
      <div className="mt-4">
        {aba === 'evolucao' ? <LineCard title="Evolução mensal" data={series} series={[{ key: 'receita', name: 'Receita', color: '#0B5D4E' }, { key: 'despesa', name: 'Despesa', color: '#8B9B98' }, { key: 'resultado', name: 'Resultado', color: '#0E7C56' }]} /> : null}
        {aba === 'empresas' ? (
          <Table columns={['CNPJ', 'Receita', 'Despesa', 'Resultado', 'Margem']}>
            {companies.map((c) => {
              const s = statementFor(lastMonth(), c.id)
              return <tr key={c.id}><Td>{c.fantasy}</Td><Td className="num">{money(s.receitaBruta)}</Td><Td className="num">{money(s.despesasTotais)}</Td><Td className="num">{money(s.resultadoLiquido)}</Td><Td className="num">{percent(s.margemLiquida * 100)}</Td></tr>
            })}
          </Table>
        ) : null}
        {aba === 'indicadores' ? (
          <Table columns={['Mês', 'Margem', 'Mercadorias / receita', 'Mão de obra / receita', 'Opex / receita']}>
            {series.map((r) => <tr key={r.label}><Td>{r.label}</Td><Td>{percent(r.margem)}</Td><Td>{percent(r.cmv)}</Td><Td>{percent(r.mao)}</Td><Td>{percent(r.opex)}</Td></tr>)}
          </Table>
        ) : null}
        {aba === 'periodos' ? <BarCard title="Comparação de períodos" data={[{ label: 'ago', receita: statementFor('2026-08', scope).receitaBruta }, { label: 'set', receita: statementFor('2026-09', scope).receitaBruta }]} series={[{ key: 'receita', name: 'Receita', color: '#0B5D4E' }]} /> : null}
      </div>
    </div>
  )
}

export function AlertasPage() {
  const { transactions, schedule, config, scope } = useApp()
  const [params, setParams] = useSearchParams()
  const filtro = params.get('filtro') ?? 'todos'
  const [open, setOpen] = useState<string | null>(null)
  const alerts = buildAlerts(config, transactions, schedule).filter((a) => scope === 'grupo' || !a.companyId || a.companyId === scope)
  const rows = alerts.filter((a) => filtro === 'todos' || a.kind === filtro)
  const groups = [
    { id: 'critico', label: 'Crítico' },
    { id: 'atencao', label: 'Atenção' },
    { id: 'informacao', label: 'Informação' },
  ] as const
  const selected = alerts.find((a) => a.id === open)
  return (
    <div>
      <PageHeader title="Alertas" />
      <Tabs value={filtro} onChange={(v) => setParams(v === 'todos' ? {} : { filtro: v })} items={[{ id: 'todos', label: 'Todos' }, { id: 'financeiro', label: 'Financeiros' }, { id: 'conciliacao', label: 'Conciliação' }, { id: 'classificacao', label: 'Classificação' }, { id: 'integracao', label: 'Integração' }]} />
      {groups.map((g) => {
        const list = rows.filter((a) => a.group === g.id)
        return (
          <section key={g.id} className="mt-6">
            <h2 className="t-h2 mb-3">{g.label}</h2>
            <Card>
              {list.length ? list.map((a) => (
                <button key={a.id} type="button" className="t-body mb-3 block w-full border-b border-borda pb-3 text-left" onClick={() => setOpen(a.id)}>
                  {a.title}
                </button>
              )) : <Empty>Nenhum alerta em aberto.</Empty>}
            </Card>
          </section>
        )
      })}
      <Drawer title="Detalhe do alerta" open={!!selected} onClose={() => setOpen(null)}>
        {selected ? (
          <>
            <Kv items={[
              { label: 'Severidade', value: selected.group === 'critico' ? 'Crítico' : selected.group === 'atencao' ? 'Atenção' : 'Informação' },
              { label: 'Descrição', value: selected.detail },
              { label: 'CNPJ', value: companies.find((c) => c.id === selected.companyId)?.fantasy ?? 'Grupo' },
            ]} />
            <Link className="t-label mt-4 block" to={selected.link}>Abrir origem</Link>
          </>
        ) : null}
      </Drawer>
    </div>
  )
}
