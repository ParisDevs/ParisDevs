import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Banner, Button, Card, Drawer, Empty, PageHeader, Select, Table, Td, Tip, Kv } from '@/components/ui'
import { MONTHS, chartOfAccounts, classLabels, companies, reconTips } from '@/data/fixtures'
import { categoryLabel } from '@/domain/finance'
import { date, dateTime, money, monthLong } from '@/lib/format'
import { useApp, useScopedTx } from '@/state/AppContext'
import { ReconStatusBadge } from '@/features/transactions/components/ReconStatusBadge'
import { txHistory } from '@/features/transactions/txHistory'


export function ExtratosPage() {
  const { scope, txFilter, setTxFilter, audit, accounts } = useApp()
  const tx = useScopedTx()
  const q = txFilter
  const search = q.search.trim().toLowerCase()
  const contas = accounts.filter(
    (a) => (scope === 'grupo' || a.companyId === scope) && (!q.cnpj || a.companyId === q.cnpj) && (!q.banco || a.bank === q.banco),
  )
  const categorias = chartOfAccounts.filter((c) => c.parent && !chartOfAccounts.some((x) => x.parent === c.code))
  const origens = [...new Set(accounts.map((a) => a.provider))]
  const headActive = [q.periodo, q.cnpj, q.banco, q.conta, q.categoria, q.status, q.origem, q.tipo].some(Boolean)

  const rows = tx.filter((t) => {
    const acc = accounts.find((a) => a.id === t.accountId)
    if (q.periodo && t.competence !== q.periodo) return false
    if (q.cnpj && t.companyId !== q.cnpj) return false
    if (q.banco && acc?.bank !== q.banco) return false
    if (q.conta && t.accountId !== q.conta) return false
    if (q.categoria && t.category !== q.categoria) return false
    if (q.status && t.status !== q.status) return false
    if (q.origem && t.source !== q.origem && acc?.provider !== q.origem) return false
    if (q.tipo === 'entrada' && t.amount < 0) return false
    if (q.tipo === 'saida' && t.amount >= 0) return false
    if (search) {
      const hay = `${t.description} ${t.counterparty} ${t.document}`.toLowerCase()
      if (!hay.includes(search)) return false
    }
    return true
  })

  function clearHeadFilters() {
    setTxFilter({ periodo: '', cnpj: '', banco: '', conta: '', categoria: '', status: '', origem: '', tipo: '' })
  }

  return (
    <div>
      <PageHeader
        kicker="Operação"
        title="Extratos"
        subtitle="Movimentações de Open Finance, importação e entrada manual, no mesmo modelo."
        actions={<Link to="/extratos/importar"><Button>Importar extrato</Button></Link>}
      >
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borda px-4 py-3">
            <p className="t-label text-texto-secundario">Filtros</p>
            {headActive ? (
              <button type="button" className="t-label" onClick={clearHeadFilters}>
                Limpar filtros
              </button>
            ) : null}
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
            <Select value={q.periodo} onChange={(e) => setTxFilter({ periodo: e.target.value })} aria-label="Período">
              <option value="">Período</option>
              {MONTHS.map((m) => <option key={m} value={m}>{monthLong(m)}</option>)}
            </Select>
            <Select value={q.cnpj} onChange={(e) => setTxFilter({ cnpj: e.target.value, conta: '' })} aria-label="CNPJ">
              <option value="">CNPJ</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.fantasy}</option>)}
            </Select>
            <Select value={q.banco} onChange={(e) => setTxFilter({ banco: e.target.value, conta: '' })} aria-label="Banco">
              <option value="">Banco</option>
              {[...new Set(accounts.map((a) => a.bank))].map((b) => <option key={b}>{b}</option>)}
            </Select>
            <Select value={q.conta} onChange={(e) => setTxFilter({ conta: e.target.value })} aria-label="Conta">
              <option value="">Conta</option>
              {contas.map((a) => <option key={a.id} value={a.id}>{a.bank} {a.number}</option>)}
            </Select>
            <Select value={q.categoria} onChange={(e) => setTxFilter({ categoria: e.target.value })} aria-label="Categoria">
              <option value="">Categoria</option>
              {categorias.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </Select>
            <Select value={q.status} onChange={(e) => setTxFilter({ status: e.target.value })} aria-label="Status">
              <option value="">Status</option>
              {Object.entries(classLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select value={q.origem} onChange={(e) => setTxFilter({ origem: e.target.value })} aria-label="Origem">
              <option value="">Origem</option>
              <option value="open_finance">Open Finance</option>
              <option value="import">Importação</option>
              <option value="manual">Manual</option>
              {origens.map((o) => <option key={o}>{o}</option>)}
            </Select>
            <Select value={q.tipo} onChange={(e) => setTxFilter({ tipo: e.target.value })} aria-label="Tipo">
              <option value="">Tipo</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </Select>
          </div>
        </Card>
      </PageHeader>
      <Table
        columns={['Data', 'Descrição', 'Contraparte', 'Valor', 'Tipo', 'Status', 'Log']}
        empty={!rows.length ? (
          <Empty action={!tx.length ? <Link to="/extratos/importar"><Button>Importar extrato</Button></Link> : undefined}>
            {tx.length ? 'Nenhuma transação neste filtro.' : 'O extrato ainda não foi importado.'}
          </Empty>
        ) : null}
        footer={<span>Exibindo {rows.length} de {tx.length} lançamentos</span>}
      >
        {rows.map((t) => {
          const last = txHistory(t, audit)[0]
          return (
            <tr key={t.id}>
              <Td nowrap>{date(t.date)}</Td>
              <Td><Link to={`/extratos/${t.id}`}>{t.description}</Link></Td>
              <Td>{t.counterparty || '—'}</Td>
              <Td className="num">{money(t.amount)}</Td>
              <Td>{t.amount >= 0 ? 'Entrada' : 'Saída'}</Td>
              <Td><ReconStatusBadge recon={t.recon} /></Td>
              <Td>
                {last ? (
                  <Link to={`/extratos/${t.id}`} className="block">
                    <span className="block font-medium text-texto">{last.action}</span>
                    <span className="t-apoio text-faint">{dateTime(last.at)} · {last.user}</span>
                  </Link>
                ) : '—'}
              </Td>
            </tr>
          )
        })}
      </Table>
    </div>
  )
}

export function ExtratoDetalhePage() {
  const { id } = useParams()
  const tx = useScopedTx()
  const { transactions, audit, accounts } = useApp()
  const [hist, setHist] = useState(false)
  const t = tx.find((x) => x.id === id) ?? transactions.find((x) => x.id === id)
  if (!t) return <Empty>Nenhuma transação neste filtro.</Empty>
  const acc = accounts.find((a) => a.id === t.accountId)
  const dup = t.duplicateOf ? transactions.find((x) => x.id === t.duplicateOf) : null
  const log = txHistory(t, audit)

  function LogList() {
    if (!log.length) return <Empty>Nenhuma alteração depois da importação.</Empty>
    return (
      <ol className="space-y-4">
        {log.map((row, i) => (
          <li key={row.at + row.action + i} className="border-b border-borda pb-4 last:border-0 last:pb-0">
            <p className="text-[14px] font-semibold">{row.action}</p>
            <p className="t-apoio mt-1 text-texto-secundario">{dateTime(row.at)} · {row.user}</p>
            <p className="t-body mt-2">
              <span className="text-faint">Antes </span>{row.before}
              <span className="text-faint"> → Depois </span>{row.after}
            </p>
            {row.reason ? <p className="t-apoio mt-1 text-texto-secundario">{row.reason}</p> : null}
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div>
      <PageHeader kicker="Extratos" title={t.description} actions={<Button variant="ghost" onClick={() => setHist(true)}>Ver histórico</Button>} />
      {t.recon === 'duplicidade' && dup ? <Banner tone="alert" className="mb-4">Este lançamento parece repetir {dup.document} de {date(dup.date)}.</Banner> : null}
      {t.recon === 'interna' ? (
        <Banner tone="info" className="mb-4">
          <span className="inline-flex items-center gap-1.5">
            Movimentação interna
            <Tip text={reconTips.interna ?? ''} />
          </span>
        </Banner>
      ) : null}
      <Card>
        <Kv items={[
          { label: 'Banco', value: acc?.bank },
          { label: 'Conta', value: acc?.number },
          { label: 'Data', value: date(t.date) },
          { label: 'Valor', value: money(t.amount) },
          { label: 'Descrição', value: t.description },
          { label: 'Contraparte', value: t.counterparty || '—' },
          { label: 'Documento', value: t.document || '—' },
          { label: 'Origem', value: t.source === 'import' ? 'Importação de extrato' : t.source === 'manual' ? 'Entrada manual' : acc?.provider ?? 'Open Finance' },
          { label: 'Categoria', value: categoryLabel(t.category) },
          { label: 'Centro de custo', value: t.costCenter ?? '—' },
        ]} />
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to={`/ia/revisao/${t.id}`}><Button>Revisar classificação</Button></Link>
          <Link to={`/conciliacao/${t.id}`}><Button variant="secondary">Conciliação</Button></Link>
        </div>
      </Card>
      <Drawer title="Histórico da transação" open={hist} onClose={() => setHist(false)}>
        <LogList />
      </Drawer>
    </div>
  )
}
