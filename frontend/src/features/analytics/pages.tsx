import { useSearchParams } from 'react-router-dom'
import { BarCard, LineCard } from '@/components/charts'
import { PageHeader, Table, Td, Tabs } from '@/components/ui'
import { MONTHS, companies } from '@/data/fixtures'
import { lastMonth } from '@/domain/finance'
import { statementFromTransactions } from '@/domain/banking'
import { money, month, percent } from '@/lib/format'
import { useApp } from '@/state/AppContext'

export function AnalyticsPage() {
  const { scope, transactions } = useApp()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') ?? 'evolucao'
  const series = MONTHS.map((m) => {
    const s = statementFromTransactions(transactions, m, scope)
    return { label: month(m), receita: s.receitaBruta, despesa: s.despesasTotais, resultado: s.resultadoLiquido, margem: s.margemLiquida * 100, cmv: s.cmvReceita * 100, mao: s.maoDeObraReceita * 100, opex: s.opexReceita * 100 }
  })
  return (
    <div>
      <PageHeader kicker="Relatórios" title="Analytics" subtitle="Indicadores a partir das movimentações classificadas no extrato." />
      <Tabs value={aba} onChange={(v) => setParams({ aba: v })} items={[{ id: 'evolucao', label: 'Evolução' }, { id: 'empresas', label: 'Empresas' }, { id: 'indicadores', label: 'Indicadores' }, { id: 'periodos', label: 'Períodos' }]} />
      <div className="mt-4">
        {aba === 'evolucao' ? <LineCard title="Evolução mensal" data={series} series={[{ key: 'receita', name: 'Receita', color: '#0B5D4E' }, { key: 'despesa', name: 'Despesa', color: '#8B9B98' }, { key: 'resultado', name: 'Resultado', color: '#0E7C56' }]} /> : null}
        {aba === 'empresas' ? (
          <Table columns={['CNPJ', 'Receita', 'Despesa', 'Resultado', 'Margem']}>
            {companies.map((c) => {
              const s = statementFromTransactions(transactions, lastMonth(), c.id)
              return <tr key={c.id}><Td>{c.fantasy}</Td><Td className="num">{money(s.receitaBruta)}</Td><Td className="num">{money(s.despesasTotais)}</Td><Td className="num">{money(s.resultadoLiquido)}</Td><Td className="num">{percent(s.margemLiquida * 100)}</Td></tr>
            })}
          </Table>
        ) : null}
        {aba === 'indicadores' ? (
          <Table columns={['Mês', 'Margem', 'Mercadorias / receita', 'Mão de obra / receita', 'Opex / receita']}>
            {series.map((r) => <tr key={r.label}><Td>{r.label}</Td><Td>{percent(r.margem)}</Td><Td>{percent(r.cmv)}</Td><Td>{percent(r.mao)}</Td><Td>{percent(r.opex)}</Td></tr>)}
          </Table>
        ) : null}
        {aba === 'periodos' ? <BarCard title="Comparação de períodos" data={[{ label: 'ago', receita: statementFromTransactions(transactions, '2026-08', scope).receitaBruta }, { label: 'set', receita: statementFromTransactions(transactions, '2026-09', scope).receitaBruta }]} series={[{ key: 'receita', name: 'Receita', color: '#0B5D4E' }]} /> : null}
      </div>
    </div>
  )
}
