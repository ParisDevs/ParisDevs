import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge, Banner, Button, Card, Empty, Field, Input, Kpi, Modal, PageHeader, Select, Table, Td, Kv, Toast } from '@/views/ui'
import { CARGOS, cargoLabel } from '@/models/domain/usuario'
import { PERMISSION_CARGOS, PERMISSION_MODULES, permissionLabel, permissionLevel } from '@/models/domain/configuracao'
import { initials } from '@/lib/format'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { useUsuariosViewModel } from '@/viewmodels/configuracao/useUsuariosViewModel'
import { useConfiguracaoViewModel } from '@/viewmodels/configuracao/useConfiguracaoViewModel'
import { usePerfilViewModel } from '@/viewmodels/configuracao/usePerfilViewModel'
import { useOrganizacaoViewModel } from '@/viewmodels/configuracao/useOrganizacaoViewModel'
import {
  EXERCICIOS_FISCAIS,
  FUSOS,
  PLANOS_CONTAS,
  REGIMES_TRIBUTARIOS,
  UFS,
  formatCnpj,
} from '@/models/domain/filial'
import { CardAlso, CheckRow, ConfigCrumbs, SettingsNavCard, SettingsSection } from '@/views/features/configuracao/shell'

function cargoTone(cargo) {
  return cargo === 'ADMINISTRADOR' ? 'success' : 'neutral'
}

export function ConfigHomePage() {
  const { nome, email, cargoNome, filialNome, sections } = useConfiguracaoViewModel()
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Configuração"
        title="Configurações"
        subtitle="Conta, organização e parâmetros locais deste dispositivo. Open Finance ainda não está operacional."
      />
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primaria text-[12px] font-bold text-white">
            {initials(nome || email || 'U')}
          </span>
          <div className="min-w-0">
            <p className="t-h3 truncate">{nome || '—'}</p>
            <p className="t-apoio truncate text-texto-secundario">{email || '—'}</p>
            <p className="t-apoio mt-1 truncate text-faint">
              {cargoNome}
              {filialNome ? ` · ${filialNome}` : ''}
            </p>
          </div>
        </div>
        <Link to="/configuracoes/perfil">
          <Button variant="secondary">Editar perfil</Button>
        </Link>
      </Card>
      {sections.map((section) => (
        <SettingsSection key={section.id} title={section.title}>
          {section.items.map((item) => (
            <SettingsNavCard
              key={item.to}
              to={item.to}
              icon={item.Icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </SettingsSection>
      ))}
    </div>
  )
}

export function PerfilPage() {
  const {
    admin,
    form,
    cargoNome,
    filialNome,
    nomeExibido,
    emailExibido,
    erro,
    formErro,
    toast,
    saving,
    patchForm,
    saveForm,
  } = usePerfilViewModel()

  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="Meu perfil"
        subtitle="Nome e e-mail no cadastro. Cargo e empresa não mudam aqui."
      />
      <ConfigCrumbs current="Meu perfil" />
      <Card className="max-w-xl space-y-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primaria text-[12px] font-bold text-white">
            {initials(nomeExibido || emailExibido || 'U')}
          </span>
          <div className="min-w-0">
            <p className="t-h3 truncate">{nomeExibido || '—'}</p>
            <p className="t-apoio truncate text-texto-secundario">{emailExibido || '—'}</p>
          </div>
        </div>
        {erro ? <p className="t-body text-erro">{erro}</p> : null}
        <form onSubmit={saveForm} className="space-y-4" noValidate>
          <Field label="Nome">
            <Input value={form.nome} onChange={(e) => patchForm('nome', e.target.value)} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={form.email} onChange={(e) => patchForm('email', e.target.value)} />
          </Field>
          <Field label="Cargo">
            <Input value={cargoNome} readOnly />
          </Field>
          <Field label="Filial">
            <Input value={filialNome} readOnly />
          </Field>
          {formErro ? <p className="t-body text-erro">{formErro}</p> : null}
          <Button type="submit" disabled={saving || Boolean(erro)}>
            Salvar
          </Button>
        </form>
        <CardAlso>
          {admin ? (
            <Link to="/configuracoes/usuarios">
              <Button variant="secondary">Cadastro de usuários</Button>
            </Link>
          ) : null}
          <Link to="/configuracoes/preferencias">
            <Button variant="secondary">Preferências</Button>
          </Link>
          <Link to="/configuracoes/seguranca">
            <Button variant="secondary">Segurança</Button>
          </Link>
        </CardAlso>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function PreferenciasPage() {
  const { config, saveConfig } = useAppViewModel()
  const [toast, setToast] = useState(null)
  const kinds = {
    financeiro: 'Financeiro',
    conciliacao: 'Conciliação',
    classificacao: 'Classificação',
    integracao: 'Conexões bancárias',
  }
  return (
    <div>
      <PageHeader kicker="Configuração" title="Preferências" subtitle="Tema, alertas e uso geral. As escolhas ficam neste navegador." />
      <ConfigCrumbs current="Preferências" />
      <Card className="max-w-xl space-y-4">
        <Banner tone="info">Preferências são gravadas só neste dispositivo.</Banner>
        <Field label="Tema">
          <Select value={config.theme} onChange={(e) => saveConfig({ theme: e.target.value })}>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </Select>
        </Field>
        <h2 className="t-h3 pt-2">Notificações</h2>
        <CheckRow
          checked={config.notifications.inApp}
          onChange={(e) => saveConfig({ notifications: { ...config.notifications, inApp: e.target.checked } })}
        >
          Alertas no aplicativo
        </CheckRow>
        <CheckRow
          checked={config.notifications.email}
          onChange={(e) => saveConfig({ notifications: { ...config.notifications, email: e.target.checked } })}
        >
          Resumo por e-mail (quando o envio estiver configurado)
        </CheckRow>
        {Object.entries(kinds).map(([key, label]) => (
          <CheckRow
            key={key}
            checked={!!config.notifications.kinds[key]}
            onChange={(e) => saveConfig({
              notifications: {
                ...config.notifications,
                kinds: { ...config.notifications.kinds, [key]: e.target.checked },
              },
            })}
          >
            {label}
          </CheckRow>
        ))}
        <Button onClick={() => setToast('Preferências salvas neste dispositivo.')}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function SegurancaPage() {
  const { encerrarSessao } = useConfiguracaoViewModel()
  const [senhaAtual, setSenhaAtual] = useState('')
  const [senhaNova, setSenhaNova] = useState('')
  const [toast, setToast] = useState(null)
  return (
    <div className="space-y-4">
      <PageHeader kicker="Configuração" title="Segurança" subtitle="Sessão deste dispositivo. Troca de senha e MFA ainda são demonstração." />
      <ConfigCrumbs current="Segurança" />
      <Card className="max-w-xl space-y-4">
        <h2 className="t-h3">Senha</h2>
        <Banner tone="info">
          A troca de senha não chama a API neste slice. MFA ainda não está vinculado a um autenticador real.
        </Banner>
        <Field label="Senha atual">
          <Input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" />
        </Field>
        <Field label="Nova senha">
          <Input type="password" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} autoComplete="new-password" />
        </Field>
        <Button
          onClick={() => {
            setToast('Senha não é alterada no servidor neste ambiente de demonstração.')
            setSenhaAtual('')
            setSenhaNova('')
          }}
        >
          Alterar senha
        </Button>
        <Link to="/authenticator">
          <Button variant="secondary">Abrir MFA (demonstração)</Button>
        </Link>
      </Card>
      <Card className="max-w-xl space-y-4">
        <h2 className="t-h3">Sessão</h2>
        <p className="t-body text-texto-secundario">Navegador atual · sessão local. Outros dispositivos não são rastreados.</p>
        <Button variant="secondary" onClick={encerrarSessao}>
          Encerrar sessão deste dispositivo
        </Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function UsuariosPage() {
  const {
    q,
    setQ,
    cargo,
    setCargo,
    filialId,
    setFilialId,
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
    requestDelete,
    saving,
    remove,
    empty,
    emptyFiltro,
  } = useUsuariosViewModel()

  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="Usuários"
        subtitle="Cadastro de acesso à organização. Nome, e-mail, cargo e filial no banco."
        actions={<Button onClick={openCreate}>Novo usuário</Button>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Total" value={String(kpis.total)} />
        <Kpi label="Administrador" value={String(kpis.administrador)} />
        <Kpi label="Financeiro" value={String(kpis.financeiro)} />
        <Kpi label="Gerente" value={String(kpis.gerente)} />
        <Kpi label="Contador" value={String(kpis.contador)} />
      </div>
      {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
      {carregando ? <p className="t-body text-texto-secundario">Carregando...</p> : null}
      {!carregando ? (
        <Table
          columns={['Nome', 'E-mail', 'Cargo', 'Filial', 'Ações']}
          empty={
            empty || emptyFiltro ? (
              <Empty action={empty ? <Button onClick={openCreate}>Novo usuário</Button> : undefined}>
                {empty ? 'Nenhum usuário cadastrado.' : 'Nenhum usuário neste filtro.'}
              </Empty>
            ) : null
          }
          footer={<span>Exibindo {rows.length} usuários</span>}
          toolbar={
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                className="max-w-md"
                placeholder="Buscar nome, e-mail ou cargo"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Buscar usuários"
              />
              <Select value={cargo} onChange={(e) => setCargo(e.target.value)} aria-label="Cargo">
                <option value="">Cargo</option>
                {CARGOS.map((c) => (
                  <option key={c} value={c}>
                    {cargoLabel(c)}
                  </option>
                ))}
              </Select>
              <Select value={filialId} onChange={(e) => setFilialId(e.target.value)} aria-label="Filial">
                <option value="">Filial</option>
                {filiais.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </Select>
            </div>
          }
        >
          {rows.map((u) => (
            <tr key={u.id}>
              <Td>{u.nome || '—'}</Td>
              <Td>{u.email || '—'}</Td>
              <Td>
                <Badge tone={cargoTone(u.cargo)}>{cargoLabel(u.cargo)}</Badge>
              </Td>
              <Td>{u.filialNome || '—'}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" className="h-8 px-2" title="Editar" aria-label="Editar" onClick={() => openEdit(u)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" className="h-8 px-2" title="Excluir" aria-label="Excluir" onClick={() => requestDelete(u)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
      <div className="mt-4">
        <Link className="t-label" to="/configuracoes/permissoes">
          Perfis e permissões
        </Link>
      </div>
      <Modal
        title={formMode === 'criar' ? 'Novo usuário' : 'Editar usuário'}
        subtitle={
          formMode === 'criar'
            ? 'Informe os dados de acesso. A senha é a mesma usada no login.'
            : 'Altere os dados. Deixe a senha em branco para manter a atual.'
        }
        open={!!formMode}
        onClose={closeForm}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" form="usuario-form-dialog" disabled={saving}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="usuario-form-dialog" onSubmit={saveForm} className="space-y-4" noValidate>
          <Field label="Nome">
            <Input value={form.nome} onChange={(e) => patchForm('nome', e.target.value)} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={form.email} onChange={(e) => patchForm('email', e.target.value)} />
          </Field>
          <Field label="Senha">
            <Input
              type="password"
              value={form.senha}
              onChange={(e) => patchForm('senha', e.target.value)}
              placeholder={formMode === 'editar' ? 'Deixe em branco para manter' : ''}
              autoComplete={formMode === 'criar' ? 'new-password' : 'off'}
            />
          </Field>
          <Field label="Cargo">
            <Select value={form.cargo} onChange={(e) => patchForm('cargo', e.target.value)}>
              {CARGOS.map((c) => (
                <option key={c} value={c}>
                  {cargoLabel(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Filial">
            <Select value={form.idFilial} onChange={(e) => patchForm('idFilial', e.target.value)}>
              <option value="">Selecione a filial</option>
              {filiais.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </Select>
          </Field>
          {formErro ? <p className="t-body text-erro">{formErro}</p> : null}
        </form>
      </Modal>
      <Modal
        title="Excluir usuário"
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
          Deseja excluir {pendingDelete?.nome ? pendingDelete.nome : 'este usuário'}? A ação não pode ser desfeita.
        </p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function UsuarioEditarPage() {
  const { id } = useParams()
  return <Navigate to="/configuracoes/usuarios" replace state={{ editar: id }} />
}

export function PermissoesPage() {
  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="Perfis e permissões"
        subtitle="Matriz ilustrativa pelos cargos do cadastro. Nada é gravado no banco."
      />
      <ConfigCrumbs current="Permissões" />
      <Banner tone="info" className="mb-4">
        O acesso real segue o cargo do usuário. Esta tabela não persiste permissão.
      </Banner>
      <Table columns={['Módulo', ...PERMISSION_CARGOS.map(cargoLabel)]}>
        {PERMISSION_MODULES.map((modulo, i) => (
          <tr key={modulo}>
            <Td>{modulo}</Td>
            {PERMISSION_CARGOS.map((cargo) => (
              <Td key={cargo}>{permissionLabel(permissionLevel(cargo, i))}</Td>
            ))}
          </tr>
        ))}
      </Table>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="t-label tracking-[0.08em] text-texto-secundario uppercase">{title}</h3>
      {children}
    </div>
  )
}

export function OrganizacaoPage() {
  const {
    admin,
    groupName,
    q,
    setQ,
    rows,
    total,
    carregando,
    erro,
    toast,
    formMode,
    form,
    formErro,
    formInfo,
    patchForm,
    consultarCep,
    consultarCnpj,
    buscandoCep,
    buscandoCnpj,
    openCreate,
    openEdit,
    closeForm,
    saveForm,
    pendingDelete,
    setPendingDelete,
    requestDelete,
    saving,
    remove,
    empty,
    emptyFiltro,
  } = useOrganizacaoViewModel()

  if (!admin) {
    return (
      <div>
        <PageHeader kicker="Configuração" title="Organização" />
        <ConfigCrumbs current="Organização" />
        <Empty>
          Sem permissão.
        </Empty>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="Organização"
        subtitle="Cadastro das empresas do grupo. O seletor da topbar usa esta lista."
        actions={<Button onClick={openCreate}>Nova empresa</Button>}
      />
      <ConfigCrumbs current="Organização" />
      <Card className="mb-4 max-w-2xl space-y-4">
        <Kv
          items={[
            { label: 'Nome', value: groupName },
            { label: 'Empresas', value: String(total) },
          ]}
        />
        <CardAlso>
          <Link to="/configuracoes/cnpjs">
            <Button variant="secondary">CNPJs</Button>
          </Link>
          <Link to="/configuracoes/moeda">
            <Button variant="secondary">Moeda e fuso</Button>
          </Link>
        </CardAlso>
      </Card>
      {erro ? <p className="t-body mb-4 text-erro">{erro}</p> : null}
      {carregando ? <p className="t-body text-texto-secundario">Carregando...</p> : null}
      {!carregando ? (
        <Table
          columns={['Razão social', 'CNPJ', 'Cidade', 'Ações']}
          empty={
            empty || emptyFiltro ? (
              <Empty action={empty ? <Button onClick={openCreate}>Nova empresa</Button> : undefined}>
                {empty ? 'Nenhuma empresa cadastrada.' : 'Nenhuma empresa neste filtro.'}
              </Empty>
            ) : null
          }
          footer={<span>Exibindo {rows.length} empresas</span>}
          toolbar={
            <Input
              className="max-w-md"
              placeholder="Buscar razão social ou CNPJ"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar empresas"
            />
          }
        >
          {rows.map((f) => (
            <tr key={f.id}>
              <Td>{f.razaoSocial || '—'}</Td>
              <Td nowrap>{formatCnpj(f.cnpj) || '—'}</Td>
              <Td>{f.cidade ? `${f.cidade}/${f.uf || ''}`.replace(/\/$/, '') : f.endereco || '—'}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" className="h-8 px-2" title="Editar" aria-label="Editar" onClick={() => openEdit(f)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" className="h-8 px-2" title="Excluir" aria-label="Excluir" onClick={() => requestDelete(f)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
      <Modal
        wide
        title={formMode === 'criar' ? 'Nova empresa' : 'Editar empresa'}
        subtitle="Cadastro da unidade no Grupo Paris 6. A situação cadastral vem da consulta pública ao CNPJ."
        open={!!formMode}
        onClose={closeForm}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" form="empresa-form-dialog" disabled={saving}>
              Salvar
            </Button>
          </>
        }
      >
        <form id="empresa-form-dialog" onSubmit={saveForm} className="space-y-6" noValidate>
          <FormSection title="Dados da empresa">
            <Field label="Razão social *">
              <Input value={form.razaoSocial} onChange={(e) => patchForm('razaoSocial', e.target.value)} />
            </Field>
            <Field label="Nome fantasia *">
              <Input value={form.nomeFantasia} onChange={(e) => patchForm('nomeFantasia', e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field label="CNPJ *">
                <Input value={form.cnpj} onChange={(e) => patchForm('cnpj', e.target.value)} inputMode="numeric" />
              </Field>
              <Button type="button" variant="secondary" onClick={() => consultarCnpj()} disabled={buscandoCnpj}>
                {buscandoCnpj ? 'Consultando...' : 'Consultar CNPJ'}
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Inscrição estadual">
                <Input value={form.inscricaoEstadual} onChange={(e) => patchForm('inscricaoEstadual', e.target.value)} />
              </Field>
              <Field label="Inscrição municipal">
                <Input value={form.inscricaoMunicipal} onChange={(e) => patchForm('inscricaoMunicipal', e.target.value)} />
              </Field>
            </div>
            <Field label="Regime tributário *">
              <Select value={form.regimeTributario} onChange={(e) => patchForm('regimeTributario', e.target.value)}>
                {REGIMES_TRIBUTARIOS.map((regime) => (
                  <option key={regime} value={regime}>
                    {regime}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="CNAE principal">
              <Input value={form.cnaePrincipal} onChange={(e) => patchForm('cnaePrincipal', e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Data de abertura">
                <Input type="date" value={form.dataAbertura} onChange={(e) => patchForm('dataAbertura', e.target.value)} />
              </Field>
              <Field label="Situação cadastral">
                <Input value={form.situacaoCadastral} readOnly />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Endereço">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field label="CEP *">
                <Input value={form.cep} onChange={(e) => patchForm('cep', e.target.value)} inputMode="numeric" />
              </Field>
              <Button type="button" variant="secondary" onClick={() => consultarCep()} disabled={buscandoCep}>
                {buscandoCep ? 'Buscando...' : 'Buscar CEP'}
              </Button>
            </div>
            <Field label="Logradouro *">
              <Input value={form.logradouro} onChange={(e) => patchForm('logradouro', e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Número *">
                <Input value={form.numero} onChange={(e) => patchForm('numero', e.target.value)} />
              </Field>
              <Field label="Complemento">
                <Input value={form.complemento} onChange={(e) => patchForm('complemento', e.target.value)} />
              </Field>
              <Field label="Bairro *">
                <Input value={form.bairro} onChange={(e) => patchForm('bairro', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Cidade *">
                <Input value={form.cidade} onChange={(e) => patchForm('cidade', e.target.value)} />
              </Field>
              <Field label="Estado (UF) *">
                <Select value={form.uf} onChange={(e) => patchForm('uf', e.target.value)}>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="País *">
                <Input value={form.pais} onChange={(e) => patchForm('pais', e.target.value)} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Responsável pela empresa">
            <Field label="Nome completo *">
              <Input value={form.responsavelNome} onChange={(e) => patchForm('responsavelNome', e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CPF *">
                <Input value={form.responsavelCpf} onChange={(e) => patchForm('responsavelCpf', e.target.value)} inputMode="numeric" />
              </Field>
              <Field label="Telefone *">
                <Input value={form.responsavelTelefone} onChange={(e) => patchForm('responsavelTelefone', e.target.value)} inputMode="tel" />
              </Field>
            </div>
            <Field label="E-mail corporativo *">
              <Input type="email" value={form.responsavelEmail} onChange={(e) => patchForm('responsavelEmail', e.target.value)} />
            </Field>
            <Field label="Cargo ou função *">
              <Input value={form.responsavelCargo} onChange={(e) => patchForm('responsavelCargo', e.target.value)} />
            </Field>
          </FormSection>

          <FormSection title="Configurações financeiras">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Moeda padrão *">
                <Select value={form.moedaPadrao} onChange={(e) => patchForm('moedaPadrao', e.target.value)}>
                  <option value="BRL">BRL — Real</option>
                </Select>
              </Field>
              <Field label="Fuso horário *">
                <Select value={form.fusoHorario} onChange={(e) => patchForm('fusoHorario', e.target.value)}>
                  {FUSOS.map((fuso) => (
                    <option key={fuso} value={fuso}>
                      {fuso}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Plano de contas *">
              <Select value={form.planoContas} onChange={(e) => patchForm('planoContas', e.target.value)}>
                {PLANOS_CONTAS.map((plano) => (
                  <option key={plano} value={plano}>
                    {plano}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Início da operação no sistema *">
                <Input type="date" value={form.dataInicioOperacao} onChange={(e) => patchForm('dataInicioOperacao', e.target.value)} />
              </Field>
              <Field label="Exercício fiscal *">
                <Select value={form.exercicioFiscal} onChange={(e) => patchForm('exercicioFiscal', e.target.value)}>
                  {EXERCICIOS_FISCAIS.map((exercicio) => (
                    <option key={exercicio} value={exercicio}>
                      {exercicio}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Centro de custo padrão">
              <Input value={form.centroCustoPadrao} onChange={(e) => patchForm('centroCustoPadrao', e.target.value)} />
            </Field>
            <Field label="Empresas e filiais vinculadas">
              <Input value={form.empresasVinculadas} onChange={(e) => patchForm('empresasVinculadas', e.target.value)} />
            </Field>
          </FormSection>
          {formInfo ? <p className="t-apoio text-texto-secundario">{formInfo}</p> : null}
          {formErro ? <p className="t-body text-erro">{formErro}</p> : null}
        </form>
      </Modal>
      <Modal
        title="Excluir empresa"
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
          Deseja excluir {pendingDelete?.razaoSocial ? pendingDelete.razaoSocial : 'esta empresa'}? A ação não pode ser desfeita.
        </p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}
