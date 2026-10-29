import { Link, useParams } from 'react-router-dom'
import { History } from 'lucide-react'
import { Banner, Button, Empty, Field, Input, PageHeader, Table, Td, Toast } from '@/views/ui'
import { date, money, percent } from '@/lib/format'
import { cn } from '@/lib/cn'
import {
  DRE_COLUNAS,
  dataExtenso,
  moneyParen,
  percAlto,
  percLabel,
} from '@/models/domain/dre'
import { statementFromTransactions } from '@/models/domain/banking'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { DRE_LINES } from '@/views/features/dre/dreLines'
import { useDreViewModel } from '@/viewmodels/dre/useDreViewModel'
import { useDreHistoricoViewModel } from '@/viewmodels/dre/useDreHistoricoViewModel'

function DreTabela({ relatorio }) {
  const linhas = relatorio?.linhas ?? []
  const total = relatorio?.total
  if (!linhas.length) {
    return <Empty>Nenhuma filial neste recorte.</Empty>
  }
  return (
    <Table
      columns={DRE_COLUNAS}
      footer={<span>Recorte do mês até {date(relatorio.dataReferencia)} · origem {relatorio.origem === 'SNAPSHOT' ? 'histórico gravado' : 'cálculo ao vivo'}</span>}
    >
      {linhas.map((linha) => (
        <tr key={linha.idFilial ?? linha.empresaRelatorio}>
          <Td>{linha.empresaRelatorio}</Td>
          <Td className="num" nowrap>
            {moneyParen(linha.receitaTotal)}
          </Td>
          <Td className="num" nowrap>
            {moneyParen(linha.receitaLiquida)}
          </Td>
          <Td className="num" nowrap>
            {moneyParen(linha.mercadorias)}
          </Td>
          <Td className={cn('num', percAlto(linha.percMercadorias) && 'text-erro')} nowrap>
            {percLabel(linha.percMercadorias)}
          </Td>
          <Td className="num" nowrap>
            {moneyParen(linha.resultado)}
          </Td>
        </tr>
      ))}
      {total ? (
        <tr className="bg-superficie-2">
          <Td className="t-h3">{total.empresaRelatorio}</Td>
          <Td className="num t-h3" nowrap>
            {moneyParen(total.receitaTotal)}
          </Td>
          <Td className="num t-h3" nowrap>
            {moneyParen(total.receitaLiquida)}
          </Td>
          <Td className="num t-h3" nowrap>
            {moneyParen(total.mercadorias)}
          </Td>
          <Td className={cn('num t-h3', percAlto(total.percMercadorias) && 'text-erro')} nowrap>
            {percLabel(total.percMercadorias)}
          </Td>
          <Td className="num t-h3" nowrap>
            {moneyParen(total.resultado)}
          </Td>
        </tr>
      ) : null}
    </Table>
  )
}

export function DrePage() {
  const { data } = useParams()
  const { relatorio, dataAlvo, historico, carregando, saving, erro, toast, atualizar } = useDreViewModel(data)

  return (
    <div>
      <PageHeader
        kicker="Relatórios"
        title={historico ? 'DRE do dia' : 'DRE diária'}
        subtitle={`Acumulado do mês civil até D-1 (${dataExtenso(dataAlvo)}). Receita líquida com dedução de 13%. Origem ${relatorio?.origem === 'SNAPSHOT' ? 'SNAPSHOT' : relatorio?.origem === 'AO_VIVO' ? 'AO_VIVO' : '—'}. Rateio H1 não entra no cálculo.`}
        actions={
          <div className="flex flex-wrap gap-2">
            {historico ? (
              <Link to="/dre/historico">
                <Button variant="secondary">Voltar ao histórico</Button>
              </Link>
            ) : (
              <>
                <Button onClick={atualizar} disabled={saving || carregando}>
                  Atualizar D-1
                </Button>
                <Link to="/dre/historico">
                  <Button variant="secondary">
                    <History size={14} />
                    Histórico
                  </Button>
                </Link>
              </>
            )}
          </div>
        }
      />
      {erro ? <Banner tone="danger" className="mb-4">{erro}</Banner> : null}
      {carregando ? <p className="t-apoio text-texto-secundario">Carregando DRE…</p> : null}
      {!carregando && relatorio ? <DreTabela relatorio={relatorio} /> : null}
      <Toast message={toast} />
    </div>
  )
}

export function DreHistoricoPage() {
  const { rows, de, ate, setDe, setAte, carregando, erro } = useDreHistoricoViewModel()
  return (
    <div>
      <PageHeader
        kicker="Relatórios"
        title="Histórico DRE"
        subtitle="Snapshots gravados da DRE diária. A abertura do dia ou Atualizar D-1 registra o recorte."
        actions={
          <Link to="/dre">
            <Button variant="secondary">DRE do dia</Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Field label="De">
          <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        </Field>
        <Field label="Até">
          <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
        </Field>
      </div>
      {erro ? <Banner tone="danger" className="mb-4">{erro}</Banner> : null}
      {carregando ? <p className="t-apoio text-texto-secundario">Carregando histórico…</p> : null}
      {!carregando ? (
        <Table
          columns={['Data', 'Receita total', 'Receita líquida', 'Mercadorias', '%', 'Resultado', '']}
          empty={!rows.length ? <Empty>Nenhum dia gravado neste recorte.</Empty> : null}
          footer={rows.length ? <span>{rows.length} dia(s)</span> : null}
        >
          {rows.map((item) => (
            <tr key={item.dataReferencia}>
              <Td nowrap>
                <Link to={`/dre/historico/${item.dataReferencia}`}>{date(item.dataReferencia)}</Link>
              </Td>
              <Td className="num" nowrap>
                {moneyParen(item.receitaTotal)}
              </Td>
              <Td className="num" nowrap>
                {moneyParen(item.receitaLiquida)}
              </Td>
              <Td className="num" nowrap>
                {moneyParen(item.mercadorias)}
              </Td>
              <Td className={cn('num', percAlto(item.percMercadorias) && 'text-erro')} nowrap>
                {percLabel(item.percMercadorias)}
              </Td>
              <Td className="num" nowrap>
                {moneyParen(item.resultado)}
              </Td>
              <Td>
                <Link to={`/dre/historico/${item.dataReferencia}`}>
                  <Button variant="ghost" className="h-8 px-2">
                    Ver
                  </Button>
                </Link>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
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
          return (
            <tr key={l.key}>
              <Td>{l.label}</Td>
              <Td className="num">{money(va)}</Td>
              <Td className="num">{money(vb)}</Td>
              <Td className="num">{percent(((vb - va) / (va || 1)) * 100)}</Td>
            </tr>
          )
        })}
      </Table>
    </div>
  )
}
