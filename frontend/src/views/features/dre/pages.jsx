import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Drawer, PageHeader, Table, Td } from '@/views/ui'
import { statementFromTransactions } from '@/models/domain/banking'
import { money, percent } from '@/lib/format'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { DRE_LINES } from '@/views/features/dre/dreLines'


export function DrePage() {
  const { scope, period, transactions } = useAppViewModel()
  const st = statementFromTransactions(transactions, period, scope)
  const [line, setLine] = useState(null)
  return (
    <div>
      <PageHeader
        kicker="Relatórios"
        title="DRE gerencial"
        subtitle="A partir das movimentações classificadas. Não substitui a DRE contábil. Transferências, empréstimos e lançamentos sem categoria ficam de fora."
      />
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
  const { scope, transactions } = useAppViewModel()
  const a = statementFromTransactions(transactions, '2026-08', scope)
  const b = statementFromTransactions(transactions, '2026-09', scope)
  return (
    <div>
      <PageHeader kicker="Relatórios" title="DRE comparativa" />
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
