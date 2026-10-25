import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, Drawer, Empty, PageHeader, Tabs, Kv } from '@/components/ui'
import { companies } from '@/data/fixtures'
import { buildAlerts } from '@/domain/finance'
import { useApp } from '@/state/AppContext'

export function AlertasPage() {
  const { transactions, schedule, config, scope, accounts } = useApp()
  const [params, setParams] = useSearchParams()
  const filtro = params.get('filtro') ?? 'todos'
  const [open, setOpen] = useState<string | null>(null)
  const alerts = buildAlerts(config, transactions, schedule, accounts).filter((a) => {
    if (scope !== 'grupo' && a.companyId && a.companyId !== scope) return false
    if (!config.notifications.inApp) return false
    if (a.kind === 'financeiro' && !config.notifications.kinds.financeiro) return false
    if (a.kind === 'conciliacao' && !config.notifications.kinds.conciliacao) return false
    if (a.kind === 'classificacao' && !config.notifications.kinds.classificacao) return false
    if (a.kind === 'integracao' && !config.notifications.kinds.integracao) return false
    return true
  })
  const rows = alerts.filter((a) => filtro === 'todos' || a.kind === filtro)
  const groups = [
    { id: 'critico', label: 'Crítico' },
    { id: 'atencao', label: 'Atenção' },
    { id: 'informacao', label: 'Informação' },
  ] as const
  const selected = alerts.find((a) => a.id === open)
  return (
    <div>
      <PageHeader kicker="Análise" title="Alertas" subtitle="Eventos financeiros, de conciliação e de conexão neste recorte." />
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

