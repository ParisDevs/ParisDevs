import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LineCard } from '@/components/charts'
import { Banner, Drawer, Empty, Kpi, PageHeader, Tabs } from '@/components/ui'
import { cashObserved } from '@/domain/banking'
import { addDays, balance, cashProjected } from '@/domain/finance'
import { money } from '@/lib/format'
import { useApp } from '@/state/AppContext'

export function FluxoPage() {
  const { scope, schedule, accounts, transactions } = useApp()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') ?? 'realizado'
  const [day, setDay] = useState<string | null>(null)
  const realized = cashObserved(transactions, scope, accounts)
  const projected = cashProjected(scope, schedule, 30, accounts)
  const last = realized[realized.length - 1]
  const first = realized[0]
  const projDay = projected.find((d) => d.date === day)
  const realDay = realized.find((d) => d.date === day)

  return (
    <div>
      <PageHeader
        kicker="Relatórios"
        title="Fluxo de caixa"
        subtitle="O realizado usa o saldo das contas conectadas. O projetado usa títulos em aberto. Transferências internas não entram como receita."
      />
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
            <Kpi label="Saldo final" value={money(last?.saldoFinal ?? balance(scope, accounts))} />
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
      <PageHeader kicker="Operação" title="Calendário financeiro" subtitle="Vencimentos no recorte selecionado." />
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
