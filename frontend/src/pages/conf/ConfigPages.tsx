import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner, Badge, Button, Card, Drawer, Empty, Field, Input, Modal, PageHeader, Select, Table, Td, Kv, Toast } from '@/components/ui'
import { GROUP_NAME, accounts, companies, permissionModules, permissions, roleLabels, users } from '@/data/fixtures'
import { useApp } from '@/state/AppContext'

export function ConfigHomePage() {
  const { session } = useApp()
  const admin = session?.role === 'administrador'
  const items = admin
    ? [
        ['Meu perfil', '/configuracoes/perfil'],
        ['Segurança', '/configuracoes/seguranca'],
        ['Cadastro de usuários', '/configuracoes/usuarios'],
        ['Organização', '/configuracoes/organizacao'],
        ['Bancos', '/configuracoes/bancos'],
        ['Conexão com APIs', '/configuracoes/open-finance'],
        ['Integrações / API keys', '/configuracoes/credenciais'],
        ['Classificação', '/configuracoes/ia'],
        ['Regras financeiras', '/configuracoes/regras'],
        ['Auditoria', '/configuracoes/auditoria'],
      ]
    : [
        ['Meu perfil', '/configuracoes/perfil'],
        ['Segurança', '/configuracoes/seguranca'],
      ]
  return (
    <div>
      <PageHeader title="Configurações" />
      <div className="grid gap-3 md:grid-cols-2">
        {items.map(([label, to]) => (
          <Link key={to} to={to}>
            <Card>
              <h3 className="t-h3">{label}</h3>
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
      <PageHeader title="Meu perfil" />
      <Card className="max-w-xl space-y-4">
        <Field label="Nome"><Input defaultValue={session?.name} /></Field>
        <Field label="E-mail"><Input defaultValue={session?.email} /></Field>
        <Field label="Telefone"><Input defaultValue="(11) 98800-1000" /></Field>
        <Field label="Preferências"><Select><option>Português (Brasil)</option></Select></Field>
        <div className="flex gap-2">
          <Button onClick={() => setToast('Perfil salvo.')}>Salvar</Button>
          <Link to="/configuracoes/seguranca"><Button variant="secondary">Segurança</Button></Link>
        </div>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function SegurancaPage() {
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="Segurança" />
      <Card className="max-w-xl space-y-4">
        <Field label="Senha atual"><Input type="password" /></Field>
        <Field label="Nova senha"><Input type="password" /></Field>
        <Button onClick={() => setToast('Senha alterada.')}>Alterar senha</Button>
        <Link className="t-label block" to="/authenticator">Configurar MFA</Link>
        <h2 className="t-h2 pt-4">Sessões</h2>
        <p className="t-body">Navegador atual · agora</p>
        <Button variant="secondary">Encerrar outras sessões</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function UsuariosPage() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const { setInviteUserNote } = useApp()
  return (
    <div>
      <PageHeader title="Usuários" actions={<Button onClick={() => setOpen(true)}>Convidar</Button>} />
      <Table columns={['Nome', 'E-mail', 'Perfil', 'Status']}>
        {users.map((u) => (
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
      <PageHeader title="Editar usuário" />
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
      <PageHeader title="Perfis e permissões" />
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
      <PageHeader title="Organização" />
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

export function CnpjsPage() {
  return (
    <div>
      <PageHeader title="CNPJs" actions={<Link to="/configuracoes/cnpjs/novo"><Button>Adicionar CNPJ</Button></Link>} />
      <Table columns={['Empresa', 'CNPJ', 'Cidade']}>
        {companies.map((c) => <tr key={c.id}><Td><Link to={`/configuracoes/cnpjs/${c.id}`}>{c.name}</Link></Td><Td nowrap>{c.cnpj}</Td><Td>{c.city}</Td></tr>)}
      </Table>
    </div>
  )
}

export function CnpjFormPage() {
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')
  return (
    <div>
      <PageHeader title="CNPJ" />
      <Card className="max-w-xl space-y-4">
        <Field label="Razão social"><Input /></Field>
        <Field label="CNPJ" error={error}><Input onChange={() => setError('')} /></Field>
        <Button onClick={() => {
          setError('CNPJ inválido.')
          setToast('')
        }}>Salvar</Button>
      </Card>
      <Toast message={toast || null} />
    </div>
  )
}

export function BancosPage() {
  return (
    <div>
      <PageHeader title="Bancos" />
      <Table columns={['Banco', 'Contas']}>
        {[...new Set(accounts.map((a) => a.bank))].map((b) => (
          <tr key={b}><Td>{b}</Td><Td>{accounts.filter((a) => a.bank === b).length}</Td></tr>
        ))}
      </Table>
      <div className="mt-4 flex gap-3">
        <Link className="t-label" to="/configuracoes/contas">Contas bancárias</Link>
        <Link className="t-label" to="/configuracoes/open-finance">Open Finance</Link>
      </div>
    </div>
  )
}

export function ContasBancariasPage() {
  return (
    <div>
      <PageHeader title="Contas bancárias" />
      <Table columns={['Banco', 'Conta', 'CNPJ', 'Saldo', 'Status']}>
        {accounts.map((a) => (
          <tr key={a.id}>
            <Td>{a.bank}</Td>
            <Td>{a.number}</Td>
            <Td>{companies.find((c) => c.id === a.companyId)?.code}</Td>
            <Td className="num">{a.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Td>
            <Td>{a.status === 'ok' ? 'Sincronizada' : a.status === 'erro' ? 'Erro de conexão' : 'Sincronização atrasada'}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function OpenFinancePage() {
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="Open Finance" />
      <Table columns={['Banco', 'Conta', 'Última sincronização', 'Consentimento', '']}>
        {accounts.map((a) => (
          <tr key={a.id}>
            <Td>{a.bank}</Td>
            <Td>{a.number}</Td>
            <Td>{a.lastSync.replace('T', ' ').slice(0, 16)}</Td>
            <Td>{a.consentUntil}</Td>
            <Td><Button variant="secondary" onClick={() => setToast('Sincronizando')}>Sincronizar</Button></Td>
          </tr>
        ))}
      </Table>
      <Toast message={toast} />
    </div>
  )
}

export function ErpPage() {
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="Integrações ERP" />
      <Card className="max-w-xl space-y-4">
        <Field label="ERP"><Select><option>Nenhum</option><option>Omie</option><option>Conta Azul</option></Select></Field>
        <Button onClick={() => setToast('Sincronização configurada.')}>Salvar</Button>
        <Link className="t-label block" to="/configuracoes/credenciais">Credenciais</Link>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function CredenciaisPage() {
  const [secret, setSecret] = useState<string | null>(null)
  const [status, setStatus] = useState<'none' | 'ativa' | 'revogada'>('none')
  return (
    <div>
      <PageHeader title="Credenciais" />
      {status === 'none' ? <Empty>Nenhuma credencial gerada.</Empty> : <p className="t-body mb-4">Status: {status === 'ativa' ? 'Ativa' : 'Revogada'}</p>}
      {secret ? <Banner className="mb-4">Copie o segredo agora. Ele não será exibido de novo. · {secret}</Banner> : null}
      <div className="flex gap-2">
        <Button onClick={() => { setSecret('pd_live_' + Date.now().toString(36)); setStatus('ativa') }}>Gerar credencial</Button>
        <Button variant="secondary" onClick={() => { setStatus('revogada'); setSecret(null) }}>Revogar</Button>
      </div>
    </div>
  )
}

export function IaConfigPage() {
  const { config, saveConfig } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="Classificação" />
      <Card className="max-w-xl space-y-4">
        <label className="t-body flex gap-2"><input type="checkbox" defaultChecked={config.useRules} onChange={(e) => saveConfig({ useRules: e.target.checked })} />Usar regras</label>
        <label className="t-body flex gap-2"><input type="checkbox" defaultChecked={config.useHistory} onChange={(e) => saveConfig({ useHistory: e.target.checked })} />Usar histórico do fornecedor</label>
        <label className="t-body flex gap-2"><input type="checkbox" defaultChecked={config.requireHuman} onChange={(e) => saveConfig({ requireHuman: e.target.checked })} />Exigir revisão humana</label>
        <p className="t-apoio">A chave do provedor não fica nesta tela.</p>
        <div className="flex gap-3">
          <Link className="t-label" to="/configuracoes/limites">Limites de confiança</Link>
          <Link className="t-label" to="/regras-classificacao">Regras de classificação</Link>
        </div>
        <Button onClick={() => setToast('Preferências da organização salvas.')}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function LimitesPage() {
  const { config, saveConfig } = useApp()
  const [auto, setAuto] = useState(config.thresholds.auto)
  const [suggest, setSuggest] = useState(config.thresholds.suggest)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="Limites de confiança" />
      <Card className="max-w-xl space-y-4">
        <Field label="Classificação automática"><Input type="number" value={auto} onChange={(e) => setAuto(Number(e.target.value))} /></Field>
        <p className="t-apoio">A partir de {auto}%</p>
        <Field label="Sugestão para aprovação"><Input type="number" value={suggest} onChange={(e) => setSuggest(Number(e.target.value))} /></Field>
        <p className="t-apoio">De {suggest}% a {auto - 1}%</p>
        <Field label="Revisão obrigatória"><Input readOnly value={`Abaixo de ${suggest}%`} /></Field>
        {error ? <p className="t-body text-erro">{error}</p> : null}
        <Button onClick={() => {
          if (suggest >= auto) { setError('As faixas não podem se sobrepor.'); return }
          saveConfig({ thresholds: { auto, suggest } })
          setError('')
          setToast('Preferências da organização salvas.')
        }}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function RegrasFinPage() {
  const { config, saveConfig } = useApp()
  const [limit, setLimit] = useState(String(config.financialRules[0]?.limit ?? ''))
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="Regras financeiras" />
      <Card className="max-w-xl space-y-4">
        <p className="t-body">Mercadorias + mão de obra ≤ percentual da receita</p>
        <Field label="Contas da fórmula"><Input readOnly value="Mercadorias + Mão de obra" /></Field>
        <Field label="Limite (%)" error={error}><Input value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
        <Field label="Aplicar a"><Select><option>CNPJ</option><option>Grupo</option></Select></Field>
        <Button onClick={() => {
          if (!limit) { setError('Informe o limite.'); return }
          saveConfig({ financialRules: config.financialRules.map((r, i) => i === 0 ? { ...r, limit: Number(limit) } : r) })
          setToast('Preferências da organização salvas.')
        }}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function MoedaPage() {
  const { saveConfig } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="Moeda e fuso" />
      <Card className="max-w-xl space-y-4">
        <Field label="Moeda"><Select defaultValue="BRL"><option value="BRL">Real (BRL)</option></Select></Field>
        <Field label="Fuso horário fiscal"><Select defaultValue="America/Sao_Paulo"><option>America/Sao_Paulo</option></Select></Field>
        <Button onClick={() => { saveConfig({ currency: 'BRL', timezone: 'America/Sao_Paulo' }); setToast('Preferências da organização salvas.') }}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function PlanoPadraoPage() {
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader title="Plano de contas padrão" />
      <Card className="max-w-xl space-y-4">
        <Field label="Plano por segmento"><Select><option>Restaurante</option><option>Distribuição de alimentos</option></Select></Field>
        <Button onClick={() => setToast('Plano aplicado. Ajuste a árvore em seguida.')}>Aplicar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function AuditoriaPage() {
  const { audit } = useApp()
  const [q, setQ] = useState({ user: '', entity: '' })
  const [open, setOpen] = useState<number | null>(null)
  const rows = audit.filter((a) => (!q.user || a.user.includes(q.user)) && (!q.entity || a.entity.toLowerCase().includes(q.entity.toLowerCase())))
  const item = open !== null ? rows[open] : null
  return (
    <div>
      <PageHeader title="Auditoria" />
      <div className="mb-4 flex gap-3">
        <Input placeholder="Usuário" value={q.user} onChange={(e) => setQ({ ...q, user: e.target.value })} />
        <Input placeholder="Entidade" value={q.entity} onChange={(e) => setQ({ ...q, entity: e.target.value })} />
      </div>
      <Table columns={['Quando', 'Quem', 'Entidade', 'O que mudou']} empty={!rows.length ? <Empty>Nenhum registro neste filtro.</Empty> : null}>
        {rows.map((a, i) => (
          <tr key={a.at + i}>
            <Td nowrap><button type="button" onClick={() => setOpen(i)}>{a.at.replace('T', ' ').slice(0, 16)}</button></Td>
            <Td>{a.user}</Td>
            <Td>{a.entity}</Td>
            <Td>{a.action}</Td>
          </tr>
        ))}
      </Table>
      <Drawer title="Detalhe da alteração" open={!!item} onClose={() => setOpen(null)}>
        {item ? (
          <Kv items={[
            { label: 'Usuário', value: item.user },
            { label: 'Data e hora', value: item.at.replace('T', ' ') },
            { label: 'Entidade', value: item.entity },
            { label: 'Valor anterior', value: item.before },
            { label: 'Valor novo', value: item.after },
            { label: 'Classificação anterior', value: item.before },
            { label: 'Classificação nova', value: item.after },
            { label: 'Motivo', value: item.reason || 'Motivo não informado.' },
          ]} />
        ) : null}
      </Drawer>
    </div>
  )
}
