import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { BankLogo } from '@/views/components/BankLogo'
import { Badge, Banner, Button, Card, Empty, Field, Input, Kpi, Modal, PageHeader, Select, Table, Td, Toast } from '@/views/ui'
import { configStatusMeta } from '@/models/domain/configuracao'
import { TIPOS_CONTA } from '@/models/domain/contaBancaria'
import { money } from '@/lib/format'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { useConfiguracaoViewModel } from '@/viewmodels/configuracao/useConfiguracaoViewModel'
import { useContasBancariasViewModel } from '@/viewmodels/configuracao/useContasBancariasViewModel'
import { CardAlso, ConfigCrumbs } from '@/views/features/configuracao/shell'

export function CnpjsPage() {
  const { filiais } = useConfiguracaoViewModel()
  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="CNPJs"
        subtitle="Consulta das empresas cadastradas. O cadastro fica em Organização."
        actions={
          <Link to="/configuracoes/organizacao">
            <Button>Cadastro em Organização</Button>
          </Link>
        }
      />
      <ConfigCrumbs current="CNPJs" />
      <Table
        columns={['Filial', 'CNPJ', 'Endereço']}
        empty={!filiais.length ? <Empty>Nenhuma filial.</Empty> : null}
        footer={filiais.length ? <span>Exibindo {filiais.length} filiais</span> : null}
      >
        {filiais.map((f) => (
          <tr key={f.idFilial}>
            <Td>{f.razaoSocial || '—'}</Td>
            <Td nowrap>{f.cnpj || '—'}</Td>
            <Td>{f.endereco || '—'}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function CnpjFormPage() {
  return (
    <div>
      <PageHeader kicker="Configuração" title="CNPJ" subtitle="Cadastro de CNPJ não está operacional neste slice." />
      <ConfigCrumbs current="CNPJ" />
      <Card className="max-w-xl space-y-4">
        <Banner tone="info">O cadastro de empresas é feito em Organização.</Banner>
        <CardAlso>
          <Link to="/configuracoes/cnpjs">
            <Button variant="secondary">Ver filiais</Button>
          </Link>
          <Link to="/configuracoes/organizacao">
            <Button variant="secondary">Organização</Button>
          </Link>
        </CardAlso>
      </Card>
    </div>
  )
}

export function BancosPage() {
  const { bancos, carregando, erro } = useContasBancariasViewModel()
  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="Bancos"
        subtitle="Instituições das contas cadastradas. O cadastro da conta fica em Contas bancárias."
      />
      <ConfigCrumbs current="Bancos" />
      {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
      {carregando ? <p className="t-body text-texto-secundario">Carregando...</p> : null}
      {!carregando ? (
        <Table
          columns={['Banco', 'Contas']}
          empty={!bancos.length ? <Empty>Nenhuma instituição neste recorte.</Empty> : null}
          footer={bancos.length ? <span>Exibindo {bancos.length} instituições</span> : null}
        >
          {bancos.map((b) => (
            <tr key={b.bank}>
              <Td>
                <span className="flex items-center gap-3">
                  <BankLogo bank={b.bank} size={28} />
                  {b.bank}
                </span>
              </Td>
              <Td>{b.count}</Td>
            </tr>
          ))}
        </Table>
      ) : null}
      <Card className="mt-4 max-w-xl">
        <CardAlso flush>
          <Link to="/conexoes">
            <Button variant="secondary">Conexões bancárias</Button>
          </Link>
          <Link to="/configuracoes/contas">
            <Button variant="secondary">Contas bancárias</Button>
          </Link>
          <Link to="/configuracoes/open-finance">
            <Button variant="secondary">Open Finance</Button>
          </Link>
        </CardAlso>
      </Card>
    </div>
  )
}

export function ContasBancariasPage() {
  const {
    q,
    setQ,
    filiais,
    rows,
    kpis,
    carregando,
    erro,
    toast,
    formMode,
    form,
    formErro,
    patchForm,
    openCreate,
    openEdit,
    closeForm,
    saveForm,
    pendingDelete,
    setPendingDelete,
    saving,
    remove,
    empty,
    emptyFiltro,
  } = useContasBancariasViewModel()

  const tipos = form.tipoConta && !TIPOS_CONTA.includes(form.tipoConta)
    ? [form.tipoConta, ...TIPOS_CONTA]
    : TIPOS_CONTA

  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="Contas bancárias"
        subtitle="Cadastro das contas da organização. Saldo vem da API e não é enviado no formulário."
        actions={<Button onClick={openCreate}>Nova conta</Button>}
      />
      <ConfigCrumbs current="Contas bancárias" />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Kpi label="Total" value={String(kpis.total)} />
        <Kpi label="Ativas" value={String(kpis.ativas)} />
        <Kpi label="Inativas" value={String(kpis.inativas)} />
      </div>
      {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
      {carregando ? <p className="t-body text-texto-secundario">Carregando...</p> : null}
      {!carregando ? (
        <Table
          columns={['Banco', 'Agência', 'Conta', 'Tipo', 'Titular', 'Filial', 'Saldo', 'Status', 'Ações']}
          empty={
            empty || emptyFiltro ? (
              <Empty action={empty ? <Button onClick={openCreate}>Nova conta</Button> : undefined}>
                {empty ? 'Nenhuma conta cadastrada neste recorte.' : 'Nenhuma conta neste filtro.'}
              </Empty>
            ) : null
          }
          footer={<span>Exibindo {rows.length} contas</span>}
          toolbar={
            <Input
              className="max-w-md"
              placeholder="Buscar banco, conta, titular ou filial"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar contas"
            />
          }
        >
          {rows.map((a) => (
            <tr key={a.id}>
              <Td>
                <span className="flex items-center gap-3">
                  <BankLogo bank={a.bank} size={28} />
                  {a.bank}
                </span>
              </Td>
              <Td nowrap>
                {a.agencia}
                {a.agenciaDigito ? `-${a.agenciaDigito}` : ''}
              </Td>
              <Td>{a.number || '—'}</Td>
              <Td>{a.tipoConta || '—'}</Td>
              <Td>{a.nomeTitular || '—'}</Td>
              <Td>{a.filialNome || '—'}</Td>
              <Td className="num">{a.balanceUnavailable ? 'Indisponível' : money(a.balance)}</Td>
              <Td>
                <Badge tone={a.ativo ? 'success' : 'neutral'}>{a.ativo ? 'Ativa' : 'Inativa'}</Badge>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" className="h-8 px-2" title="Editar" aria-label="Editar" onClick={() => openEdit(a)}>
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 px-2"
                    title="Excluir"
                    aria-label="Excluir"
                    onClick={() => setPendingDelete(a)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
      <Modal
        title={formMode === 'criar' ? 'Nova conta bancária' : 'Editar conta bancária'}
        subtitle={
          formMode === 'criar'
            ? 'Informe os dados cadastrais. O saldo não é enviado neste formulário.'
            : 'Altere os dados cadastrais. O saldo continua sendo lido da API.'
        }
        open={!!formMode}
        onClose={closeForm}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" form="conta-form-dialog" disabled={saving}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="conta-form-dialog" onSubmit={saveForm} className="space-y-4" noValidate>
          <Field label="Filial">
            <Select value={form.fkFilial} onChange={(e) => patchForm('fkFilial', e.target.value)}>
              <option value="">Selecione a filial</option>
              {filiais.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Código do banco">
              <Input value={form.codigoBanco} onChange={(e) => patchForm('codigoBanco', e.target.value)} />
            </Field>
            <Field label="Instituição">
              <Input value={form.nomeInstituicao} onChange={(e) => patchForm('nomeInstituicao', e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Agência">
              <Input value={form.agencia} onChange={(e) => patchForm('agencia', e.target.value)} />
            </Field>
            <Field label="Dígito">
              <Input value={form.agenciaDigito} onChange={(e) => patchForm('agenciaDigito', e.target.value)} />
            </Field>
          </div>
          <Field label="Número da conta">
            <Input value={form.numeroConta} onChange={(e) => patchForm('numeroConta', e.target.value)} />
          </Field>
          <Field label="Tipo">
            <Select value={form.tipoConta} onChange={(e) => patchForm('tipoConta', e.target.value)}>
              {tipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="CPF/CNPJ do titular">
            <Input value={form.cpfCnpjTitular} onChange={(e) => patchForm('cpfCnpjTitular', e.target.value)} />
          </Field>
          <Field label="Titular">
            <Input value={form.nomeTitular} onChange={(e) => patchForm('nomeTitular', e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={form.ativo ? 'true' : 'false'} onChange={(e) => patchForm('ativo', e.target.value === 'true')}>
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </Select>
          </Field>
          {formErro ? <p className="t-body text-erro">{formErro}</p> : null}
        </form>
      </Modal>
      <Modal
        title="Excluir conta bancária"
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
        <p className="t-body">
          Excluir {pendingDelete?.bank} {pendingDelete?.number}? Contas com operações vinculadas não podem ser removidas.
        </p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function OpenFinancePage() {
  const { config, saveConfig, recordAudit } = useAppViewModel()
  const [toast, setToast] = useState(null)
  const [provider, setProvider] = useState(config.openFinance.provider)
  const status = configStatusMeta(config.openFinance.status)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Open Finance" subtitle="Parâmetros locais do provedor. A autorização das contas é feita em Conexões bancárias." />
      <ConfigCrumbs current="Open Finance" />
      <Banner tone="info" className="mb-4">
        Integração ainda não operacional. Os valores ficam só neste dispositivo.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="t-h3">Provedor</h2>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <Field label="Provedor">
          <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="">Selecionar depois</option>
            <option value="pluggy">Provedor compatível (a definir)</option>
            <option value="proprio">Implementação autorizada própria</option>
          </Select>
        </Field>
        <p className="t-apoio">
          {config.openFinance.clientIdMasked
            ? `Client ID mascarado: ${config.openFinance.clientIdMasked}`
            : 'Nenhuma credencial técnica.'}
        </p>
        {config.openFinance.lastError ? <Banner tone="error">{config.openFinance.lastError}</Banner> : null}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              saveConfig({
                openFinance: {
                  ...config.openFinance,
                  provider,
                  status: provider ? 'configurado' : 'nao_configurado',
                },
              })
              recordAudit({
                action: 'Parâmetros Open Finance',
                entity: 'Integração',
                before: config.openFinance.provider || 'vazio',
                after: provider || 'vazio',
                reason: 'Somente configuração local.',
              })
              setToast('Parâmetros salvos neste dispositivo.')
            }}
          >
            Salvar
          </Button>
        </div>
        <CardAlso>
          <Link to="/configuracoes/credenciais">
            <Button variant="secondary">Credenciais</Button>
          </Link>
          <Link to="/conexoes">
            <Button variant="secondary">Contas conectadas</Button>
          </Link>
        </CardAlso>
      </Card>
      <Toast message={toast} />
    </div>
  )
}
