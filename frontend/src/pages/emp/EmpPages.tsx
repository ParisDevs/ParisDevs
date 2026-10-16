import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banner, Button, Card, Drawer, Empty, Kpi, PageHeader, Table, Td } from '@/components/ui'
import { GROUP_NAME, accounts, companies } from '@/data/fixtures'
import { money, percent } from '@/lib/format'
import { lastMonth, statementFor } from '@/domain/finance'
import { useApp, useDashboardNumbers } from '@/state/AppContext'

export function EmpSelectPage() {
  const { setScope } = useApp()
  const navigate = useNavigate()
  const [choice, setChoice] = useState('grupo')

  return (
    <div>
      <PageHeader title="Escolha o contexto" />
      <Card className="space-y-4">
        <h2 className="t-h2">{GROUP_NAME}</h2>
        <label className="t-body flex items-center gap-2">
          <input type="radio" name="ctx" checked={choice === 'grupo'} onChange={() => setChoice('grupo')} />
          Todas as empresas
        </label>
        {companies.map((c) => (
          <label key={c.id} className="t-body flex items-center gap-2">
            <input type="radio" name="ctx" checked={choice === c.id} onChange={() => setChoice(c.id)} />
            {c.name} · {c.cnpj}
            {c.unit ? <span className="t-apoio text-texto-secundario">Filial / unidade: {c.unit}</span> : null}
          </label>
        ))}
        {!companies.length ? <Empty>Nenhuma empresa vinculada à sua conta.</Empty> : null}
        <Button
          onClick={() => {
            setScope(choice)
            navigate('/')
          }}
        >
          Continuar
        </Button>
      </Card>
    </div>
  )
}

export function EmpGroupPage() {
  const { st, alerts } = useDashboardNumbers()
  const period = lastMonth()
  return (
    <div>
      <PageHeader title="Visão do grupo" />
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Receita" value={money(st.receitaBruta)} />
        <Kpi label="Despesas" value={money(st.despesasTotais)} />
        <Kpi label="Resultado" value={money(st.resultadoLiquido)} />
        <Kpi label="Caixa" value={money(st.receitaLiquida)} />
      </div>
      <h2 className="t-h2 mt-6 mb-4">CNPJs</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {companies.map((c) => {
          const s = statementFor(period, c.id)
          return (
            <Link key={c.id} to={`/empresas`} className="block">
              <Card>
                <h3 className="t-h3">{c.fantasy}</h3>
                <p className="t-apoio text-texto-secundario">{c.cnpj}</p>
                <p className="t-kpi mt-3">{money(s.resultadoLiquido)}</p>
              </Card>
            </Link>
          )
        })}
      </div>
      <h2 className="t-h2 mt-6 mb-4">Alertas</h2>
      <Card>
        {alerts.slice(0, 4).map((a) => (
          <p key={a.id} className="t-body border-b border-borda py-3 last:border-0">
            {a.title}
          </p>
        ))}
        <Link className="t-label mt-3 inline-block" to="/alertas">Alertas</Link>
        <Link className="t-label mt-3 ml-4 inline-block" to="/comparar-empresas">Comparar empresas</Link>
      </Card>
    </div>
  )
}

export function EmpCompaniesPage() {
  const { setScope } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [drawer, setDrawer] = useState<string | null>(null)
  const rows = companies.filter((c) => `${c.name} ${c.cnpj}`.toLowerCase().includes(q.toLowerCase()))
  const accs = accounts.filter((a) => a.companyId === drawer)

  return (
    <div>
      <PageHeader title="Empresas" />
      <input className="mb-4 w-full max-w-sm rounded-[8px] border border-borda bg-superficie px-4 py-3" placeholder="Buscar empresa" value={q} onChange={(e) => setQ(e.target.value)} />
      <Table columns={['Empresa', 'CNPJ', 'Status', 'Contas', '']} empty={!rows.length ? <Empty>Nenhuma empresa encontrada.</Empty> : null}>
        {rows.map((c) => (
          <tr key={c.id}>
            <Td>{c.fantasy}</Td>
            <Td nowrap>{c.cnpj}</Td>
            <Td>{c.status === 'ativo' ? 'Ativo' : 'Inativo'}</Td>
            <Td>{accounts.filter((a) => a.companyId === c.id).length}</Td>
            <Td>
              <Button
                onClick={() => {
                  setScope(c.id)
                  navigate('/')
                }}
              >
                Selecionar
              </Button>
              <Button variant="ghost" className="ml-2" onClick={() => setDrawer(c.id)}>
                Contas
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
      <Drawer title="Contas bancárias" open={!!drawer} onClose={() => setDrawer(null)}>
        {accs.length ? (
          accs.map((a) => (
            <div key={a.id} className="mb-4 border-b border-borda pb-3">
              <p className="t-body">{a.bank} · {a.number}</p>
              <p className="t-apoio text-texto-secundario">{a.status === 'ok' ? 'Sincronizada' : a.status === 'erro' ? 'Erro de conexão' : 'Sincronização atrasada'}</p>
              <Button className="mt-2" onClick={() => navigate('/extratos')}>Selecionar conta</Button>
            </div>
          ))
        ) : (
          <Empty>Este CNPJ ainda não tem conta conectada.</Empty>
        )}
        <Link className="t-label" to="/configuracoes/open-finance">Conectar banco</Link>
      </Drawer>
    </div>
  )
}

export function EmpComparePage() {
  const period = lastMonth()
  if (companies.length < 2) return <Empty>Cadastre ao menos dois CNPJs para comparar.</Empty>
  return (
    <div>
      <PageHeader title="Comparar empresas" />
      <Table columns={['CNPJ', 'Receita', 'Despesa', 'Resultado', 'Margem']}>
        {companies.map((c) => {
          const s = statementFor(period, c.id)
          return (
            <tr key={c.id}>
              <Td>{c.fantasy}</Td>
              <Td className="num">{money(s.receitaBruta)}</Td>
              <Td className="num">{money(s.despesasTotais)}</Td>
              <Td className="num">{money(s.resultadoLiquido)}</Td>
              <Td className="num">{percent(s.margemLiquida * 100)}</Td>
            </tr>
          )
        })}
      </Table>
      <Banner className="mt-4" tone="info">Transferência entre CNPJs do grupo fica fora da soma.</Banner>
    </div>
  )
}
