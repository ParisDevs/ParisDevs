import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Button, Card, Empty, Input, Kv, Modal, PageHeader, Select, Table, Td, Toast } from '@/views/ui'
import { dateTime, money } from '@/lib/format'
import { origemProtegida } from '@/models/domain/dashboardBanking'
import { useExtratoDetalheViewModel, useExtratosViewModel } from '@/viewmodels/extratos/useExtratosViewModel'

function valorAssinado(row) {
  if (row.saida) return -row.amount
  return row.amount
}

export function ExtratosPage() {
  const {
    q,
    setQ,
    tipo,
    setTipo,
    bank,
    setBank,
    accountId,
    setAccountId,
    banks,
    contasFiltro,
    rows,
    carregando,
    erro,
    toast,
    pendingDelete,
    setPendingDelete,
    saving,
    remove,
    empty,
    emptyRecorte,
  } = useExtratosViewModel()

  return (
    <div>
      <PageHeader
        kicker="Operação"
        title="Extratos"
        subtitle="Lançamentos da conta. Os manuais alteram o saldo ao serem excluídos. Os vindos do banco só mudam numa nova sincronização."
        actions={<Link to="/extratos/importar"><Button>Importar extrato</Button></Link>}
      >
        <Card className="p-0">
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar lançamento" aria-label="Busca" />
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo">
              <option value="">Tipo</option>
              <option value="RECEBIMENTO">Entrada</option>
              <option value="PAGAMENTO">Saída</option>
            </Select>
            <Select value={bank} onChange={(e) => { setBank(e.target.value); setAccountId('') }} aria-label="Banco">
              <option value="">Banco</option>
              {banks.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} aria-label="Conta">
              <option value="">Conta</option>
              {contasFiltro.map((a) => <option key={a.id} value={a.id}>{a.bank} {a.number}</option>)}
            </Select>
          </div>
        </Card>
      </PageHeader>

      {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
      {carregando ? <p className="t-body text-texto-secundario">Carregando...</p> : null}

      {!carregando ? (
        <Table
          columns={['Data', 'Descrição', 'Conta', 'Valor', 'Tipo', 'Origem', '']}
          empty={empty ? (
            <Empty action={emptyRecorte ? <Link to="/extratos/importar"><Button>Importar extrato</Button></Link> : undefined}>
              {emptyRecorte ? 'Nenhum lançamento neste período.' : 'Nenhum lançamento neste filtro.'}
            </Empty>
          ) : null}
          footer={<span>Exibindo {rows.length} lançamentos</span>}
        >
          {rows.map((t) => (
            <tr key={t.id}>
              <Td nowrap>{t.dtHora ? dateTime(t.dtHora) : t.date}</Td>
              <Td><Link to={`/extratos/${t.id}`}>{t.razaoSocial || '—'}</Link></Td>
              <Td>{t.instituicao} {t.numeroConta}</Td>
              <Td className="num">{money(valorAssinado(t))}</Td>
              <Td>{t.entrada ? 'Entrada' : 'Saída'}</Td>
              <Td>{t.origem || 'MANUAL'}</Td>
              <Td>
                {origemProtegida(t.origem) ? null : (
                  <Button variant="ghost" className="h-8 px-2" title="Excluir" aria-label="Excluir" onClick={() => setPendingDelete(t)}>
                    <Trash2 size={14} />
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}

      <Modal
        title="Excluir lançamento"
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>Cancelar</Button>
            <Button onClick={remove} disabled={saving}>Excluir</Button>
          </>
        }
      >
        <p className="t-body text-texto-secundario">
          Deseja excluir {pendingDelete?.razaoSocial ? `o lançamento de ${pendingDelete.razaoSocial}` : 'este lançamento'}?
          O saldo desta conta muda só por este valor. O dashboard passa a ler o saldo novo ao ser aberto de novo.
        </p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function ExtratoDetalhePage() {
  const {
    operacao,
    carregando,
    erro,
    toast,
    confirmDelete,
    setConfirmDelete,
    saving,
    remove,
    missing,
  } = useExtratoDetalheViewModel()

  if (carregando) {
    return (
      <div>
        <PageHeader kicker="Extratos" title="Lançamento" />
        <p className="t-body text-texto-secundario">Carregando...</p>
      </div>
    )
  }

  if (missing) {
    return (
      <div>
        <PageHeader kicker="Extratos" title="Lançamento" />
        {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
        <Empty>Nenhum lançamento neste recorte.</Empty>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        kicker="Extratos"
        title={operacao.razaoSocial || 'Lançamento'}
        actions={origemProtegida(operacao.origem) ? null : <Button variant="secondary" onClick={() => setConfirmDelete(true)}>Excluir</Button>}
      />
      {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
      <Card>
        <Kv items={[
          { label: 'Instituição', value: operacao.instituicao || '—' },
          { label: 'Conta', value: operacao.numeroConta || '—' },
          { label: 'Data', value: operacao.dtHora ? dateTime(operacao.dtHora) : operacao.date },
          { label: 'Valor', value: money(valorAssinado(operacao)) },
          { label: 'Tipo', value: operacao.entrada ? 'Entrada' : 'Saída' },
          { label: 'Categoria', value: operacao.category || '—' },
          { label: 'Origem', value: operacao.origem || 'MANUAL' },
        ]} />
      </Card>
      <Modal
        title="Excluir lançamento"
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button onClick={remove} disabled={saving}>Excluir</Button>
          </>
        }
      >
        <p className="t-body text-texto-secundario">
          O saldo desta conta deixa de incluir este valor. Ao abrir o dashboard, o indicador consolidado já reflete a exclusão.
        </p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}
