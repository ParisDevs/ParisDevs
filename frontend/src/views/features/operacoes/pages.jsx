import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Empty, Field, Input, Kv, Modal, PageHeader, Select, Table, Td, Toast } from '@/views/ui'
import { BankLogo } from '@/views/components/BankLogo'
import { dateTime, money } from '@/lib/format'
import { useOperacoesViewModel } from '@/viewmodels/operacoes/useOperacoesViewModel'
import { useOperacaoFormViewModel } from '@/viewmodels/operacoes/useOperacaoFormViewModel'

function TipoBadge({ tipo }) {
  if (tipo === 'RECEBIMENTO') return <Badge tone="success">Recebimento</Badge>
  if (tipo === 'PAGAMENTO') return <Badge tone="danger">Pagamento</Badge>
  return <Badge>Indefinido</Badge>
}

function OperacaoFormFields({ form, patch, contasRecorte, scroll }) {
  return (
    <div className={scroll ? 'max-h-[min(28rem,calc(100vh-16rem))] space-y-4 overflow-y-auto pr-1' : 'space-y-4'}>
      <Field label="Conta">
        <Select value={form.idContaBancaria} onChange={(e) => patch('idContaBancaria', e.target.value)}>
          <option value="">Selecione a conta</option>
          {contasRecorte.map((a) => (
            <option key={a.id} value={a.id}>
              {a.bank} {a.number}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Tipo">
        <Select value={form.tipoOperacao} onChange={(e) => patch('tipoOperacao', e.target.value)}>
          <option value="RECEBIMENTO">Recebimento</option>
          <option value="PAGAMENTO">Pagamento</option>
        </Select>
      </Field>
      <Field label="Valor">
        <Input
          value={form.valorOperacao}
          onChange={(e) => patch('valorOperacao', e.target.value)}
          inputMode="decimal"
        />
      </Field>
      <Field label="Razão social">
        <Input value={form.razaoSocial} onChange={(e) => patch('razaoSocial', e.target.value)} />
      </Field>
      <Field label="Categoria">
        <Input value={form.categoria} onChange={(e) => patch('categoria', e.target.value)} />
      </Field>
      <Field label="Data e hora">
        <Input type="datetime-local" value={form.dtHora} onChange={(e) => patch('dtHora', e.target.value)} />
      </Field>
    </div>
  )
}

function OperacaoFormDialog({
  open,
  title,
  subtitle,
  onClose,
  form,
  patch,
  contasRecorte,
  erro,
  saving,
  onSubmit,
  carregando,
}) {
  return (
    <Modal
      title={title}
      subtitle={subtitle}
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="operacao-form-dialog" disabled={saving || carregando}>
            Salvar
          </Button>
        </>
      }
    >
      {carregando ? <p className="t-body text-texto-secundario">Carregando...</p> : null}
      {!carregando ? (
        <form id="operacao-form-dialog" onSubmit={onSubmit} className="space-y-4" noValidate>
          <OperacaoFormFields form={form} patch={patch} contasRecorte={contasRecorte} scroll />
          {erro ? <p className="t-body text-erro">{erro}</p> : null}
        </form>
      ) : null}
    </Modal>
  )
}

export function OperacoesPage() {
  const {
    q,
    setQ,
    tipo,
    setTipo,
    bank,
    setBank,
    accountId,
    setAccountId,
    categoria,
    setCategoria,
    banks,
    contasFiltro,
    categorias,
    rows,
    carregando,
    erro,
    empty,
    emptyRecorte,
    toast,
    pendingDelete,
    setPendingDelete,
    formMode,
    openCreate,
    openEdit,
    closeForm,
    editForm,
    patchEdit,
    editErro,
    contasEdicao,
    saving,
    saveForm,
    remove,
  } = useOperacoesViewModel()
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        kicker="Operação"
        title="Operações"
        subtitle="Lançamentos de recebimento e pagamento nas contas bancárias. Valores positivos; o tipo define entrada ou saída."
        actions={<Button onClick={openCreate}>Nova operação</Button>}
      >
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borda px-4 py-3">
            <p className="t-label text-texto-secundario">Filtros</p>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar contraparte ou categoria"
              aria-label="Buscar"
            />
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo">
              <option value="">Tipo</option>
              <option value="RECEBIMENTO">Recebimento</option>
              <option value="PAGAMENTO">Pagamento</option>
            </Select>
            <Select
              value={bank}
              onChange={(e) => {
                setBank(e.target.value)
                setAccountId('')
              }}
              aria-label="Instituição"
            >
              <option value="">Instituição</option>
              {banks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} aria-label="Conta">
              <option value="">Conta</option>
              {contasFiltro.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bank} {a.number}
                </option>
              ))}
            </Select>
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoria">
              <option value="">Categoria</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </Card>
      </PageHeader>

      {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
      {carregando ? <p className="t-body text-texto-secundario">Carregando...</p> : null}

      {!carregando ? (
        <Table
          columns={['Data', 'Contraparte', 'Categoria', 'Instituição/conta', 'Tipo', 'Valor', 'Ações']}
          empty={
            empty ? (
              <Empty
                action={
                  emptyRecorte ? <Button onClick={openCreate}>Nova operação</Button> : undefined
                }
              >
                {emptyRecorte ? 'Nenhuma operação neste recorte.' : 'Nenhuma operação neste filtro.'}
              </Empty>
            ) : null
          }
          footer={<span>Exibindo {rows.length} lançamentos</span>}
        >
          {rows.map((t) => (
            <tr key={t.id} className="cursor-pointer" onClick={() => navigate(`/operacoes/${t.id}`)}>
              <Td nowrap>{t.dtHora ? dateTime(t.dtHora) : t.date}</Td>
              <Td>
                <Link to={`/operacoes/${t.id}`} onClick={(e) => e.stopPropagation()}>
                  {t.razaoSocial || '—'}
                </Link>
              </Td>
              <Td>{t.category || '—'}</Td>
              <Td>
                <span className="inline-flex items-center gap-2">
                  <BankLogo bank={t.instituicao} size={22} />
                  <span>
                    {t.instituicao} {t.numeroConta}
                  </span>
                </span>
              </Td>
              <Td>
                <TipoBadge tipo={t.tipo} />
              </Td>
              <Td className="num">{money(t.amount)}</Td>
              <Td>
                <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    className="h-8 px-2"
                    title="Editar"
                    aria-label="Editar"
                    onClick={() => openEdit(t)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 px-2"
                    title="Excluir"
                    aria-label="Excluir"
                    onClick={() => setPendingDelete(t)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}

      <OperacaoFormDialog
        open={!!formMode}
        title={formMode === 'criar' ? 'Nova operação' : 'Editar operação'}
        subtitle={
          formMode === 'criar'
            ? 'Informe os dados do lançamento e salve para persistir no banco.'
            : 'Altere os dados do lançamento e salve para persistir no banco.'
        }
        onClose={closeForm}
        form={editForm}
        patch={patchEdit}
        contasRecorte={contasEdicao}
        erro={editErro}
        saving={saving}
        onSubmit={saveForm}
      />
      <Modal
        title="Excluir operação"
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancelar
            </Button>
            <Button onClick={remove} disabled={saving}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="t-body text-texto-secundario">
          Deseja excluir {pendingDelete?.razaoSocial ? `o lançamento de ${pendingDelete.razaoSocial}` : 'este lançamento'}? A ação não pode ser desfeita.
        </p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function OperacaoDetalhePage() {
  const [editOpen, setEditOpen] = useState(false)
  const {
    operacao,
    form,
    patch,
    contasRecorte,
    carregando,
    erro,
    toast,
    confirmDelete,
    setConfirmDelete,
    remove,
    saving,
    missing,
    submit,
  } = useOperacaoFormViewModel('detalhe', { onSaved: () => setEditOpen(false) })

  if (carregando) {
    return (
      <div>
        <PageHeader kicker="Operação" title="Detalhe da operação" />
        <p className="t-body text-texto-secundario">Carregando...</p>
      </div>
    )
  }

  if (missing) {
    return (
      <div>
        <PageHeader kicker="Operação" title="Detalhe da operação" />
        {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
        <Empty>Nenhuma operação neste recorte.</Empty>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        kicker="Operação"
        title="Detalhe da operação"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setEditOpen(true)}>Editar</Button>
            <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
              Excluir
            </Button>
          </div>
        }
      />
      {erro && !editOpen ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
      <Card>
        <Kv
          items={[
            { label: 'Contraparte', value: operacao.razaoSocial || '—' },
            { label: 'Categoria', value: operacao.category || '—' },
            { label: 'Tipo', value: operacao.entrada ? 'Recebimento' : 'Pagamento' },
            { label: 'Valor', value: money(operacao.amount) },
            { label: 'Data', value: operacao.dtHora ? dateTime(operacao.dtHora) : operacao.date },
            { label: 'Instituição', value: operacao.instituicao || '—' },
            { label: 'Conta', value: operacao.numeroConta || '—' },
          ]}
        />
      </Card>
      <OperacaoFormDialog
        open={editOpen}
        title="Editar operação"
        subtitle="Altere os dados do lançamento e salve para persistir no banco."
        onClose={() => setEditOpen(false)}
        form={form}
        patch={patch}
        contasRecorte={contasRecorte}
        erro={erro}
        saving={saving}
        onSubmit={submit}
      />
      <Modal
        title="Excluir operação"
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button onClick={remove} disabled={saving}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="t-body text-texto-secundario">Deseja excluir este lançamento? A ação não pode ser desfeita.</p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function OperacaoFormPage({ mode }) {
  const navigate = useNavigate()
  const { form, patch, contasRecorte, carregando, saving, erro, toast, submit } = useOperacaoFormViewModel(mode)
  const criar = mode === 'criar'

  return (
    <div>
      <PageHeader kicker="Operação" title="Operações" />
      <OperacaoFormDialog
        open
        title={criar ? 'Nova operação' : 'Editar operação'}
        subtitle={
          criar
            ? 'Informe os dados do lançamento e salve para persistir no banco.'
            : 'Altere os dados do lançamento e salve para persistir no banco.'
        }
        onClose={() => navigate('/operacoes')}
        form={form}
        patch={patch}
        contasRecorte={contasRecorte}
        erro={erro}
        saving={saving}
        onSubmit={submit}
        carregando={carregando}
      />
      <Toast message={toast} />
    </div>
  )
}
