import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Badge, Banner, Button, Card, Empty, Field, Input, Kpi, Modal, PageHeader, Select, Table, Td, Kv, Toast } from '@/components/ui'
import { GROUP_NAME, companies, permissionModules, permissions, roleLabels, users } from '@/data/fixtures'
import { useApp } from '@/state/AppContext'

export function ConfigHomePage() {
  const { session } = useApp()
  const admin = session?.role === 'administrador'
  const items = admin
    ? [
        ['Meu perfil', '/configuracoes/perfil'],
        ['Preferências', '/configuracoes/preferencias'],
        ['Segurança', '/configuracoes/seguranca'],
        ['Cadastro de usuários', '/configuracoes/usuarios'],
        ['Permissões', '/configuracoes/permissoes'],
        ['Organização', '/configuracoes/organizacao'],
        ['Open Finance', '/configuracoes/open-finance'],
        ['API de IA', '/configuracoes/ia'],
        ['Regras financeiras', '/configuracoes/regras'],
        ['Auditoria', '/configuracoes/auditoria'],
      ]
    : [
        ['Meu perfil', '/configuracoes/perfil'],
        ['Preferências', '/configuracoes/preferencias'],
        ['Segurança', '/configuracoes/seguranca'],
      ]
  return (
    <div>
      <PageHeader kicker="Configuração" title="Configurações" subtitle="Perfil, acesso, Open Finance e preferências da organização." />
      <div className="grid gap-3 md:grid-cols-2">
        {items.map(([label, to]) => (
          <Link key={to} to={to} className="block">
            <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-borda-forte hover:bg-superficie-2">
              <h3 className="t-h3">{label}</h3>
              <ChevronRight size={16} className="text-faint" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PerfilPage() {
  const { session } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Meu perfil" />
      <Card className="max-w-xl space-y-4">
        <Field label="Nome"><Input defaultValue={session?.name} /></Field>
        <Field label="E-mail"><Input defaultValue={session?.email} /></Field>
        <Field label="Telefone"><Input defaultValue="(11) 98800-1000" /></Field>
        <p className="t-apoio">Tema, idioma e alertas ficam em Preferências. A autenticação continua a usar o e-mail da sessão.</p>
        <div className="flex gap-2">
          <Button onClick={() => setToast('Perfil salvo neste dispositivo.')}>Salvar</Button>
          <Link to="/configuracoes/preferencias"><Button variant="secondary">Preferências</Button></Link>
          <Link to="/configuracoes/seguranca"><Button variant="secondary">Segurança</Button></Link>
        </div>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function PreferenciasPage() {
  const { config, saveConfig } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Preferências" subtitle="Tema, alertas e uso geral. As escolhas ficam neste navegador." />
      <Card className="max-w-xl space-y-4">
        <Field label="Tema">
          <Select value={config.theme} onChange={(e) => saveConfig({ theme: e.target.value as 'light' | 'dark' })}>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </Select>
        </Field>
        <h2 className="t-h3 pt-2">Notificações</h2>
        <label className="t-body flex gap-2">
          <input type="checkbox" checked={config.notifications.inApp} onChange={(e) => saveConfig({ notifications: { ...config.notifications, inApp: e.target.checked } })} />
          Alertas no aplicativo
        </label>
        <label className="t-body flex gap-2">
          <input type="checkbox" checked={config.notifications.email} onChange={(e) => saveConfig({ notifications: { ...config.notifications, email: e.target.checked } })} />
          Resumo por e-mail (quando o envio estiver configurado)
        </label>
        {Object.entries({ financeiro: 'Financeiro', conciliacao: 'Conciliação', classificacao: 'Classificação', integracao: 'Conexões bancárias' }).map(([key, label]) => (
          <label key={key} className="t-body flex gap-2">
            <input
              type="checkbox"
              checked={config.notifications.kinds[key as keyof typeof config.notifications.kinds]}
              onChange={(e) => saveConfig({
                notifications: {
                  ...config.notifications,
                  kinds: { ...config.notifications.kinds, [key]: e.target.checked },
                },
              })}
            />
            {label}
          </label>
        ))}
        <Button onClick={() => setToast('Preferências salvas neste dispositivo.')}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function SegurancaPage() {
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Segurança" subtitle="Sessão, autenticação em duas etapas e dispositivos." />
      <Card className="max-w-xl space-y-4">
        <Field label="Senha atual"><Input type="password" /></Field>
        <Field label="Nova senha"><Input type="password" /></Field>
        <Button onClick={() => setToast('Senha alterada neste ambiente de demonstração.')}>Alterar senha</Button>
        <Banner tone="info">
          MFA ainda não está vinculado a um autenticador real. O login pede um código de 6 dígitos só neste fluxo de demonstração.
        </Banner>
        <Link className="t-label block" to="/authenticator">Abrir tela de configuração de MFA (demonstração)</Link>
        <h2 className="t-h2 pt-4">Sessões</h2>
        <p className="t-body">Navegador atual · sessão local</p>
        <Button variant="secondary" onClick={() => setToast('Outras sessões não são rastreadas neste frontend. Encerrar aqui limpa só este dispositivo.')}>Encerrar sessão deste dispositivo</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function UsuariosPage() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const { setInviteUserNote } = useApp()
  const rows = users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <div>
      <PageHeader kicker="Configuração" title="Usuários" subtitle="Acesso à organização. Permissões valem na interface; o backend ainda não aplica autorização." actions={<Button onClick={() => setOpen(true)}>Convidar</Button>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Kpi label="Total" value={String(users.length)} />
        <Kpi label="Ativos" value={String(users.filter((u) => u.status === 'ativo').length)} />
        <Kpi label="Inativos / convite" value={String(users.filter((u) => u.status !== 'ativo').length)} />
      </div>
      <Table
        columns={['Nome', 'E-mail', 'Perfil', 'Status']}
        empty={!rows.length ? <Empty>Nenhum usuário neste filtro.</Empty> : null}
        footer={<span>Exibindo {rows.length} de {users.length} usuários</span>}
        toolbar={
          <Input className="max-w-md" placeholder="Buscar nome, e-mail ou perfil" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar usuários" />
        }
      >
        {rows.map((u) => (
          <tr key={u.id}>
            <Td><Link to={`/configuracoes/usuarios/${u.id}`}>{u.name}</Link></Td>
            <Td>{u.email}</Td>
            <Td>{roleLabels[u.role]}</Td>
            <Td><Badge tone={u.status === 'ativo' ? 'success' : 'warning'}>{u.status}</Badge></Td>
          </tr>
        ))}
      </Table>
      <div className="mt-4"><Link className="t-label" to="/configuracoes/permissoes">Perfis e permissões</Link></div>
      <Modal title="Convidar usuário" open={open} onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={() => { setInviteUserNote('Convite enviado.'); setToast('Convite enviado.'); setOpen(false) }}>Enviar convite</Button></>}>
        <div className="space-y-4">
          <Field label="Nome"><Input /></Field>
          <Field label="E-mail"><Input type="email" /></Field>
          <Field label="Perfil"><Select>{Object.entries(roleLabels).map(([k, v]) => <option key={k}>{v}</option>)}</Select></Field>
        </div>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function UsuarioEditarPage() {
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Editar usuário" />
      <Card className="max-w-xl space-y-4">
        <Field label="Nome"><Input defaultValue="Gabriela Veríssimo" /></Field>
        <Field label="Perfil"><Select>{Object.entries(roleLabels).map(([k, v]) => <option key={k}>{v}</option>)}</Select></Field>
        <Field label="Status"><Select><option>Ativo</option><option>Inativo</option></Select></Field>
        <Button onClick={() => setToast('Usuário salvo.')}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function PermissoesPage() {
  return (
    <div>
      <PageHeader kicker="Configuração" title="Perfis e permissões" />
      <Table columns={['Módulo', ...Object.values(roleLabels)]}>
        {permissionModules.map((m, i) => (
          <tr key={m}>
            <Td>{m}</Td>
            {Object.keys(roleLabels).map((r) => <Td key={r}>{permissions[r][i]}</Td>)}
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function OrganizacaoPage() {
  return (
    <div>
      <PageHeader kicker="Configuração" title="Organização" />
      <Card>
        <Kv items={[{ label: 'Nome', value: GROUP_NAME }, { label: 'CNPJs', value: String(companies.length) }]} />
        <div className="mt-4 flex gap-3">
          <Link className="t-label" to="/configuracoes/cnpjs">CNPJs</Link>
          <Link className="t-label" to="/configuracoes/moeda">Moeda e fuso</Link>
        </div>
      </Card>
    </div>
  )
}
